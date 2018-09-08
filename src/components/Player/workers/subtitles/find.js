const Promise = require('bluebird')

Promise.config({
    warnings: {
        wForgottenReturn: false
    }
});

const osMod = require('opensubtitles-api')
const fs = require('fs')
const parser = require('../../utils/parser')
const atob = require('../../utils/atob')
const needle = require('needle')
const async = require('async')

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

subtitles.searchFor = (searcher, objective, postTo) => {
    subtitles.os.search(searcher).then( subData => {
        if (Object.keys(subData).length) {

            if (postTo) {
                needle.get(postTo, () => {});
            }

            var result = {};
            async.each(subData, (item, callback) => {
                if (Array.isArray(item)) {
                    item.forEach((el, ij) => {
                        var vrf = el.url.substr(el.url.indexOf('vrf-'));
                        vrf = vrf.substr(0,vrf.indexOf('/'));
                        if (el.langcode) {
                            result[el.lang+ (ij ? ' ' + (ij+1) : '') + '[lg]'+el.langcode] = 'http://dl.opensubtitles.org/en/download/subencoding-utf8/'+vrf+'/file/'+el.url.split('/').pop()+'.'+el.format;
                        } else {
                            result[el.langName+ (ij ? ' ' + (ij+1) : '') + '[lg]'+el.lang] = 'http://dl.opensubtitles.org/en/download/subencoding-utf8/'+vrf+'/file/'+el.url.split('/').pop();
                        }
                    })
                } else {
                    var vrf = item.url.substr(item.url.indexOf('vrf-'));
                    vrf = vrf.substr(0,vrf.indexOf('/'));
                    if (item.langcode) {
                        result[item.lang+ '[lg]'+item.langcode] = 'http://dl.opensubtitles.org/en/download/subencoding-utf8/'+vrf+'/file/'+item.url.split('/').pop()+'.'+item.format;
                    } else {
                        result[item.langName+'[lg]'+item.lang] = 'http://dl.opensubtitles.org/en/download/subencoding-utf8/'+vrf+'/file/'+item.url.split('/').pop();
                    }
                }
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
        if (postTo) { // this means it's a hash check
            subtitles.tryLater(15000);
        }
    });
}

subtitles.byAnything = (objective, limit) => {
    objective.sublanguageid = 'all'
    objective.extensions = ['srt','sub','vtt']
    objective.limit = limit

    subtitles.searchFor(objective, objective)
}

subtitles.byExactHash = (hash, fileSize, tag, limit) => {
    var filename = objective.filename;
    
    var searcher = {
        sublanguageid: 'all',
        extensions: ['srt','sub','vtt'],
        hash: hash,
        filesize: fileSize,
        filename: filename,
        limit: limit
    };
    
    if (parser(filename).shortSzEp()) {
        searcher.season = parser(filename).season().toString();
        searcher.episode = parser(filename).episode().toString();
    }
    
    if (objective.fps) searcher.fps = objective.fps;

    var tempData

    if (objective.byteLength) {

        tempData = atob("aHR0cDovL3Bvd2Rlci5tZWRpYS9tZXRhRGF0YS9zZW5kLnBocD9mPQ==")+encodeURIComponent(filename)+atob("JmloPQ==")+encodeURIComponent(hash)+atob("JnM9")+encodeURIComponent(objective.byteLength);

        if (objective.torrentHash)
            tempData += atob("Jmg9")+encodeURIComponent(objective.torrentHash);

    }

    subtitles.searchFor(searcher, objective, tempData)
}

subtitles.fetchSubs = newObjective => {
    subtitles.stopTrying();
    objective = newObjective;
    if (objective.filepath) {

        if (!objective.filename)
            objective.filename = parser(objective.filepath).filename()
        
        if (!objective.byteLength)
            objective.byteLength = fs.statSync(objective.filepath).size;

        var url = atob("aHR0cDovL3Bvd2Rlci5tZWRpYS9tZXRhRGF0YS9nZXQucGhwP2Y9")+encodeURIComponent(objective.filename)+atob("Jmg9")+encodeURIComponent(objective.torrentHash)+atob("JnM9")+encodeURIComponent(objective.byteLength);

        needle.get(url, (err, res) => {
            if (!err && res && res.body && objective.byteLength) {
                var parsed
                try {
                    parsed = JSON.parse(res.body)
                } catch (e) {}
                if (parsed && parsed.filehash)
                    subtitles.byExactHash(parsed.filehash, objective.byteLength, objective.filename, objective.limit);
                else {
                    subtitles.stopTrying();
                    subtitles.findHash();
                }
            } else {
                subtitles.stopTrying();
                subtitles.findHash();
            }
        });
    } else {
        subtitles.byAnything(objective)
    }
}

subtitles.findHash = () => {
    var filepath = objective.filepath,
        byteLength = objective.byteLength,
        torrentHash = objective.torrentHash,
        isFinished = objective.isFinished,
        filename = objective.filename,
        limit = objective.limit;

    if (!checkedFiles[filename])
        checkedFiles[filename] = {};

    if (torrentHash) {
        subtitles.os.hash(filepath).then(infos => {
            var hash = infos.moviehash;
            if (isFinished) {
                if (byteLength) subtitles.byExactHash(hash, byteLength, filename, limit);
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
                            subtitles.byExactHash(hash, byteLength, filename, limit);
                        
                    } else checkedFiles[filename][hash]++;
                }
            }
        }).catch(err => {
            subtitles.findHashTime = setTimeout(() => {
                subtitles.findHash();
            },10000);
        });
    } else {
        subtitles.os.hash(filepath).then(infos => {
            if (!byteLength && filepath) {
                fs.stat(filepath, (err, stats) => {
                    if (stats && stats.size)
                        subtitles.byExactHash(infos.moviehash, stats.size, filename, limit);
                })
                byteLength = fs.statSync(filepath).size;
            } else {
                if (!byteLength) byteLength = 0;
                subtitles.byExactHash(infos.moviehash, byteLength, filename, limit);
            }
        }).catch(err => {
            // nothing else to do, local file
            objective.cb('null')
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
