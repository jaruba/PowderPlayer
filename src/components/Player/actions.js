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
            'scrobbleState',

            'fullscreen',

            'metaUpdate',
            'wcjsInit',
            'close',
            'open',
            
            'humanTime'
        );
    }

    toggleFullscreen(state) {
        this.dispatch();
        ipcRenderer.send('app:fullscreen', state);
        this.actions.fullscreen(state);
    }
}


export
default alt.createActions(PlayerActions);