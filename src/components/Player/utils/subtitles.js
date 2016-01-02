import osMod from 'opensubtitles-api';
import fs from 'fs';
import parser from './parser';
import needle from 'needle';
import async from 'async';
import webUtil from '../../../utils/webUtil.js';
import http from 'http';
import retriever from 'subtitles-grouping/lib/retriever';
import ls from 'local-storage';

var objective = {};
var checkedFiles = {};
var subtitles = {};

function strip(s){
    return s.replace(/^\s+|\s+$/g,"")
}

function toSeconds(t){
    var s = 0.0;
    if (t) {
        var p = t.split(':');
        t.split(':').forEach( el => {
            s = s * 60 + parseFloat( el.replace(',', '.') );
        });
    }
    return s;
}

subtitles.os = new osMod(atob('T3BlblN1YnRpdGxlc1BsYXllciB2NC43'));
subtitles.findHashTime = 0;
subtitles.osCookie = false;

subtitles.fetchOsCookie = retryCookie => {
    webUtil.checkInternet(function(isConnected) {
        if (isConnected) {
            var req = require('http').request({ host: "dl.opensubtitles.org", path: "/en/download/subencoding-utf8/vrf-ef3a1f1e6e/file/1954677189" },function(res) {
                if (res.headers["set-cookie"] && res.headers["set-cookie"][0]) {
                    var tempCookie = res.headers["set-cookie"][0];
                    subtitles.osCookie = (tempCookie + "").split(";").shift();
                } else if (!res.headers["set-cookie"] && retryCookie) {
                    console.log("fetching OS cookie failed, trying again in 20 sec");
                    setTimeout(function() { subtitles.fetchOsCookie(false) },20000);
                }
            });
            req.end();
        }
    });
}


subtitles.tryLater = hashMs => {
    subtitles.stopTrying();
    subtitles.findHashTime = setTimeout(function() {
        subtitles.findHash();
    }, hashMs);
}

subtitles.byExactHash = (hash, fileSize, tag) => {
    subtitles.os.login().then(function(token){
        var filename = objective.filename;
        
        var searcher = {
            sublanguageid: 'all',
            extensions: ['srt','sub','vtt'],
            hash: hash,
            size: fileSize,
            filename: filename
        };
        
        if (parser(filename).shortSzEp()) {
            searcher.season = parser(filename).season().toString();
            searcher.episode = parser(filename).episode().toString();
        }
        
        if (objective.fps) searcher.fps = objective.fps;

        subtitles.os.search(searcher).then(function(subData) {
            if (Object.keys(subData).length) {
                if (objective.byteLength) {
                    var tempData = window.atob("aHR0cDovL3Bvd2Rlci5tZWRpYS9tZXRhRGF0YS9zZW5kLnBocD9mPQ==")+encodeURIComponent(filename)+window.atob("JmloPQ==")+encodeURIComponent(hash)+window.atob("JnM9")+encodeURIComponent(objective.byteLength);
                    
                    if (objective.torrentHash)
                        tempData += window.atob("Jmg9")+encodeURIComponent(objective.torrentHash);

                    needle.get(tempData, () => {});
                }
                var result = {};
                async.each(subData, (item, callback) => {
                    var vrf = item.url.substr(item.url.indexOf('vrf-'));
                    vrf = vrf.substr(0,vrf.indexOf('/'));
                    result[item.langName+'[lg]'+item.lang] = 'http://dl.opensubtitles.org/en/download/subencoding-utf8/'+vrf+'/file/'+item.url.split('/').pop();
                    callback();
                }, function(err) {
                    objective.cb(result);
                    objective = {};
                });

            } else {
                objective.cb(null);
            }
            return subData;
        }).catch(function(err){
            subtitles.tryLater(15000);
        });
        
        return '';
        
    }).catch(function(err){
        subtitles.tryLater(30000);
    });
}

subtitles.fetchSubs = (newObjective) => {
    subtitles.stopTrying();
    objective = newObjective;
    objective.filename = parser(objective.filepath).filename()
    
    if (!objective.byteLength) {
        objective.byteLength = fs.statSync(objective.filepath).size;
    }

    var url = window.atob("aHR0cDovL3Bvd2Rlci5tZWRpYS9tZXRhRGF0YS9nZXQucGhwP2Y9")+encodeURIComponent(objective.filename)+window.atob("Jmg9")+encodeURIComponent(objective.torrentHash)+window.atob("JnM9")+encodeURIComponent(objective.byteLength);
    
    needle.get(url, (err, res) => {
        if (!err && res && res.body && objective.byteLength && JSON.parse(res.body).filehash) {
            subtitles.byExactHash(res.filehash, objective.byteLength, objective.filename);
        } else {
            subtitles.stopTrying();
            subtitles.findHash();
        }
    });
}

subtitles.findHash = () => {
    var filepath = objective.filepath,
        byteLength = objective.byteLength,
        torrentHash = objective.torrentHash,
        isFinished = objective.isFinished,
        filename = objective.filename;

    if (!checkedFiles[filename])
        checkedFiles[filename] = {};

    if (torrentHash) {
        subtitles.os.extractInfo(filepath).then(function(infos) {
            var hash = infos.moviehash;
            if (isFinished) {
                if (byteLength) subtitles.byExactHash(hash, byteLength, filename);
            } else {
                if (!checkedFiles[filename][hash]) {
                    checkedFiles[filename][hash] = 1;
                    subtitles.stopTrying();
                    subtitles.findHashTime = setTimeout(function() {
                        subtitles.findHash();
                    },10000);
                } else {
                    if (checkedFiles[filename][hash] >= 1) {
                        checkedFiles[filename][hash]++;
                        if (byteLength)
                            subtitles.byExactHash(hash, byteLength, filename);
                        
                    } else checkedFiles[filename][hash]++;
                }
            }
            return '';
        });
    } else {
        subtitles.os.extractInfo(filepath).then(function(infos) {
            if (!byteLength && filepath) {
                fs.stat(filepath, (err, stats) => {
                    if (stats && stats.size)
                        subtitles.byExactHash(infos.moviehash, stats.size, filename);
                })
                byteLength = fs.statSync(filepath).size;
            } else {
                if (!byteLength) byteLength = 0;
                subtitles.byExactHash(infos.moviehash, byteLength, filename);
            }
            return '';
        });
    }
}

subtitles.stopTrying = () => {
    if (subtitles.findHashTime) {
        clearTimeout(subtitles.findHashTime);
        subtitles.findHashTime = null;
    }
}

subtitles.loadSubtitle = (subtitleElement, cb) => {
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
//          window.torrent.flood.pause();
            retriever.retrieveSrt("http://dl.opensubtitles.org/en/download/file/"+subtitleElement.split('/').pop(), (err, res) => {
//              window.torrent.flood.start();
                subtitles.processSub(res, subtitleElement.split('.').pop(), cb);
            },{ charset: ls('subEncoding') });
        } else {
            cb('');
        }
        return '';
    } else {
        retriever.retrieveSrt(subtitleElement, (err, res) => {
            subtitles.processSub(res, subtitleElement.split('.').pop(), cb);
        },{ charset: ls('subEncoding') });
        return '';
    }
    var resData = "";

//  window.torrent.flood.pause();
    var req = http.request(callOpts, res => {
        if ([501,404].indexOf(res.statusCode) > -1) {
            if (altSub) {
                retriever.retrieveSrt("http://dl.opensubtitles.org/en/download/file/"+subtitleElement.split('/').pop(), (err, res) => {
//                  window.torrent.flood.start();
                    subtitles.processSub(res, subtitleElement.split('.').pop(), cb);
                },{ charset: ls('subEncoding') });
            } else {
                cb('');
            }
        } else {
            
            res.on('data', data => {
                resData += data;
            });
            res.on('end', () => {
//              window.torrent.flood.start();
                subtitles.processSub(resData, subtitleElement.split('.').pop(), cb);
            });
        }
    });
    req.end();
}

subtitles.processSub = (srt, extension, cb) => {
    
    var parsedSub = [];
    
    if (extension.toLowerCase() == "srt" || extension.toLowerCase() == "vtt") {

        srt = strip(srt.replace(/\r\n|\r|\n/g, '\n'));

        var srty = srt.split('\n\n'),
            si = 0;
        
        if (srty[0].substr(0,6).toLowerCase() == "webvtt") si = 1;

        for (var s = si; s < srty.length; s++) {
            var st = srty[s].split('\n');
            if (st.length >=2) {
                var n = -1;
                if (st[0].indexOf(' --> ') > -1) var n = 0;
                else if (st[1].indexOf(' --> ') > -1) var n = 1;
                else if (st[2].indexOf(' --> ') > -1)  var n = 2;
                else if (st[3].indexOf(' --> ') > -1)  var n = 3;
                if (n > -1) {
                    var stOrigin = st[n]
                    var is = Math.round(toSeconds(strip(stOrigin.split(' --> ')[0])));
                    var os = Math.round(toSeconds(strip(stOrigin.split(' --> ')[1])));
                    var t = st[n+1];
                    if (st.length > n+2) for (var j=n+2; j<st.length; j++) t = t + '\n'+st[j];
                    parsedSub[is] = {i:is, o: os, t: t};
                }
            }
        }
    } else if (extension.toLowerCase() == "sub") {
        srt = srt.replace(/\r\n|\r|\n/g, '\n');
        
        srt = strip(srt);
        var srty = srt.split('\n');

        var s = 0;
        for (s = 0; s < srty.length; s++) {
            var st = srty[s].split('}{');
            if (st.length >=2) {
              var is = Math.round(st[0].substr(1) /10);
              var os = Math.round(st[1].split('}')[0] /10);
              var t = st[1].split('}')[1].replace('|', '\n');
              if (is != 1 && os != 1) parsedSub[is] = {i:is, o: os, t: t};
            }
        }
    }

    if (parsedSub)
        cb(parsedSub);
    else
        cb('');
}

subtitles.fetchOsCookie(true);

module.exports = subtitles;
