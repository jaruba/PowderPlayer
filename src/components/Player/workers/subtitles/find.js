import Promise from 'bluebird';

Promise.config({
    warnings: {
        wForgottenReturn: false
    }
});

import osMod from 'opensubtitles-api';
import fs from 'fs';
import parser from '../../utils/parser';
import atob from '../../utils/atob';
import needle from 'needle';
import async from 'async';

var objective = {};
var checkedFiles = {};
var subtitles = {};

subtitles.os = new osMod(atob('T3BlblN1YnRpdGxlc1BsYXllciB2NC43'));
subtitles.findHashTime = 0;

subtitles.tryLater = hashMs => {
    subtitles.stopTrying();
    subtitles.findHashTime = setTimeout(() => {
        subtitles.findHash();
    }, hashMs);
}

subtitles.byExactHash = (hash, fileSize, tag) => {
    subtitles.os.login().then( token => {
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

        subtitles.os.search(searcher).then( subData => {
            if (Object.keys(subData).length) {
                if (objective.byteLength) {
                    var tempData = atob("aHR0cDovL3Bvd2Rlci5tZWRpYS9tZXRhRGF0YS9zZW5kLnBocD9mPQ==")+encodeURIComponent(filename)+atob("JmloPQ==")+encodeURIComponent(hash)+atob("JnM9")+encodeURIComponent(objective.byteLength);
                    
                    if (objective.torrentHash)
                        tempData += atob("Jmg9")+encodeURIComponent(objective.torrentHash);

                    needle.get(tempData, () => {});
                }
                var result = {};
                async.each(subData, (item, callback) => {
                    var vrf = item.url.substr(item.url.indexOf('vrf-'));
                    vrf = vrf.substr(0,vrf.indexOf('/'));
                    result[item.langName+'[lg]'+item.lang] = 'http://dl.opensubtitles.org/en/download/subencoding-utf8/'+vrf+'/file/'+item.url.split('/').pop();
                    callback();
                }, err => {
                    objective.cb(result);
                    objective = {};
                });

            } else {
                objective.cb('null');
            }
            return subData;
        }).catch(err => {
            subtitles.tryLater(15000);
        });

    }).catch(err => {
        subtitles.tryLater(30000);
    });
}

subtitles.fetchSubs = newObjective => {
    subtitles.stopTrying();
    objective = newObjective;
    objective.filename = parser(objective.filepath).filename()
    
    if (!objective.byteLength)
        objective.byteLength = fs.statSync(objective.filepath).size;

    var url = atob("aHR0cDovL3Bvd2Rlci5tZWRpYS9tZXRhRGF0YS9nZXQucGhwP2Y9")+encodeURIComponent(objective.filename)+atob("Jmg9")+encodeURIComponent(objective.torrentHash)+atob("JnM9")+encodeURIComponent(objective.byteLength);
    
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
        subtitles.os.extractInfo(filepath).then(infos => {
            var hash = infos.moviehash;
            if (isFinished) {
                if (byteLength) subtitles.byExactHash(hash, byteLength, filename);
            } else {
                if (!checkedFiles[filename][hash]) {
                    checkedFiles[filename][hash] = 1;
                    subtitles.stopTrying();
                    subtitles.findHashTime = setTimeout(() => {
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
        subtitles.os.extractInfo(filepath).then(infos => {
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
        });
    }
}

subtitles.stopTrying = () => {
    if (subtitles.findHashTime) {
        clearTimeout(subtitles.findHashTime);
        subtitles.findHashTime = null;
    }
}

self.onmessage = msg => {
    objective = msg.data;
    objective.cb = subs => {
        postMessage(subs);
    };
    subtitles.fetchSubs(objective);
};
