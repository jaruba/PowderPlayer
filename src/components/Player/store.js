import _ from 'lodash';
import ipc from 'ipc';
import ls from 'local-storage';
import {
    handleTime
}
from './utils/time';
import alt from '../../alt';

import playerActions from './actions';
import historyStore from '../../stores/historyStore';

import needle from 'needle';

import MetaInspector from 'node-metainspector';
import async from 'async';

import parseVideo from 'video-name-parser';
import nameToImdb from 'name-to-imdb';
import parser from './utils/parser';

import traktUtil from './utils/trakt';
import subUtil from './utils/subtitles';
import torrentUtil from '../../utils/stream/torrentUtil';

class playerStore {
    constructor() {
        this.bindActions(playerActions);

        this.uri = false;
        this.title = '';
        this.wcjs = false;

        this.playing = false;
        this.paused = false;

        this.alwaysOnTop = false;
        this.clickPause = ls.isSet('clickPause') ? ls('clickPause') : false;
        this.rippleEffects = ls.isSet('playerRippleEffects') ? ls('playerRippleEffects') : true;

        this.muted = false;
        this.volume = ls.isSet('volume') ? ls('volume') : 100;
        this.position = 0;
        this.buffering = false;
        this.time = 0;
        this.length = 0;
        this.seekable = false;

        this.pendingFiles = [];
        this.files = [];
        this.playlist = {};

        this.fullscreen = false;
        this.uiShown = true;
        this.uiHidden = false;
        this.playlistOpen = false;
        this.subtitlesOpen = false;
        this.settingsOpen = false;

        this.currentTime = '00:00';
        this.totalTime = '00:00';

        this.scrobbling = false;

        this.itemDesc = i => {
            return false
        };

        this.firstPlay = false;

        this.foundTrakt = false;

        this.fontSize = 21.3;
        this.subSize = 21.3;

        this.foundSubs = false;
        this.subtitle = [];
        this.trackSub = -1;
        this.subDelay = 0;
        this.subBottom = '70px';
        this.selectedSub = 1;
        this.audioDelay = 0;
        this.audioTrack = 1;

        this.notifier = false;

        this.subText = '';
        this.announce = '';
        this.announceEffect = '';

        this.speed = 1;

        this.forceTime = false;
        this.overTime = false;
        this.scrobbleKeys = false;
        this.seekPerc = 0;

        this.aspectRatio = 'Default';
        this.crop = 'Default';
        this.zoom = 1;
    }

    onSettingChange(setting) {
        this.setState(setting);
    }

    onWcjsInit(wcjs) {
        this.setState({
            wcjs: wcjs,
            itemDesc: i => {
                if (typeof i === 'undefined') i = wcjs.playlist.currentItem;
                if (typeof i === 'number') {
                    if (i > -1 && i < wcjs.playlist.items.count) {
                        var wjsDesc = Object.assign({}, wcjs.playlist.items[i]);
                        if (!wjsDesc.setting) wjsDesc.setting = "{}";
                        wjsDesc.setting = JSON.parse(wjsDesc.setting);
                        return wjsDesc;
                    }
                }
                return false;
            }
        });
    }

    onSetSubtitle(subLink) {
        this.setState({
            subtitle: parsedSub,
            trackSub: -1
        });
        this.subDelayField.setValue('0 ms');
    }

    onTogglePlaylist() {
        this.setState({
            playlistOpen: !this.playlistOpen,
            settingsOpen: false,
            subtitlesOpen: false
        });
    }

    onToggleSubtitles() {
        this.setState({
            playlistOpen: false,
            settingsOpen: false,
            subtitlesOpen: !this.subtitlesOpen
        });
    }

    onToggleSettings() {
        this.setState({
            settingsOpen: !this.settingsOpen,
            playlistOpen: false,
            subtitlesOpen: false
        });
    }

    onUiShown(toggle) {
        this.setState({
            uiShown: toggle
        });
    }

    onFullscreen(state) {
        this.setState({
            fullscreen: state
        });
    }

    onParsedURL(qTask) {
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

                                            var shouldScrobble = traktUtil.loggedIn ? ls.isSet('traktScrobble') ? ls('traktScrobble') : true : false;
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
    };

    onPosition(pos) {
        this.setState({
            position: pos
        });
    }

    onSeekable(state) {
        this.setState({
            seekable: state
        });
    }

    onPulse() {
        if (this.wcjs) {
            var length = this.wcjs.length;
            var itemDesc = this.itemDesc();
            if (length && itemDesc.setting && itemDesc.setting.torrentHash && itemDesc.setting.byteSize) {
                var newPulse = Math.round(itemDesc.setting.byteSize / (length / 1000) * 2);
                torrentUtil.setPulse(itemDesc.setting.torrentHash, newPulse);
            }
        }
    }

    onFlood() {
        if (this.wcjs) {
            var itemDesc = this.itemDesc();
            if (itemDesc.setting && itemDesc.setting.torrentHash)
                torrentUtil.flood(itemDesc.setting.torrentHash);
        }
    }

    onLength(length) {
        if (ls('speedPulsing') && ls('speedPulsing') == 'enabled') {
            _.defer(playerActions.pulse);
        }
        this.setState({
            length: length,
            totalTime: handleTime(length, length)
        });
    }

    onTime(time) {
        this.setState({
            time: time,
            currentTime: handleTime(time, this.length)
        });

        // print subtitle text if a subtitle is selected
        if (this.subtitle.length > 0) {
            var subLines = this.subtitle;
            var nowSecond = (time - this.subDelay) / 1000;
            if (this.trackSub > -2) {

                var line = -1;
                var os = 0;

                for (os in subLines) {
                    if (os > nowSecond) break;
                    line = os;
                }

                if (line >= 0) {
                    if (line != this.trackSub) {
                        if ((subLines[line].t.match(new RegExp("<", "g")) || []).length == 2) {
                            if (!(subLines[line].t.substr(0, 1) == "<" && subLines[line].t.slice(-1) == ">"))
                                subLines[line].t = subLines[line].t.replace(/<\/?[^>]+(>|$)/g, "");
                        } else if ((subLines[line].t.match(new RegExp("<", "g")) || []).length > 2)
                            subLines[line].t = subLines[line].t.replace(/<\/?[^>]+(>|$)/g, "");

                        this.setState({
                            subText: subLines[line].t
                        });

                        this.setState({
                            trackSub: line
                        });
                    } else if (subLines[line].o < nowSecond)
                        this.setState({
                            subText: ''
                        });

                }
            }
        }
    }

    onAddPlaylist(data) {

        if (!this.wcjs) {

            if (data.length) {
                this.setState({
                    pendingFiles: data,
                    files: this.files.concat(data)
                });
            }

            playerActions.togglePowerSave(true);

        } else {

            this.setState({
                files: this.files.concat(data)
            });

            if (this.wcjs.playlist.items.count == 0)
                var playAfter = true;

            for (var i = 0; data[i]; i++) {
                if (typeof data[i] === 'string') {
                    this.wcjs.playlist.add(data[i]);
                } else if (data[i].uri) {
                    this.wcjs.playlist.add(data[i].uri);
                    if (data[i].title)
                        this.wcjs.playlist.items[this.wcjs.playlist.items.count - 1].title = data[i].title;

                    data[i].idx = this.wcjs.playlist.items.count - 1;

                    let keeper = data[i];

                    if (data[i].byteSize && data[i].torrentHash)
                        _.defer(() => {
                            playerActions.setDesc({
                                idx: keeper.idx,
                                byteSize: keeper.byteSize,
                                torrentHash: keeper.torrentHash,
                                path: keeper.path
                            });
                        });
                    else if (data[i].path)
                        _.defer(() => {
                            playerActions.setDesc({
                                idx: keeper.idx,
                                path: keeper.path
                            });
                        });

                }
            }

            if (playAfter) this.wcjs.playlist.playItem(0);

        }

        _.defer(() => {
            historyStore.getState().history.replaceState(null, 'player');
        });

    }

    onBuffering(perc) {
        var itemDesc = this.itemDesc();
        var isLocal = (itemDesc.mrl && itemDesc.mrl.indexOf('file://') == 0);
        if (!isLocal) {
            var announcer = {};
            announcer.announce = 'Buffering ' + perc + '%';
            clearTimeout(this.announceTimer);

            if (perc === 100) {
                announcer.buffering = false;
                if (!this.announceEffect)
                    announcer.announceEffect = true;
            } else {
                announcer.buffering = perc;
                if (this.announceEffect)
                    announcer.announceEffect = false;
            }

            if (Object.keys(announcer).length)
                this.setState(announcer);
        }

    }

    onAnnouncement(obj) {
        var announcer = {};
        if (typeof obj === 'string') obj = {
            text: obj
        };
        announcer.announce = obj.text;
        if (!obj.delay) obj.delay = 2000;

        clearTimeout(this.announceTimer);
        var playerState = this;
        announcer.announceTimer = setTimeout(() => {
            if (!playerState.announceEffect)
                playerState.setState({
                    announceEffect: !playerState.announceEffect
                });
        }, obj.delay);

        if (this.announceEffect)
            announcer.announceEffect = false;

        if (Object.keys(announcer).length)
            this.setState(announcer);
    }

    onUpdateImage(image) {

        if (document.getElementById('canvasEffect')) {

            if (this.wcjs.playlist.items[this.wcjs.playlist.currentItem].mrl.indexOf('soundcloud.com') > -1 && image) {
                var image = image.replace('large', 't500x500');
                document.getElementById('canvasEffect').parentNode.style.cssText = "background-color: transparent !important";
                document.getElementById('playerCanvas').style.display = "none";
                document.getElementsByClassName('wcjs-player')[0].style.background = "url('" + image + "') 50% 50% / contain no-repeat black";
            } else {
                document.getElementById('canvasEffect').parentNode.style.cssText = "background-color: #000 !important";
                document.getElementById('playerCanvas').style.display = "block";
                document.getElementsByClassName('wcjs-player')[0].style.background = "black";
            }

        }

    }

    onOpening() {

        if (this.wcjs.playlist.currentItem != this.lastItem) {
            if (this.wcjs.playlist.items[this.wcjs.playlist.currentItem].artworkURL) {
                var image = this.wcjs.playlist.items[this.wcjs.playlist.currentItem].artworkURL;
            } else {
                try {
                    var image = JSON.parse(this.wcjs.playlist.items[this.wcjs.playlist.currentItem].setting).image;
                } catch (e) {}
            }

            _.delay(() => {
                playerActions.updateImage(image);
            });

            this.setState({
                title: this.wcjs.playlist.items[this.wcjs.playlist.currentItem].title,
                lastItem: this.wcjs.playlist.currentItem,
                position: 0,
                pendingFiles: []
            });
        }

    }

    onScrobble(time) {

        time = parseInt(time);

        if (time < 0) time = 0;
        else if (this.length && time > this.length) time = this.length - 2000;

        if (!this.playing) {
            this.setState({
                position: time / this.length,
                currentTime: handleTime(time, this.length)
            });
        }

        this.wcjs.time = time;

        traktUtil.handleScrobble('start', this.itemDesc(), this.wcjs.position);

    }

    onScrobbleState(toState) {
        this.setState({
            scrobbling: toState
        });
    }

    onStopped() {
        console.log('Player stopped');
        this.setState({
            buffering: false,
            playing: false,
            paused: false,
            foundTrakt: false,
            subText: ''
        });
    }

    onVolume(value) {

        if (value > 200) // don't allow volume higher than 200%
            value = 200;

        if (value < 0)
            value = 0;

        if (this.muted) {
            if (this.wcjs)
                this.wcjs.mute = false;
            this.setState({
                muted: false
            });
        }

        this.setState({
            volume: value
        });

        ls('volume', value);

        if (this.wcjs)
            this.wcjs.volume = value

    }

    onMute(mute) {
        if (this.wcjs)
            this.wcjs.mute = mute;
        this.setState({
            muted: mute
        });
    }

    onPlaying() {
        if (!this.firstPlay) {
            // catch first play event
            this.wcjs.subtitles.track = 0;
            if (this.wcjs.volume != ls('volume'))
                this.wcjs.volume = ls('volume');
            var newObj = {
                title: this.wcjs.playlist.items[this.wcjs.playlist.currentItem].title,
                firstPlay: true,
                buffering: false,
                playing: true,
                paused: false
            };
            var itemDesc = this.itemDesc();
            if (itemDesc.setting && itemDesc.setting.trakt && !this.foundTrakt) {
                newObj.foundTrakt = true;
                var shouldScrobble = traktUtil.loggedIn ? ls.isSet('traktScrobble') ? ls('traktScrobble') : true : false;
                if (shouldScrobble) {
                    traktUtil.handleScrobble('start', itemDesc, this.wcjs.position);
                    if (!ls.isSet('playerNotifs') || ls('playerNotifs'))
                        this.notifier.info('Scrobbling', '', 4000);
                }
            }
            this.setState(newObj);

            var itemDesc = itemDesc.setting;

            if (itemDesc.subtitles) {
                this.setState({
                    foundSubs: true
                });
            } else if (itemDesc.path) {

                if (!ls.isSet('findSubs') || ls('findSubs')) {

                    var subQuery = {
                        filepath: itemDesc.path,
                        fps: this.wcjs.input.fps
                    };

                    if (itemDesc.byteSize)
                        subQuery.byteLength = itemDesc.byteSize;

                    if (itemDesc.torrentHash) {
                        subQuery.torrentHash = itemDesc.torrentHash;
                        subQuery.isFinished = false;
                    }

                    var player = this;

                    subQuery.cb = subs => {
                        if (!subs) {
                            if (!ls.isSet('playerNotifs') || ls('playerNotifs'))
                                player.notifier.info('Subtitles Not Found', '', 6000);
                        } else {
                            this.setState({
                                foundSubs: true
                            });
                            _.defer(() => {
                                playerActions.setDesc({
                                    subtitles: subs
                                });
                                if (!ls.isSet('playerNotifs') || ls('playerNotifs'))
                                    player.notifier.info('Found Subtitles', '', 6000);

                                if (!ls.isSet('autoSub') || ls('autoSub')) {
                                    if (ls('lastLanguage') && ls('lastLanguage') != 'none') {
                                        if (subs[ls('lastLanguage')]) {
                                            playerActions.loadSub(subs[ls('lastLanguage')]);
                                            // select it in the menu too
                                            if (this.wcjs.subtitles.count > 0)
                                                var itemIdx = this.wcjs.subtitles.count;
                                            else
                                                var itemIdx = 1;

                                            _.some(subs, (el, ij) => {
                                                itemIdx++;
                                                if (ij == ls('lastLanguage')) {
                                                    _.defer(() => {
                                                        playerActions.settingChange({
                                                            selectedSub: itemIdx
                                                        });
                                                    });
                                                    return true;
                                                } else {
                                                    return false;
                                                }
                                            })
                                        }
                                    }
                                }
                            });
                        }
                    };

                    subUtil.fetchSubs(subQuery);

                }
            }

        } else {
            traktUtil.handleScrobble('start', this.itemDesc(), this.wcjs.position);
        }
        this.audioTrackField.setValue(this.wcjs.audio[1]);
    }

    onPaused() {
        traktUtil.handleScrobble('pause', this.itemDesc(), this.wcjs.position);
    }

    onMediaChanged() {
        this.setState({
            firstPlay: false,
            foundSubs: false,
            subtitle: [],
            trackSub: -1,
            selectedSub: 1,
            subtitlesOpen: false,
            subText: '',
            audioChannel: 1,
            audioTrack: 1,
            aspectRatio: 'Default',
            crop: 'Default',
            zoom: 1,
            totalTime: '00:00'
        });

        _.defer(() => {
            playerActions.setSubDelay(0);
            playerActions.setAudioDelay(0);
            playerActions.setRate(1);
        });
        this.speedField.setValue('1.00x');
        this.subDelayField.setValue('0 ms');
        this.audioDelayField.setValue('0 ms');
        this.audioChannelField.setValue('Stereo');
        this.aspectField.setValue('Default');
        this.cropField.setValue('Default');
        this.zoomField.setValue('Default');
    }

    onDelayTime(q) {
        var t = q.jump;
        var d = q.delay;

        if (this.forceTime) {
            var forceProgress = ((this.seekPerc * this.length) + t) / this.length;
        } else {
            var forceProgress = ((this.wcjs.position * this.length) + t) / this.length;
        }

        if (forceProgress < 0) forceProgress = 0;
        else if (forceProgress > 1) forceProgress = 1;

        this.setState({
            keepScrobble: true,
            seekPerc: forceProgress,
            forceTime: true,
            overTime: handleTime((forceProgress * this.length), this.length),
            uiShown: true
        });

        if (this.scrobbleKeys) clearTimeout(this.scrobbleKeys);

        var scrobbleFunc = () => {
            this.wcjs.position = this.seekPerc;
            this.setState({
                forceTime: false,
                position: this.seekPerc,
                time: this.seekPerc * this.length,
                currentTime: handleTime((this.seekPerc * this.length), this.length)
            });
            _.delay(() => {
                playerActions.settingChange({
                    keepScrobble: false
                });
                _.delay(() => {
                    playerActions.settingChange({
                        uiShown: false
                    });
                }, 1000);
            }, 1500);
        };

        this.setState({
            scrobbleKeys: setTimeout(scrobbleFunc.bind(this), d)
        });

    }

    onPlay() {
        this.setState({
            buffering: false,
            playing: true,
            paused: false
        })
        this.wcjs.play();
    }

    onPlayItem(idx) {
        this.setState({
            buffering: false,
            foundTrakt: false
        })

        traktUtil.handleScrobble('stop', this.itemDesc(), this.wcjs.position);

        this.wcjs.playlist.playItem(idx[0]);
    }

    onPause() {
        this.setState({
            buffering: false,
            playing: false,
            paused: true
        })
        this.wcjs.pause();

        traktUtil.handleScrobble('pause', this.itemDesc(), this.wcjs.position);
    }

    onPrev() {
        if (this.wcjs.playlist.currentItem > 0) {
            this.setState({
                lastItem: -1,
                position: 0,
                foundTrakt: false
            });

            traktUtil.handleScrobble('stop', this.itemDesc(), this.wcjs.position);

            this.wcjs.playlist.prev();
        }
    }

    onNext() {
        if (this.wcjs.playlist.currentItem + 1 < this.wcjs.playlist.items.count) {
            this.setState({
                lastItem: -1,
                position: 0,
                foundTrakt: false
            });

            traktUtil.handleScrobble('stop', this.itemDesc(), this.wcjs.position);

            this.wcjs.playlist.next();
        }
    }

    onError() {

        console.log('Player encountered an error.');

        var itemDesc = this.itemDesc();

        traktUtil.handleScrobble('stop', itemDesc, this.wcjs.position);

        if (itemDesc.mrl.startsWith('https://player.vimeo.com/')) {

            // fix vimeo links on vlc 2.2.1

            var url = itemDesc.mrl,
                player = this.wcjs,
                lastItem = this.lastItem;

            player.stop();

            needle.get(url, function(error, response) {
                if (!error && response.statusCode == 200) {
                    var bestMRL;

                    // this can also be used to make a quality selector
                    // currently selecting 720p or best
                    response.body.request.files.progressive.some(el => {
                        if (el.quality == '720p') {
                            bestMRL = el.url;
                            return true;
                        } else {
                            bestMRL = el.url;
                            return false;
                        }
                    });

                    var image;

                    if (response.body.video.thumbs && response.body.video.thumbs.base) {
                        image = response.body.video.thumbs.base + '_320.jpg';
                    }

                    //                    player.playlist.clear();

                    playerActions.replaceMRL({
                        x: lastItem,
                        mrl: {
                            title: response.body.video.title,
                            uri: bestMRL
                        }
                    });

                    player.playlist.playItem(lastItem);

                    if (document.getElementById('item' + lastItem)) {
                        document.getElementById('item' + lastItem).style.background = "url('" + image + "')";
                        document.getElementById('itemTitle' + lastItem).innerHTML = response.body.video.title;
                    }
                    if (image)
                        _.delay(() => {
                            playerActions.setDesc({
                                idx: lastItem,
                                image: image
                            });
                        }, 500);
                }
            });

        }

    }

    onSetSubDelay(newDelay) {
        this.wcjs.subtitles.delay = newDelay;
        this.setState({
            subDelay: newDelay
        });
    }

    onSetAudioDelay(newDelay) {
        this.wcjs.audio.delay = newDelay;
        this.setState({
            audioDelay: newDelay
        });
    }

    onSetRate(newRate) {
        this.wcjs.input.rate = newRate;
        this.setState({
            rate: newRate
        });
    }

    onReplaceMRL(newObj) {

        var newX = newObj.x;
        var newMRL = newObj.mrl;

        this.setState({
            files: this.files.concat([newMRL])
        });

        this.wcjs.playlist.add(newMRL.uri);
        if (newMRL.title) {
            this.wcjs.playlist.items[this.wcjs.playlist.items.count - 1].title = newMRL.title;
        }

        var newDifference = this.wcjs.playlist.items.count - 1;
        var swapDifference = this.wcjs.playlist.items.count - newX - 1;

        if (newX == this.wcjs.playlist.currentItem && [3, 4].indexOf(this.wcjs.state) > -1) {
            var playerPos = this.position;
            this.wcjs.stop();
            this.wcjs.playlist.advanceItem(newDifference, swapDifference * (-1));
            this.wcjs.playlist.playItem(newX);
            this.wcjs.position = playerPos;

        } else this.wcjs.playlist.advanceItem(newDifference, swapDifference * (-1));

        this.wcjs.playlist.items[newX].setting = this.wcjs.playlist.items[newX + 1].setting;
        this.wcjs.playlist.removeItem(newX + 1);
    }

    onEnded() {
        console.log('Playback ended');

        this.setState({
            foundTrakt: false
        });

        traktUtil.handleScrobble('stop', this.itemDesc(), this.wcjs.position);

        if (this.wcjs.time > 0) {
            if (typeof this.lastItem !== 'undefined' && this.position && this.position < 0.95) {

                console.log('Playback Ended Prematurely');
                console.log('Last Known Position: ', this.position);
                console.log('Last Known Item: ', this.lastItem);
                console.log('Reconnecting ...');

                this.wcjs.playlist.currentItem = this.lastItem;
                this.wcjs.playlist.play();
                this.wcjs.position = this.position;
            }
        }
    }

    onSetDesc(obj) {
        if (typeof obj.idx === 'undefined')
            obj.idx = this.wcjs.playlist.currentItem;

        if (obj && typeof obj.idx === 'number') {
            var i = obj.idx;

            if (obj.title)
                this.wcjs.playlist.items[i].title = obj.title;

            if (i > -1 && i < this.wcjs.playlist.items.count) {
                if (this.wcjs.playlist.items[i].setting.length)
                    var wjsDesc = JSON.parse(this.wcjs.playlist.items[i].setting);
                else
                    var wjsDesc = {};

                if (obj)
                    for (var key in obj)
                        if (obj.hasOwnProperty(key))
                            wjsDesc[key] = obj[key];

                this.wcjs.playlist.items[i].setting = JSON.stringify(wjsDesc);
            }
        }
    }

    onClose() {
        this.setState({
            playing: false,
            paused: false,
            buffering: false,
            time: 0,
            length: 0,
            position: 0,
            volume: 100,

            title: '',
            fullscreen: false,
            uiShown: true,
            uri: false,
            currentTime: '00:00',
            totalTime: '00:00',

            lastItem: -1,

            pendingFiles: [],

            foundSubs: false,
            subtitle: [],
            trackSub: -1,
            selectedSub: 1,

            audioChannel: 1,
            audioTrack: 1,

            playlistOpen: false,
            subtitlesOpen: false,
            settingsOpen: false,

            aspectRatio: 'Default',
            crop: 'Default',
            zoom: 1
        });
        _.defer(() => {
            playerActions.setSubDelay(0);
            playerActions.setAudioDelay(0);
            playerActions.setRate(1);
        });
        this.speedField.setValue('1.00x');
        this.subDelayField.setValue('0 ms');
        this.audioDelayField.setValue('0 ms');
        this.audioChannelField.setValue('Stereo');
        this.aspectField.setValue('Default');
        this.cropField.setValue('Default');
        this.zoomField.setValue('Default');

        if (this.wcjs) {

            traktUtil.handleScrobble('stop', this.itemDesc(), this.wcjs.position);

            this.wcjs.stop();
            this.wcjs.playlist.clear();
        }
        playerActions.togglePowerSave(false);
    }

}

export
default alt.createStore(playerStore);