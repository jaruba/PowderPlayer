import alt from '../../alt';
import playerActions from './actions';
import historyStore from '../../stores/historyStore';
import _ from 'lodash';
import {
    handleTime
}
from './utils/time';

class playerStore {
    constructor() {
        this.bindActions(playerActions);

        this.uri = false;
        this.title = '';
        this.wcjs = false;

        this.playing = false;
        this.paused = false;


        this.position = 0;
        this.buffering = false;
        this.time = 0;
        this.length = 0;
        this.seekable = false;

        this.files = [];
        this.playlist = {};

        this.fullscreen = false;
        this.uiShown = true;
        this.playlistOpen = false;

        this.currentTime = '00:00';
        this.totalTime = '00:00';

        this.scrobbling = false;

    }

    onWcjsInit(wcjs) {
        this.setState({
            wcjs: wcjs
        });
    }

    onOpenPlaylist(state = true) {
        this.setState({
            playlistOpen: state
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
            totalTime: handleTime(length)
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
        this.player.stop();
    }

    onEnded() {
        if (this.time > 0) {
            if (typeof this.lastItem !== 'undefined' && this.position < 0.95) {
                
                console.log('Playback Ended Prematurely');
                console.log('Last Known Position: ',this.position);
                console.log('Last Known Item: ',this.lastItem);
                console.log('Reconnecting ...');
                
                this.wcjs.playlist.currentItem = this.lastItem;
                this.wcjs.playlist.play();
                this.wcjs.position = this.position;
            } else {
                console.log('Playback has Ended');
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