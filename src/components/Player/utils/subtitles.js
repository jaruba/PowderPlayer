import osMod from 'opensubtitles-api';
import fs from 'fs';
import parser from './parser';
import needle from 'needle';
import webUtil from '../../../utils/webUtil.js';
import http from 'http';
import retriever from 'subtitles-grouping/lib/retriever';
import ls from 'local-storage';
import worker from 'workerjs';

var objective = {};
var subtitles = {};
var subFinder = false;
var subParser = false;

subtitles.os = new osMod(atob('T3BlblN1YnRpdGxlc1BsYXllciB2NC43'));
subtitles.findHashTime = 0;
subtitles.osCookie = false;

subtitles.fetchOsCookie = retryCookie => {
    webUtil.checkInternet( isConnected => {
        if (isConnected) {
            var req = require('http').request({ host: "dl.opensubtitles.org", path: "/en/download/subencoding-utf8/vrf-ef3a1f1e6e/file/1954677189" },(res) => {
                if (res.headers["set-cookie"] && res.headers["set-cookie"][0]) {
                    var tempCookie = res.headers["set-cookie"][0];
                    subtitles.osCookie = (tempCookie + "").split(";").shift();
                } else if (!res.headers["set-cookie"] && retryCookie) {
                    console.log("fetching OS cookie failed, trying again in 20 sec");
                    setTimeout(() => { subtitles.fetchOsCookie(false) },20000);
                }
            });
            req.end();
        }
    });
}

subtitles.fetchSubs = (newObjective) => {
    objective = newObjective;
    objective.filename = parser(objective.filepath).filename();
    
    if (subFinder) subFinder.terminate();
    
    if (process.env['devMode']) {
        subFinder = new worker('../../build/js/components/Player/workers/subtitles/find.js', true);
    } else {
        subFinder = new worker('../../js/components/Player/workers/subtitles/find.js', true);
    }

    subFinder.addEventListener('message', msg => {
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

subtitles.processSub = (srt, extension, cb) => {

    if (subParser) subParser.terminate();

    if (process.env['devMode']) {
        subParser = new worker('../../build/js/components/Player/workers/subtitles/parse.js', true);
    } else {
        subParser = new worker('../../js/components/Player/workers/subtitles/parse.js', true);
    }
    
    subParser.addEventListener('message', msg => {
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
        } else
            cb(null);
    } else {
        retriever.retrieveSrt(subtitleElement, (err, res) => {
            subtitles.processSub(res, subtitleElement.split('.').pop(), cb);
        },{ charset: ls('subEncoding') });
    }
    var resData = "";

//  window.torrent.flood.pause();
    var req = http.request(callOpts, res => {
        if ([501,410,404].indexOf(res.statusCode) > -1) {
            if (subtitleElement.indexOf('http://dl.opensubtitles.org/en/download/subencoding-utf8/') == 0)
                retriever.retrieveSrt(subtitleElement.replace('/subencoding-utf8/','/file/'), (err, res) => {
//                  window.torrent.flood.start();
                    subtitles.processSub(res, subtitleElement.split('.').pop(), cb);
                },{ charset: ls('subEncoding') });
            else
                cb(null);
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

subtitles.findLine = (subLines, trackSub, subDelay, time) => {
    return new Promise((resolve, reject) => {
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

module.exports = subtitles;
