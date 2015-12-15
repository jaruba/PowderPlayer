import _ from 'lodash';
import {
    ipcRenderer
}
from 'electron';
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

import TraktSnackbar from '../TraktMessage/actions';

class playerStore {
    constructor() {
        this.bindActions(playerActions);

        this.uri = false;
        this.title = '';
        this.wcjs = false;

        this.playing = false;
        this.paused = false;

        this.alwaysOnTop = false;
        this.rippleEffects = localStorage.playerRippleEffects ? (localStorage.playerRippleEffects === "true") : true;

        this.muted = false;
        this.volume = 100;
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
        this.playlistOpen = false;

        this.currentTime = '00:00';
        this.totalTime = '00:00';

        this.scrobbling = false;
        
        this.itemDesc = i => { return false };
        
        this.firstPlay = false;
        
        this.foundTrakt = false;

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
                        
                        // clone object, don't reference
                        var wjsDesc = {};
                        
                        _.forEach(wcjs.playlist.items[i], (el, ij) => {
                            wjsDesc[ij] = el;
                        });
                        
                        if (!wjsDesc.setting) wjsDesc.setting = "{}";
                        
                        wjsDesc.setting = JSON.parse(wjsDesc.setting);

                        return wjsDesc;
    
                    }
                }
                return false;
            }
        });
    }

    onTogglePlaylist() {
        this.setState({
            playlistOpen: !this.playlistOpen
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
    
    onParseURL(qTask) {
        if (!this.urlParserQueue) {
            var player = this;
            var parserQueue = async.queue( (task, cb) => {
                if (task.url && !task.filename) {
                    var client = new MetaInspector(task.url, { timeout: 5000 });
        
                    client.on("fetch", function(){
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
    
                            if (document.getElementById('item'+idx)) {
                                document.getElementById('item'+idx).style.background = "url('"+client.image+"')";
                                document.getElementById('itemTitle'+idx).innerHTML = client.title;
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
                
                    client.on("error", function(err){
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

                            summary(buildQuery).then( results => {

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
                                    
                                    if (document.getElementById('item'+idx)) {
                                        if (newObj.image)
                                            document.getElementById('item'+idx).style.background = "url('"+newObj.image+"')";
                                            
                                        if (newObj.title)
                                            document.getElementById('itemTitle'+idx).innerHTML = newObj.title;
                                    }
                                    
                                    newObj.parsed = parsedFilename;
                                    newObj.trakt = results;
                                    
                                    playerActions.setDesc(newObj);
                                    if (idx == player.wcjs.playlist.currentItem) {
                                        player.setState({
                                            title: newObj.title,
                                            foundTrakt: true
                                        });
                                        if (player.wcjs.time > 0) {
                                            TraktSnackbar.open('Scrobbling');

                                            traktUtil.scrobble('start', player.wcjs.position, results);
                                        }
                                    }
                            
                                    _.delay(() => {
                                        cb()
                                    }, 500)
                                    
                                }
                            }).catch( err => {
                                if (!task.secondTry && parsedFilename.type == 'series') {
                                    task.secondTry = true;
                                    parserQueue.push(task);
                                }
                                console.log('Error: '+ err.message);
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

    onLength(length) {
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
                    if (data[i].title) {
                        this.wcjs.playlist.items[this.wcjs.playlist.items.count-1].title = data[i].title;
                    }
                }
            }

            if (playAfter) this.wcjs.playlist.playItem(0);
                    
        }

        _.defer(() => {
            historyStore.getState().history.replaceState(null, 'player');
        });

    }

    onBuffering(perc) {
        if (perc === 100) {
            this.setState({
                buffering: false
            });
        } else {
            this.setState({
                buffering: perc
            })
        }
    }
    
    onUpdateImage(image) {

        if (document.getElementById('canvasEffect')) {

            if (this.wcjs.playlist.items[this.wcjs.playlist.currentItem].mrl.indexOf('soundcloud.com') > -1 && image) {
                var image = image.replace('large', 't500x500');
                document.getElementById('canvasEffect').parentNode.style.cssText = "background-color: transparent !important";
                document.getElementById('playerCanvas').style.display = "none";
                document.getElementsByClassName('wcjs-player')[0].style.background = "url('"+image+"') 50% 50% / contain no-repeat black";
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
                } catch(e) {}
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
            foundTrakt: false
        });
    }

    onVolume(value) {

        if (value > 150) //dont allow volume higher than 150%
            value = 150;

        this.setState({
            volume: value
        });
        if (this.wcjs)
            this.wcjs.volume = value
    }

    onMute(mute) {
        if (this.wcjs)
            this.wcjs.muted(muted);
        this.setState({
            muted: muted
        });
    }


    onPlaying() {
        
        if (!this.firstPlay) {
            // catch first play event
            var newObj = {
                title: this.wcjs.playlist.items[this.wcjs.playlist.currentItem].title,
                firstPlay: true,
                buffering: false,
                playing: true,
                paused: false
            };
            var itemDesc = this.itemDesc();
            if (itemDesc.setting && itemDesc.setting.trakt) {
                newObj.foundTrakt = true;
                traktUtil.handleScrobble('start', itemDesc, this.wcjs.position);
            }
            this.setState(newObj);
        } else {
            traktUtil.handleScrobble('start', this.itemDesc(), this.wcjs.position);
        }
        
    }
    
    onPaused() {
        traktUtil.handleScrobble('pause', this.itemDesc(), this.wcjs.position);
    }
    
    onMediaChanged() {
        this.setState({
            firstPlay: false
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
        if (this.wcjs.playlist.currentItem+1 < this.wcjs.playlist.items.count) {
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
                    response.body.request.files.progressive.some( el => {
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

                    if (document.getElementById('item'+lastItem)) {
                        document.getElementById('item'+lastItem).style.background = "url('"+image+"')";
                        document.getElementById('itemTitle'+lastItem).innerHTML = response.body.video.title;
                    }
                    if (image) 
                        _.delay(() => {
                            playerActions.setDesc({
                                idx: lastItem,
                                image: image
                            });
                        },500);
                }
            });
            
        }

    }

    onReplaceMRL(newObj) {
        
        var newX = newObj.x;
        var newMRL = newObj.mrl;
        
        this.setState({
            files: this.files.concat([newMRL])
        });

        this.wcjs.playlist.add(newMRL.uri);
        if (newMRL.title) {
            this.wcjs.playlist.items[this.wcjs.playlist.items.count-1].title = newMRL.title;
        }
        
        var newDifference = this.wcjs.playlist.items.count -1;
        var swapDifference = this.wcjs.playlist.items.count - newX -1;
            
        if (newX == this.wcjs.playlist.currentItem && [3, 4].indexOf(this.wcjs.state) > -1) {
            var playerPos = this.position;
            this.wcjs.stop();
            this.wcjs.playlist.advanceItem(newDifference,swapDifference*(-1));
            this.wcjs.playlist.playItem(newX);
            this.wcjs.position = playerPos;
            
        } else this.wcjs.playlist.advanceItem(newDifference,swapDifference*(-1));
    
        this.wcjs.playlist.items[newX].setting = this.wcjs.playlist.items[newX+1].setting;
        this.wcjs.playlist.removeItem(newX+1);
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
        if (obj && typeof obj.idx === 'number') {
            var i = obj.idx;
            if (obj.title) {
                this.wcjs.playlist.items[i].title = obj.title;
            }
            if (i > -1 && i < this.wcjs.playlist.items.count) {

                if (this.wcjs.playlist.items[i].setting.length) {
                    var wjsDesc = JSON.parse(this.wcjs.playlist.items[i].setting);
                } else {
                    var wjsDesc = {};
                }

                if (obj) {
                    for (var key in obj) {
                        if (obj.hasOwnProperty(key)) {
                            wjsDesc[key] = obj[key];
                        }
                    }
                }
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

            pendingFiles: []
        });
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