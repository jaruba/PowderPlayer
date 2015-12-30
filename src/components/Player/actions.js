import alt from '../../alt'
import _ from 'lodash';
import ipc from 'ipc';

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
            'loadSub',
            'setSubDelay',
            'setAudioDelay',

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

        document.querySelector(".canvas-holder > div:first-of-type").style.display = 'none';
        _.delay(() => {
            document.querySelector(".canvas-holder > div:first-of-type").style.display = 'block';
        }, 1000);

        ipc.send('app:fullscreen', state);
        this.actions.fullscreen(state);
    }
}


export
default alt.createActions(PlayerActions);