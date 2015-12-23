import alt from '../../alt'
import ipc from 'ipc';

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
    }

    toggleMinimize() {
        this.dispatch();
        ipc.send('app:minimize');
        this.actions.minimize();
    }

    close() {
        ipc.send('app:close');
    }
}


export
default alt.createActions(HeaderActions);
