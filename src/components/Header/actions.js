import alt from '../../alt'
import {
    ipcRenderer
}
from 'electron';

class HeaderActions {
    constructor() {
        this.generateActions(
            'maximize',
            'minimize',
            'close'
        );
    }

    toggleMaximize(state) {
        this.dispatch();
        ipcRenderer.send('app:maximize', state);
        this.actions.maximize(state);
    }

    toggleMinimize() {
        this.dispatch();
        ipcRenderer.send('app:minimize');
        this.actions.minimize();
    }
}


export
default alt.generateActions(HeaderActions);