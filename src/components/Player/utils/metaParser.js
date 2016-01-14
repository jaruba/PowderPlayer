import _ from 'lodash';
import async from 'async';
import MetaInspector from 'node-metainspector';
import parseVideo from 'video-name-parser';
import nameToImdb from 'name-to-imdb';
import parser from './parser';
import traktUtil from './trakt';
import config from './config';
import PlayerStore from '../store';
import PlayerActions from '../actions';
import ls from 'local-storage';

var parserQueue = async.queue((task, cb) => {
    var player = PlayerStore.getState();
    var wcjs = PlayerStore.getState().wcjs;
    if (task.url && !task.filename) {
        var client = new MetaInspector(task.url, {
            timeout: 5000
        });

        client.on("fetch", function() {
            var idx = task.idx;
            var itemDesc = player.itemDesc(task.idx);
            if (!(itemDesc && itemDesc.mrl == task.url)) {
                for (var i = 1; i < wcjs.playlist.items.count; i++) {
                    if (player.itemDesc(i).mrl == task.url) {
                        idx = i;
                        break;
                    }
                }
            }
            if (idx > -1 && client.image && client.title) {

                if (document.getElementById('item' + idx)) {
                    document.getElementById('item' + idx).style.background = "url('" + client.image + "')";
                    document.getElementById('itemTitle' + idx).innerHTML = client.title;
                }

                PlayerActions.setDesc({
                    idx: idx,
                    title: client.title,
                    image: client.image
                });

                if (idx == wcjs.playlist.currentItem)
                    PlayerStore.getState().events.emit('setTitle', client.title);

            }
            _.delay(() => {
                cb()
            }, 500)
        });

        client.on("error", function(err) {
            _.delay(() => {
                cb()
            }, 500)
        });

        client.fetch();
    } else if (task.filename) {

        var parsedFilename = parseVideo(task.filename);

        if (!parsedFilename.season && !task.secondTry && parser(task.filename).shortSzEp()) {
            parsedFilename.type = 'series';
            parsedFilename.season = parser(task.filename).season();
            parsedFilename.episode = [parser(task.filename).episode()];
            parsedFilename.name = parser(task.filename).showName();
        }

        if (parsedFilename.type == 'series' && parsedFilename.year) {
            delete parsedFilename.year;
        }

        nameToImdb(parsedFilename, function(err, res, inf) {

            if (err) {
                // handle error
                _.delay(() => {
                    cb()
                }, 500)
                return;
            }

            if (res) {
                // handle imdb

                parsedFilename.imdb = res;
                parsedFilename.extended = 'full,images';
                if (parsedFilename.type == 'movie') {
                    var buildQuery = {
                        id: parsedFilename.imdb,
                        id_type: 'imdb',
                        extended: parsedFilename.extended
                    };
                    var summary = traktUtil.movieInfo;
                } else if (parsedFilename.type == 'series') {
                    var buildQuery = {
                        id: parsedFilename.imdb,
                        id_type: 'imdb',
                        season: parsedFilename.season,
                        episode: parsedFilename.episode[0],
                        extended: parsedFilename.extended
                    };
                    var summary = traktUtil.episodeInfo;
                }

                summary(buildQuery).then(results => {

                    var idx = task.idx;

                    var itemDesc = player.itemDesc(task.idx);

                    if (!(itemDesc && itemDesc.mrl == task.url)) {

                        for (var i = 1; i < wcjs.playlist.items.count; i++) {
                            if (player.itemDesc(i).mrl.endsWith(task.url)) {
                                idx = i;
                                break;
                            }
                        }

                    }

                    if (idx > -1 && results && results.title) {

                        var newObj = {
                            idx: idx
                        };

                        // this is the episode title for series
                        newObj.title = parsedFilename.name.split(' ').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');

                        if (results.season && results.number) {
                            newObj.title += ' S' + ('0' + results.season).slice(-2) + 'E' + ('0' + results.number).slice(-2);
                        } else if (results.year) {
                            newObj.title += ' ' + results.year;
                        }

                        if (results.images) {
                            if (results.images.screenshot && results.images.screenshot.thumb) {
                                newObj.image = results.images.screenshot.thumb;
                            } else if (results.images.fanart && results.images.fanart.thumb) {
                                newObj.image = results.images.fanart.thumb;
                            }
                        }

                        if (document.getElementById('item' + idx)) {
                            if (newObj.image)
                                document.getElementById('item' + idx).style.background = "url('" + newObj.image + "')";

                            if (newObj.title)
                                document.getElementById('itemTitle' + idx).innerHTML = newObj.title;
                        }

                        newObj.parsed = parsedFilename;
                        newObj.trakt = results;

                        PlayerActions.setDesc(newObj);
                        if (idx == wcjs.playlist.currentItem) {
                            PlayerStore.getState().events.emit('setTitle', newObj.title);
                            if (!config.foundTrakt) {
                                _.defer(() => {
                                    PlayerStore.getState().events.emit('foundTrakt', true);
                                });

                                var shouldScrobble = traktUtil.loggedIn && (ls.isSet('traktScrobble') ? ls('traktScrobble') : true);
                                if (shouldScrobble) {
                                    if (!ls.isSet('playerNotifs') || ls('playerNotifs'))
                                        player.notifier.info('Scrobbling', '', 6000);
                                    traktUtil.scrobble('start', wcjs.position, results);
                                }
                            }
                        }

                        _.delay(() => {
                            cb()
                        }, 500)

                    }
                }).catch(err => {
                    if (!task.secondTry && parsedFilename.type == 'series') {
                        task.secondTry = true;
                        parserQueue.push(task);
                    } else {
                        console.log('Error: ' + err.message);
                    }
                    _.delay(() => {
                        cb()
                    }, 500)
                });
                return;
            }

            _.delay(() => {
                cb()
            }, 500)

        })

    }

}, 1);

module.exports = parserQueue;
