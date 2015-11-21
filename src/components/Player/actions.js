import alt from '../../alt'
import {
    ipcRenderer
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

            'fullscreen',

            'metaUpdate',
            'wcjsInit',
            'close',
            'open'
        );
    }

    toggleFullscreen(state) {
        ipcRenderer.send('app:fullscreen', state);
        this.actions.fullscreen(state);
    }
}


export
default alt.createActions(PlayerActions);