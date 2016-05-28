import alt from '../../../../alt';
import _ from 'lodash';
import ls from 'local-storage';
import {
    ipcRenderer
}
from 'electron';
import player from '../../utils/player';

class ControlActions {

    constructor() {
        this.generateActions(
            'settingChange'
        );
    }

    handlePausePlay() {
        if (player.wcjs.state == 6) {
            // if playback ended, restart last item
            player.playItem( player.wcjs.playlist.itemCount - 1 , true );
        } else {
            player.wcjs.togglePause();
        }
    }

    toggleFullscreen(state) {
        if (typeof state !== 'boolean') state = !this.alt.stores.ControlStore.state.fullscreen;

        var canvasEffect = window.document.querySelector(".render-holder > div:first-of-type");

        if (canvasEffect) {
            canvasEffect.style.display = 'none';
            _.delay(() => {
                canvasEffect.style.display = 'block';
            }, 500);
        }

        ipcRenderer.send('app:fullscreen', state);
        this.actions.settingChange({
            fullscreen: state
        });
    }

}


export
default alt.createActions(ControlActions);
