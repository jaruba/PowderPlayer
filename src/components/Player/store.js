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


class playerStore {
    constructor() {
        this.bindActions(playerActions);

        this.uri = false;
        this.title = '';
        this.wcjs = false;

        this.playing = false;
        this.paused = false;

        this.alwaysOnTop = false

        this.muted = false;
        this.volume = 100;
        this.position = 0;
        this.buffering = false;
        this.time = 0;
        this.length = 0;
        this.seekable = false;

        this.files = {};
        this.playlist = {};

        this.fullscreen = false;
        this.uiShown = true;
        this.playlistOpen = false;

        this.currentTime = '00:00';
        this.totalTime = '00:00';

        this.scrobbling = false;
        
        this.itemDesc = (i) => { return false };

    }

    onSettingChange(setting) {
        this.setState(setting);
    }

    onWcjsInit(wcjs) {
        this.setState({
            wcjs: wcjs,
            itemDesc: (i) => {
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

    onOpen(data) {
        this.setState({
            title: data.title,
            uri: data.uri
        });

        playerActions.togglePowerSave(true);

        if (data.files)
            playerActions.createPlaylist(data.files);

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
                lastItem: this.wcjs.playlist.currentItem
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

    onPause() {
        this.setState({
            buffering: false,
            playing: false,
            paused: true
        })
        this.wcjs.pause();
    }

    onError() {
        console.log('Player encountered an error.');
        this.wcjs.stop();
    }

    onEnded() {
        if (this.time > 0) {
            if (typeof this.lastItem !== 'undefined' && this.position < 0.95) {

                console.log('Playback Ended Prematurely');
                console.log('Last Known Position: ', this.position);
                console.log('Last Known Item: ', this.lastItem);
                console.log('Reconnecting ...');

                this.wcjs.playlist.currentItem = this.lastItem;
                this.wcjs.playlist.play();
                this.wcjs.position = this.position;
            } else {
                console.log('Playback has Ended');
            }
        }
    }
    
    onItemCount() {
        if (this.wcjs)
            return this.wcjs.playlist.items.count;
        return false;
    }
    
    onSetItemState(obj) {
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
            totalTime: '00:00'

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