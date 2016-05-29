import MimeUtil from './mimeDetectorUtil';
import PlayerActions from './../components/Player/actions';
import LinkSupport from './../components/Player/utils/supportedLinks';
import metaParser from './../components/Player/utils/metaParser';
import ModalActions from './../components/Modal/actions';
import torrentActions from './../actions/torrentActions';
import Promise from 'bluebird';
import _ from 'lodash';
import ytdl from 'youtube-dl';
import ytdlSupported from './../components/Player/utils/ytdl-extractor';
import plugins from './plugins';
import ls from 'local-storage';

module.exports = (inputvalue, cb) => {
    return new Promise((resolve, reject) => {
        if (inputvalue.length > 0) {

            if (inputvalue.indexOf('://') == -1 && inputvalue.indexOf(':?') == -1 && inputvalue.indexOf('http') != 0) {
                inputvalue = 'http://' + inputvalue;
            }

            MimeUtil.parseURL(inputvalue)
                .then(parsed => {
                    switch (parsed.category) {
                        case 'torrent':
                            torrentActions.addTorrent(inputvalue);
                            break;
                        case 'direct':

                            if (parsed.type.parsed == 'html') {
                                // if it's html, we have 2 choices
                                // - try youtube-dl with it
                                // - add all the media on the page to a playlist
                                parsed.domain = parsed.url.match(/https?:\/\/[^\/]+\//g)[0];

                                function parseLinks(plugin) {
                                    // start scanning for media on the page
                                    var Linky = new LinkSupport;
                                    Linky.handleURL(parsed, plugin, resolvedLink => {
                                        var newFiles = resolvedLink[0];
                                        var queueParser = resolvedLink[1];
                                        if (newFiles.length) {
                                            ModalActions.close();
                                            PlayerActions.addPlaylist(newFiles);
    
                                            // start searching for thumbnails after 1 second
                                            _.delay(() => queueParser.forEach(el => {
                                                metaParser.push(el);
                                            }), 1000);
                                        } else {
                                            // try youtube-dl with it, use media scanner as a fallback
                                            var ytdlArgs = ['-g'];

                                            if (ls('ytdlQuality') < 4) {
                                                var qualities = [360, 480, 720, 1080];
                                                ytdlArgs.push('-f');
                                                ytdlArgs.push('[height <=? ' + qualities[ls('ytdlQuality')] + ']');
                                            }
                                            
                                            var video = ytdl(parsed.url, ytdlArgs);
                
                                            video.on('error', function(err) {
                                                ModalActions.close();
                                                console.log('ytdl ending error');
                                                reject(new Error('Error: Invalid URL'));
                                            });
                
                                            video.on('info', function(info) {
                                                if (info.url) {
                                                    ModalActions.close();
                                                    console.log(info);
                                                    PlayerActions.addPlaylist([{
                                                        originalURL: inputvalue,
                                                        uri: parsed.url,
                                                        youtubeDL: true,
                                                        image: info.thumbnail,
                                                        title: info.fulltitle
                                                    }]);
                                                } else parseLinks(plugin && plugin.checkFor ? plugin : null);
                                            });
                                            
                                        }
                                    }, reject);
                                }
                                
                                // let's see if we have any plugin that can handle this link
                                var plugin = plugins.getExtractor(parsed.url);
                                var perfectMatch = false;
                                if (plugin && plugin.checkFor) {
                                    // we have a plugin for this link (matched by domain with regex)
                                    // a perfect match is when the plugin is also matched by media
                                    perfectMatch = plugins.perfectMatch(parsed.url, plugin);
//                                    if (perfectMatch) console.log('a perfect match');
                                }

    
                                if (perfectMatch || ytdlSupported(parsed.url)) {
                                    // a perfect match or a youtube-dl regex match should be
                                    // sent directly to youtube-dl for processing
                                    var video = ytdl(parsed.url, ['-g']);
        
                                    video.on('error', function(err) {
                                        parseLinks(plugin && plugin.checkFor ? plugin : null);
                                    });
        
                                    video.on('info', function(info) {
                                        if (info.url) {
                                            ModalActions.close();
                                            console.log(info);
                                            PlayerActions.addPlaylist([{
                                                originalURL: inputvalue,
                                                uri: parsed.url,
                                                youtubeDL: true,
                                                image: info.thumbnail,
                                                title: info.fulltitle
                                            }]);
                                        } else parseLinks(plugin && plugin.checkFor ? plugin : null);
                                    });

                                } else {
                                    parseLinks(plugin && plugin.checkFor ? plugin : null);
                                }
    
                            } else {
                                // it's not html, maybe it's some protocol vlc can handle
                                PlayerActions.addPlaylist([parsed.url]);
                                resolve(parsed.url);
                            }

                            break;
                        case 'error':
                            reject(new Error('Error: Invalid URL'));
                            break;
                    }
                })
        } else {
            reject(new Error('Error: No URL Given'));
        }
    });
}