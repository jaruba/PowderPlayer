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

            'powerBlockState',
            'metaUpdate',
            'wcjsInit',
            'close',
            'open',
            'openPlaylist',

            'humanTime'
        );
        this.powerSaveBlocker = false;
    }

    togglePowerSave(state = true) {
        if (state) this.powerSaveBlocker = powerSaveBlocker.start('prevent-display-sleep');

        else if (this.powerSaveBlocker) powerSaveBlocker.stop(this.powerSaveBlocker);

        this.actions.powerBlockState(this.powerSaveBlocker ? powerSaveBlocker.isStarted(this.powerSaveBlocker) : false)

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