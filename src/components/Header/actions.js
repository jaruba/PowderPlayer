import alt from '../../alt'
import {
    ipcRenderer
}
from 'electron';

class HeaderActions {
    constructor() {
        this.generateActions(
            'maximize',
            'minimize'
        );
    }

    close(){
    	ipcRenderer.send('app:close');
    }

    toggleMaximize() {
        this.dispatch();
        let state = !ipcRenderer.send('app:get:maximized');
        ipcRenderer.send('app:maximize', state);
        this.actions.maximize(state);
    }

    toggleMinimize() {
        this.dispatch();
        console.log('toggleMinimize')
        ipcRenderer.send('app:minimize');
        this.actions.minimize();
    }
}


export
default alt.generateActions(HeaderActions);