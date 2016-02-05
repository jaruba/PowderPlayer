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
var subWorker = false;

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
    
    if (subWorker) subWorker.terminate();
    
    subWorker = new worker('../../js/components/Player/workers/subtitles.js', true);
    subWorker.addEventListener('message', msg => {
        if (msg.data) {
            if (msg.data == 'null') {
                objective.cb('');
            } else {
                objective.cb(msg.data);
            }
            subWorker.terminate();
            subWorker = false;
        }
    });
    
    subWorker.postMessage(objective);
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
        cb(null);
}

subtitles.findLine = (subLines, trackSub, subDelay, time) => {
    return new Promise((resolve, reject) => {
        var nowSecond = (time - subDelay) / 1000;
        if (trackSub > -2) {

            var line = -1;
            var os = 0;

            for (os in subLines) {
                if (os > nowSecond) break;
                line = os;
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
