import alt from '../../alt'
import _ from 'lodash';
import {
    ipcRenderer, powerSaveBlocker
}
from 'electron';

class PlayerActions {
    constructor() {
        this.generateActions(
            'play',
            'pause',
            'stop',
            'stopped',


            'playing',
            'uiShown',
            'position',
            'buffering',
            'seekable',
            'time',
            'length',
            'scrobble',
            'scrobbleState',

            'fullscreen',
            'metaUpdate',
            'wcjsInit',
            'close',
            'open',
            'openPlaylist',

            'humanTime'
        );
    }

    togglePowerSave(state = true) {
        if (state) this.powerBlock = powerSaveBlocker.start('prevent-display-sleep');

        else this.powerBlock ? powerSaveBlocker.stop(this.powerBlock) : return;
    }

    toggleFullscreen(state) {
        this.dispatch();

        document.querySelector(".canvas-holder > div:first-of-type").style.display = 'none';
        _.delay(() => {
            document.querySelector(".canvas-holder > div:first-of-type").style.display = 'block';
        }, 1000);

        ipcRenderer.send('app:fullscreen', state);
        this.actions.fullscreen(state);
    }
}


export
default alt.createActions(PlayerActions);