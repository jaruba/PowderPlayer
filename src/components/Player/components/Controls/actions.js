import alt from '../../../../alt';
import _ from 'lodash';
import ls from 'local-storage';
import ipc from 'ipc';
import player from '../../utils/player';

class ControlActions {

    constructor() {
        this.generateActions(
            'settingChange'
        );
    }

    handlePausePlay() {
        player.wcjs.togglePause();
    }

    toggleFullscreen(state) {
        if (typeof state !== 'boolean') state = !this.alt.stores.ControlStore.state.fullscreen;

        window.document.querySelector(".render-holder > div:first-of-type").style.display = 'none';
        _.delay(() => {
            window.document.querySelector(".render-holder > div:first-of-type").style.display = 'block';
        }, 500);

        ipc.send('app:fullscreen', state);
        this.actions.settingChange({
            fullscreen: state
        });
    }

}


export
default alt.createActions(ControlActions);
