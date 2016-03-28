import alt from '../../alt'
import {
    ipcRenderer
}
from 'electron';
import remote from 'remote';
import engineStore from '../../stores/engineStore';
import ModalActions from '../Modal/actions';
import ls from 'local-storage';

class HeaderActions {
    constructor() {
        this.generateActions(
            'maximize',
            'minimize'
        );
    }

    toggleMaximize() {
        this.dispatch();
        let state = !ipcRenderer.sendSync('app:get:maximized');
        ipcRenderer.send('app:maximize', state);
        this.actions.maximize(state);
        document.querySelector('header .controls.win32 div.toggle i:nth-of-type(2)').style.display = state ? 'block' : 'none';
    }

    toggleMinimize() {
        this.dispatch();
        remote.getCurrentWindow().minimize();
        this.actions.minimize();
    }

    close() {
        var engineState = engineStore.getState();
        
        if (engineState.infoHash && engineState.torrents[engineState.infoHash]) {
            // it's a torrent, let's see if we should remove the files
            if (ls('removeLogic') < 1) {
                ModalActions.shouldExit(true);
                ModalActions.open({ type: 'askRemove' });
            } else {
                var torrent = engineState.torrents[engineState.infoHash];

                if (ls('removeLogic') == 1) {
                    torrent.kill(() => {
                        ipcRenderer.send('app:close');
                    });
                } else if (ls('removeLogic') == 2) {
                    torrent.softKill(() => {
                        ipcRenderer.send('app:close');
                    });
                }
            }
        } else {
            ipcRenderer.send('app:close');
        }
    }
}


export
default alt.createActions(HeaderActions);
