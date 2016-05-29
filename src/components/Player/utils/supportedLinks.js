import MetaInspector from 'node-metainspector';
import PlayerActions from '../actions';
import PlayerStore from '../store';
import needle from 'needle';
import _ from 'lodash';
import ytdl from 'youtube-dl';
import async from 'async';
import ytdlSupported from './ytdl-extractor';
import plugins from '../../../utils/plugins'
import BaseModalActions from '../../Modal/actions';
import ls from 'local-storage';

var fullStop = false;

class supportedLinks {
    isSupportedLink(link) {
        if (link.includes('youtube.com/watch?v=')) {
            return true;
        }

        if (link.includes('vimeo.com/')) {

            var simpler = link.substr(link.indexOf('vimeo.com/') + 10);

            if (simpler.includes('?'))
                simpler = simpler.substr(0, simpler.indexOf('?'));

            if (simpler.includes('#'))
                simpler = simpler.substr(0, simpler.indexOf('#'));

            if (!isNaN(simpler)) return true;

        }

        if (link.includes('soundcloud.com')) {

            if (link.includes('?q=')) return false;

            if (link.includes('/search/')) return false;

            if (link.includes('/groups/')) return false;

            if (link.includes('/popular/')) return false;

            if ((link.match(/\//g) || []).length == 4) return true;

            if ((link.match(/\//g) || []).length == 5 && link.includes('/sets/')) return true;

        }

        return false;
    }
    
    stopParsing() {
        fullStop = true;
    }

    handleURL(parsed, plugin, cb, errorCB) {
                fullStop = false;
//        return new Promise((resolve, reject) => {

                var client = new MetaInspector(parsed.url, {
                    timeout: 10000
                });

                client.on("fetch", () => {
                    if (fullStop) return;
                    var hasChildren = (arr) => {
                        return arr && arr.length
                    }
                    if (hasChildren(client.torrents) || hasChildren(client.links.absolute.magnet)) {
                        // has torrents
                        fullStop = true;
                        BaseModalActions.torrentSelector(parsed.url);
                        return;
                    }
                    console.log(client);
                    var newFiles = [];
                    var noDupes = [];
                    var links = [];

                    if (client.links.absolute) {
                        if (client.links.absolute.http && client.links.absolute.https)
                            links = client.links.absolute.http.concat(client.links.absolute.https);
                        else if (client.links.absolute.http)
                            links = client.links.absolute.http;
                        else if (client.links.absolute.https)
                            links = client.links.absolute.https;
                    }
                    console.log('links found on page');
                    console.log(links);
                    var iframes = client.iframes;

                    var queueParser = [];
                    var uniqueIDs = [];
                    
                    var iframeToLink = function(el) {

                        if (el.includes('youtube.com/embed/')) {
                            el = el.substr(el.indexOf('youtube.com/embed/') + 18);
                            if (el.includes('?'))
                                el = el.substr(0, el.indexOf('?'));
                
                            el = 'https://www.youtube.com/watch?v=' + el;
                        }
                
                        if (el.includes('player.vimeo.com/video/')) {
                            el = el.substr(el.indexOf('player.vimeo.com/video') + 23);
                            if (el.includes('?'))
                                el = el.substr(0, el.indexOf('?'));
                
                            el = 'https://vimeo.com/' + el;
                        }
                
                        return el;
                    };
                    
                    var newLinks = [];

                    var processSecondLevel = function (aLinks, rLinks, iLinks) {
                        console.log('start processing');
                        console.log(aLinks);
                        async.forEachOfLimit(aLinks, 2, processLink, err => {
    
                            client.host = client.host.replace('www.', '');
                            
                            if (fullStop) {
                                done();
                                return;
                            }
                            if (rLinks) {
                                async.forEachOfLimit(rLinks, 2, (el, ij, next) => {
                                    el = parsed.domain + el.substr(1);
                                    
                                    processLink(el, ij, next);
                                }, function() {
                                    if (iLinks) {
                                        async.forEachOfLimit(iLinks, 2, (el, ij, next) => {
                                            el = iframeToLink(el);
                                            processLink(el, ij, next);
                                        }, done);
                                    } else done();
                                });
                            } else if (iLinks) {
                                async.forEachOfLimit(iLinks, 2, (el, ij, next) => {
                                    el = iframeToLink(el);
                                    processLink(el, ij, next);
                                }, done);
                            } else done();
                        });

                    }

                    var processFirstLevel = function (el, ij, next) {
                        var gClient = new MetaInspector(el, {
                            timeout: 10000
                        });
                        
                        gClient.on("fetch", () => {

                            var newNewLinks = gClient.document.match(/(https?:\/\/drive.google.com\/file\/d\/[^\/]+\/view)/g);
                            if (newNewLinks) newLinks.concat(newNewLinks);

                            if (gClient.links.absolute && gClient.links.absolute.https)
                                gClient.links.absolute.https.forEach( el => {
                                    if (el.match(/https?:\/\/w?w?w?\.?openload\.co\//g)) {
                                        console.log('pushing '+ el);
                                        newLinks.push(el);
                                    }
                                });

                            gClient.links.relative.forEach( el => {
                                if (el.startsWith('/watch?v=')) {
                                    el = 'https://www.youtube.com/' + el.substr(1);
                                    newLinks.push(el);
                                }
                            });

                            next();
                        });
                        
                        gClient.on("error", () => {
                            next();
                        });
        
                        gClient.fetch();
                    };
                    
                    var processLink = function (el, ij, next) {
                        
                        if (fullStop) {
                            next();
                            return;
                        }

                        if (noDupes.indexOf(el) == -1) {
                            noDupes.push(el);

                            var shouldPass = plugin ? plugins.perfectMatch(el, plugin) : ytdlSupported(el);
                            if (shouldPass) {

                                var ytdlArgs = ['-g'];

                                if (ls('ytdlQuality') < 4) {
                                    var qualities = [360, 480, 720, 1080];
                                    ytdlArgs.push('-f');
                                    ytdlArgs.push('[height <=? ' + qualities[ls('ytdlQuality')] + ']');
                                }
                                
                                var video = ytdl(el, ytdlArgs);

                                video.on('error', function(err) {
                                    next();
                                });
    
                                video.on('info', function(info) {
                                    if (!(info['display_id'] && uniqueIDs.indexOf(info['display_id']) > -1) && info.url) {
                                        info['display_id'] && uniqueIDs.push(info['display_id']);
                                        console.log(info);
                                        var queue = {
                                            idx: ij,
                                            url: el
                                        };
                                        var file = {
                                            originalURL: el,
                                            uri: parsed.url,
                                            youtubeDL: true,
                                            image: info.thumbnail,
                                            title: info.fulltitle
                                        };
                                        
                                        if (!fullStop) {
                                            cb([[file], [queue]]);
                                            queueParser.push(queue);
                                            newFiles.push(file);
                                        }
                                    }
                                    next();
                                });
                            } else next();
                        } else next();
                    };
                    
                    var done = function(err) {
                        if (!fullStop) {
                            console.log('ended parsing page');
                            console.log(newFiles);
                            if (!newFiles.length)
                                errorCB(new Error('No Results'));
    //                        resolve([newFiles, queueParser]);
                        }
                    };
                    
                    if (parsed.url.match(/https?:\/\/drive\.google\.com\/folderview/g)) {
                        // this is a google drive folder
                        // we'll fetch the links for it ourselves
                        links = client.document.match(/(https?:\/\/drive.google.com\/file\/d\/[^\/]+\/view)/g);
                    }

                    var firstLevelLinks = [];

                    links.forEach( el => {
                        if (el.match(/https?:\/\/drive\.google\.com\/folderview/g) || el.match(/https?:\/\/www\.youtube\.com\/playlist\?list=/g) || el.match(/https?:\/\/w?w?w?\.?pastelink\.net\/[^\/]+$/g) || el.match(/https?:\/\/w?w?w?\.?keeplinks\.eu\/p\//g)) {
                            firstLevelLinks.push(el);
                        } else newLinks.push(el);
                    });

                    if (firstLevelLinks.length) {
                        // there are multiple google drive folders on this page
                        async.forEachOfLimit(firstLevelLinks, 2, processFirstLevel, err => {
                            processSecondLevel(newLinks, client.links.relative, iframes);
                        });
                    } else {
                        processSecondLevel(links, client.links.relative, iframes);
                    }

                });

                client.on("error", errorCB);

                client.fetch();

//        });
    }

}

export
default supportedLinks;