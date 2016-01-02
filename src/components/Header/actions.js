import alt from '../../alt'
import ipc from 'ipc';
import remote from 'remote';

class HeaderActions {
    constructor() {
        this.generateActions(
            'maximize',
            'minimize'
        );
    }

    toggleMaximize() {
        this.dispatch();
        let state = !ipc.sendSync('app:get:maximized');
        ipc.send('app:maximize', state);
        this.actions.maximize(state);
        document.querySelector('header .controls.win32 div.toggle i:nth-of-type(2)').style.display = state ? 'block' : 'none';
    }

    toggleMinimize() {
        this.dispatch();
        remote.getCurrentWindow().minimize();
        this.actions.minimize();
    }

    close() {
        ipc.send('app:close');
    }
}


export
default alt.createActions(HeaderActions);
