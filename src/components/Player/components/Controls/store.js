import alt from '../../../../alt'
import controlActions from './actions';

class ControlStore {

    constructor() {
        this.bindActions(controlActions);

        this.foundSubs = false;
        this.fullscreen = false;

    }

    onSettingChange(setting) {
        this.setState(setting);
    }

}

export
default alt.createStore(ControlStore);
