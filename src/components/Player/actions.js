import alt from '../../alt'
import _ from 'lodash';
import ipc from 'ipc';
import ls from 'local-storage';

class PlayerActions {
    constructor() {
        this.generateActions(
            'play',
            'playItem',
            'pause',
            'prev',
            'next',
            'stop',
            'stopped',
            'volume',
            'mute',

            'playing',
            'uiShown',
            'position',
            'buffering',
            'seekable',
            'time',
            'length',
            'scrobble',
            'scrobbleState',
            'opening',
            'error',
            'ended',
            'mediaChanged',

            'fullscreen',
            'settingChange',
            'metaUpdate',
            'wcjsInit',
            'close',
            'addPlaylist',
            'togglePlaylist',
            'toggleSubtitles',
            'toggleSettings',
            'setPlaylist',
            'parseURL',
            'replaceMRL',
            'setSubtitle',
            'setSubDelay',
            'setAudioDelay',

            'delayTime',
            'scrobbleKeys',

            'itemCount',
            'itemDesc',
            'setDesc',
            'setRate',

            'pulse',
            'flood',

            'announcement',

            'updateImage'
        );
    }


    onParseURL(qTask) {
        if (!this.urlParserQueue) {
            var player = this;
            var parserQueue = async.queue((task, cb) => {
                if (task.url && !task.filename) {
                    var client = new MetaInspector(task.url, {
                        timeout: 5000
                    });

                    client.on("fetch", function() {
                        var idx = task.idx;
                        var itemDesc = player.itemDesc(task.idx);
                        if (!(itemDesc && itemDesc.mrl == task.url)) {
                            for (var i = 1; i < player.wcjs.playlist.items.count; i++) {
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

                            playerActions.setDesc({
                                idx: idx,
                                title: client.title,
                                image: client.image
                            });

                            if (idx == player.wcjs.playlist.currentItem) {
                                player.setState({
                                    title: client.title
                                });
                            }

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

                                    for (var i = 1; i < player.wcjs.playlist.items.count; i++) {
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

                                    playerActions.setDesc(newObj);
                                    if (idx == player.wcjs.playlist.currentItem) {
                                        player.setState({
                                            title: newObj.title
                                        });
                                        if (!player.foundTrakt) {
                                            player.setState({
                                                foundTrakt: true
                                            });

                                            var shouldScrobble = traktUtil.loggedIn && ls.isSet('traktScrobble');
                                            if (shouldScrobble) {
                                                if (!ls.isSet('playerNotifs') || ls('playerNotifs'))
                                                    player.notifier.info('Scrobbling', '', 6000);
                                                traktUtil.scrobble('start', player.wcjs.position, results);
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

            this.urlParserQueue = parserQueue;

        }

        this.urlParserQueue.push(qTask);
    }


    loadSub(sub) {
        subUtil.loadSubtitle(subLink, parsedSub => {
            this.actions.setSubtitle(parsedSub);
            this.actions.setSubDelay(0);
        });
    }

    createPlaylist(files) {


    }

    toggleAlwaysOnTop(state = true) {
        ipc.send('app:alwaysOnTop', state);
    }

    togglePowerSave(state = true) {
        ipc.send('app:powerSaveBlocker', state);
    }

    toggleFullscreen(state) {
        this.dispatch();

        window.document.querySelector(".render-holder > div:first-of-type").style.display = 'none';
        _.delay(() => {
            window.document.querySelector(".render-holder > div:first-of-type").style.display = 'block';
        }, 1000);

        ipc.send('app:fullscreen', state);
        this.actions.fullscreen(state);
    }
}


export
default alt.createActions(PlayerActions);
