
var Promise = require('bluebird');

Promise.config({
    warnings: {
        wForgottenReturn: false
    }
});

var osMod = require('opensubtitles-api');
var fs = require('fs');
var parser = require('ultimate-parser');
var needle = require('needle');
var async = require('async');

var objective = {};
var checkedFiles = {};
var subtitles = {};

subtitles.os = new osMod(parser('T3BlblN1YnRpdGxlc1BsYXllciB2NC43').atob());
subtitles.findHashTime = 0;

subtitles.tryLater = function(hashMs) {
    subtitles.stopTrying();
    subtitles.findHashTime = setTimeout(function() {
        subtitles.findHash();
    }, hashMs);
}

subtitles.byExactHash = function(hash, fileSize, tag) {
    subtitles.os.login().then( function(token) {
        var filename = objective.filename;
        
        var searcher = {
            sublanguageid: 'all',
            extensions: ['srt','sub','vtt'],
            hash: hash,
            size: fileSize,
            filename: filename,
			limit: 'all'
        };
        
        if (parser(filename).shortSzEp()) {
            searcher.season = parser(filename).season().toString();
            searcher.episode = parser(filename).episode().toString();
        }
        
        if (objective.fps) searcher.fps = objective.fps;

        subtitles.os.search(searcher).then( function(subData) {
            if (Object.keys(subData).length) {
                if (objective.byteLength) {
                    var tempData = parser("aHR0cDovL3Bvd2Rlci5tZWRpYS9tZXRhRGF0YS9zZW5kLnBocD9mPQ==").atob()+encodeURIComponent(filename)+parser("JmloPQ==").atob()+encodeURIComponent(hash)+parser("JnM9").atob()+encodeURIComponent(objective.byteLength);
                    
                    if (objective.torrentHash)
                        tempData += parser("Jmg9").atob()+encodeURIComponent(objective.torrentHash);

                    needle.get(tempData, function() {});
                }
				
                var result = {};
				async.forEachOf(subData, function (item, ij, callback){
					if (item[0]) {
						async.forEachOf(item, function (itemArr, ijArr, callbackArr){
							var vrf = itemArr.url.substr(itemArr.url.indexOf('vrf-'));
							vrf = vrf.substr(0,vrf.indexOf('/'));
							if (ijArr == 0) {
								result[itemArr.langName] = 'http://dl.opensubtitles.org/en/download/subencoding-utf8/'+vrf+'/file/'+itemArr.url.split('/').pop();
							} else {
								result['[hid]'+itemArr.langName+' '+(ijArr+1)] = 'http://dl.opensubtitles.org/en/download/subencoding-utf8/'+vrf+'/file/'+itemArr.url.split('/').pop();
							}
							callbackArr();
						}, function(err) {
							callback();
						});
						
					} else {
						var vrf = item.url.substr(item.url.indexOf('vrf-'));
						vrf = vrf.substr(0,vrf.indexOf('/'));
						results[item.langName] = 'http://dl.opensubtitles.org/en/download/subencoding-utf8/'+vrf+'/file/'+item.url.split('/').pop();
						callback();
					}
				}, function(err) {
					objective.cb(result);
					objective = {};
					counter = null;
				});

            } else {
                objective.cb('null');
            }
            return subData;
        }).catch(function (err) {
            subtitles.tryLater(15000);
        });

    }).catch(function (err) {
        subtitles.tryLater(30000);
    });
}

subtitles.fetchSubs = function (newObjective) {
    subtitles.stopTrying();
    objective = newObjective;
    objective.filename = parser(objective.filepath).filename()
    
    if (!objective.byteLength)
        objective.byteLength = fs.statSync(objective.filepath).size;

    var url = parser("aHR0cDovL3Bvd2Rlci5tZWRpYS9tZXRhRGF0YS9nZXQucGhwP2Y9").atob()+encodeURIComponent(objective.filename)+parser("Jmg9").atob()+encodeURIComponent(objective.torrentHash)+parser("JnM9").atob()+encodeURIComponent(objective.byteLength);
    
    needle.get(url, function (err, res) {
        if (!err && res && res.body && objective.byteLength && JSON.parse(res.body).filehash) {
            subtitles.byExactHash(res.filehash, objective.byteLength, objective.filename);
        } else {
            subtitles.stopTrying();
            subtitles.findHash();
        }
    });
}

subtitles.findHash = function () {
    var filepath = objective.filepath,
        byteLength = objective.byteLength,
        torrentHash = objective.torrentHash,
        isFinished = objective.isFinished,
        filename = objective.filename;

    if (!checkedFiles[filename])
        checkedFiles[filename] = {};

    if (torrentHash) {
        subtitles.os.extractInfo(filepath).then(function (infos) {
            var hash = infos.moviehash;
            if (isFinished) {
                if (byteLength) subtitles.byExactHash(hash, byteLength, filename);
            } else {
                if (!checkedFiles[filename][hash]) {
                    checkedFiles[filename][hash] = 1;
                    subtitles.stopTrying();
                    subtitles.findHashTime = setTimeout(function () {
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
        });
    } else {
        subtitles.os.extractInfo(filepath).then(function (infos) {
            if (!byteLength && filepath) {
                fs.stat(filepath, function (err, stats) {
                    if (stats && stats.size)
                        subtitles.byExactHash(infos.moviehash, stats.size, filename);
                })
                byteLength = fs.statSync(filepath).size;
            } else {
                if (!byteLength) byteLength = 0;
                subtitles.byExactHash(infos.moviehash, byteLength, filename);
            }
        });
    }
}

subtitles.stopTrying = function () {
    if (subtitles.findHashTime) {
        clearTimeout(subtitles.findHashTime);
        subtitles.findHashTime = null;
    }
}

self.onmessage = function (msg) {

    objective = msg.data;
    objective.cb = function (subs) {
        postMessage(subs);
    };
    subtitles.fetchSubs(objective);

};
