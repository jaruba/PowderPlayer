import alt from '../../alt'
import _ from 'lodash';
import ipc from 'ipc';
import subUtil from './utils/subtitles';

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

    loadSub(subLink) {
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
