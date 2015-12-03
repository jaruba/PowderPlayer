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

    }

    onSettingChange(setting) {
        this.setState(setting);
    }

    onWcjsInit(wcjs) {
        this.setState({
            wcjs: wcjs,
            itemDesc: i => {
                if (typeof i === 'number') {
                    if (i > -1 && i < wcjs.playlist.items.count) {
                        
                        if (!wcjs.playlist.items[i].setting) wcjs.playlist.items[i].setting = '{}';
                        var wjsDesc = JSON.stringify(wcjs.playlist.items[i]);
                        
                        return JSON.parse(wjsDesc.split('\\"').join('"').split('"{').join('{').split('}"').join('}'));
                        
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

    onOpening() {
        if (this.wcjs.playlist.currentItem != this.lastItem) {
            this.setState({
                title: this.wcjs.playlist.items[this.wcjs.playlist.currentItem].title,
                lastItem: this.wcjs.playlist.currentItem,
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
            paused: false
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
        this.setState({
            title: this.wcjs.playlist.items[this.wcjs.playlist.currentItem].title,
            buffering: false,
            playing: true,
            paused: false
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
            buffering: false
        })
        this.wcjs.playlist.playItem(idx[0]);
    }

    onPause() {
        this.setState({
            buffering: false,
            playing: false,
            paused: true
        })
        this.wcjs.pause();
    }

    onPrev() {
        this.wcjs.playlist.prev();
    }

    onNext() {
        this.wcjs.playlist.next();
    }

    onError() {

        console.log('Player encountered an error.');

        if (this.itemDesc(this.wcjs.playlist.currentItem).mrl.startsWith('https://player.vimeo.com/')) {

            // fix vimeo links on vlc 2.2.1

            var url = this.itemDesc(this.wcjs.playlist.currentItem).mrl,
                player = this.wcjs;

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

                    player.playlist.clear();

                    playerActions.addPlaylist([{
                        title: response.body.video.title,
                        uri: bestMRL
                    }]);
                }
            });
            
        }

    }

    onEnded() {
        console.log('Playback ended');
        if (this.time > 0) {
            if (typeof this.lastItem !== 'undefined' && this.position < 0.95) {

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
    
    onItemCount() {
        if (this.wcjs)
            return this.wcjs.playlist.items.count;
        return false;
    }
    
    onSetDesc(obj) {
        if (obj && typeof obj.idx === 'number') {
            var i = obj.idx;
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
            this.wcjs.stop();
            this.wcjs.playlist.clear();
        }
        playerActions.togglePowerSave(false);
    }

}

export
default alt.createStore(playerStore);