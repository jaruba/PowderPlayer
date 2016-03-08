var osMod = require('opensubtitles-api');
var fs = require('fs');
var parser = require('ultimate-parser');
var needle = require('needle');
var http = require('http');
var retriever = require('subtitles-grouping/lib/retriever');
var worker = require('workerjs');

var objective = {};
var subtitles = {};
var subFinder = false;
var subParser = false;

subtitles.os = new osMod(atob('T3BlblN1YnRpdGxlc1BsYXllciB2NC43'));
subtitles.findHashTime = 0;
subtitles.osCookie = false;

subtitles.fetchOsCookie = function (retryCookie) {
    utils.checkInternet( function (isConnected) {
        if (isConnected) {
            var req = require('http').request({ host: "dl.opensubtitles.org", path: "/en/download/subencoding-utf8/vrf-ef3a1f1e6e/file/1954677189" }, function (res) {
                if (res.headers["set-cookie"] && res.headers["set-cookie"][0]) {
                    var tempCookie = res.headers["set-cookie"][0];
                    subtitles.osCookie = (tempCookie + "").split(";").shift();
                } else if (!res.headers["set-cookie"] && retryCookie) {
                    console.log("fetching OS cookie failed, trying again in 20 sec");
                    setTimeout(function () { subtitles.fetchOsCookie(false) },20000);
                }
            });
            req.end();
        }
    });
}

subtitles.finishedCB = function (subs) {
	if (!subs) {
		player.notify(i18n('No Subtitles Found'));
	} else {
		var vidIndex = dlna.initiated ? dlna.instance.lastIndex : player.currentItem();

		if (player.itemCount() > 0 && !player.itemDesc(vidIndex).setting.checkedSubs) {
			newSettings = player.vlc.playlist.items[vidIndex].setting;
			if (utils.isJsonString(newSettings)) {
				newSettings = JSON.parse(newSettings);
				if (newSettings.subtitles) {
					$.extend( newSettings.subtitles, subs );
				} else {
					newSettings.subtitles = subs;
				}
			} else {
				newSettings = {};
				newSettings.subtitles = subs;
			}
			newSettings.checkedSubs = true;
			setTimeout(function() {
				player.vlc.playlist.items[vidIndex].setting = JSON.stringify(newSettings);
				if (!dlna.initiated) {
					setTimeout(function() { remote.updateVal("subCount",player.subCount()); },100);
					subtitles.updateSub();
					player.wrapper.find(".wcp-show-subtitles").css('display', 'inline-block');
				}
				player.wrapper.find(".wcp-subtitle-but").show(0);
				if (player.fullscreen()) player.notify('<i class="wcp-subtitle-icon-big"></i>');
				else player.notify('<i class="wcp-subtitle-icon"></i>');
			},100);
		}
	}
}

subtitles.fetchSubs = function () {
    
    if (subFinder) subFinder.terminate();

	var vidIndex = dlna.initiated ? dlna.instance.lastIndex : player.currentItem();
	objective = {
		filepath: powGlobals.lists.media[vidIndex].path
	};
	
	if (!dlna.initiated && player.vlc.input.fps) objective.fps = player.vlc.input.fps;

	if (powGlobals.lists.media[vidIndex].byteLength)
		objective.byteLength = powGlobals.lists.media[vidIndex].byteLength;

	if (powGlobals.torrent && powGlobals.torrent.engine && powGlobals.torrent.engine.infoHash) {
		objective.torrentHash = powGlobals.torrent.engine.infoHash;
		objective.isFinished = false;
	}

    objective.filename = parser(objective.filepath).filename();
	objective.cb = subtitles.finishedCB;
    
    subFinder = new worker('../../src/workers/subtitles/find.js', true);
	
    subFinder.addEventListener('message', function (msg) {
        if (msg.data) {
            if (msg.data == 'null') {
                objective.cb('');
            } else {
                objective.cb(msg.data);
            }
            subFinder.terminate();
            subFinder = false;
        }
    });
    
    subFinder.postMessage(objective);
}

subtitles.processSub = function (srt, extension, cb) {

    if (subParser) subParser.terminate();

    subParser = new worker('../../src/workers/subtitles/parse.js', true);
    
    subParser.addEventListener('message', function (msg) {
        if (msg.data) {
            if (msg.data == 'null') {
                cb('');
            } else {
                cb(msg.data);
            }
            subParser.terminate();
            subParser = false;
        }
    });
    
    subParser.postMessage({
        srt: srt,
        extension: extension
    });
    
}

subtitles.loadSubtitle = function (subtitleElement, cb) {
    if (subtitleElement.indexOf("[-alt-]") > -1) {
        var altSub = subtitleElement.split("[-alt-]")[1];
        subtitleElement = subtitleElement.split("[-alt-]")[0];
    }

    var callOpts = {};
    callOpts.host = subtitleElement.replace("http://","").substr(0,subtitleElement.replace("http://","").indexOf("/"));
    callOpts.path = subtitleElement.replace("http://","").substr(subtitleElement.replace("http://","").indexOf("/"));
    if (subtitleElement.replace("http://","").substr(0,subtitleElement.replace("http://","").indexOf("/")) == "dl.opensubtitles.org" && subtitles.osCookie) {
        callOpts.headers = { 'cookie': subtitles.osCookie };
    } else if (subtitleElement.replace("http://","").substr(0,subtitleElement.replace("http://","").indexOf("/")) == "dl.opensubtitles.org") {
        if (altSub) {
          window.torrent.flood.pause();
            retriever.retrieveSrt("http://dl.opensubtitles.org/en/download/file/"+subtitleElement.split('/').pop(), function (err, res) {
              window.torrent.flood.start();
                subtitles.processSub(res, subtitleElement.split('.').pop(), cb);
            },{ charset: localStorage.subEncoding });
        } else
            cb(null);
    } else {
        retriever.retrieveSrt(subtitleElement, function (err, res) {
            subtitles.processSub(res, subtitleElement.split('.').pop(), cb);
        },{ charset: localStorage.subEncoding });
    }
    var resData = "";

  window.torrent.flood.pause();
    var req = http.request(callOpts, function (res) {
        if ([501,410,404].indexOf(res.statusCode) > -1) {
            if (subtitleElement.indexOf('http://dl.opensubtitles.org/en/download/subencoding-utf8/') == 0)
                retriever.retrieveSrt(subtitleElement.replace('/subencoding-utf8/','/file/'), function (err, res) {
                  window.torrent.flood.start();
                    subtitles.processSub(res, subtitleElement.split('.').pop(), cb);
                },{ charset: localStorage.subEncoding });
            else
                cb(null);
        } else {
            
            res.on('data', function (data) {
                resData += data;
            });
            res.on('end', function () {
              window.torrent.flood.start();
                subtitles.processSub(resData, subtitleElement.split('.').pop(), cb);
            });
        }
    });
    req.end();
}

subtitles.findLine = function (subLines, trackSub, subDelay, time) {
    return new Promise(function (resolve, reject) {
        var nowSecond = (time - subDelay) / 1000;
        if (trackSub > -2) {

            var line = -1;
            var os = 0;

            for (os in subLines) {
                if (subLines[os]) {
                    if (os > nowSecond) break;
                    line = os;
                } else {
                    delete subLines[os];
                }
            }

            if (line >= 0) {
                if (line != trackSub) {
                    if ((subLines[line].t.match(new RegExp("<", "g")) || []).length == 2) {
                        if (!(subLines[line].t.substr(0, 1) == "<" && subLines[line].t.slice(-1) == ">"))
                            subLines[line].t = subLines[line].t.replace(/<\/?[^>]+(>|$)/g, "");
                    } else if ((subLines[line].t.match(new RegExp("<", "g")) || []).length > 2)
                        subLines[line].t = subLines[line].t.replace(/<\/?[^>]+(>|$)/g, "");
                        
                    resolve({
                        text: subLines[line].t,
                        trackSub: line
                    });
                } else if (subLines[line].o < nowSecond)
                    resolve({
                        text: ''
                    });

            } else resolve();
        } else resolve();
    });
}

	
subtitles.updateSub = function() {
	if (localStorage.subLang != i18n("None") && player.subTrack() == 0) {
		for (gvn = 1; gvn < player.subCount(); gvn++) {
			if (player.subDesc(gvn).language == localStorage.subLang) {
				player.subTrack(gvn);
				break;
			}
		}
	}
}

subtitles.fetchOsCookie(true);
