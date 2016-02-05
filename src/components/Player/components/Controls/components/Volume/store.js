import alt from '../../../../../../alt'
import ls from 'local-storage';
import volumeActions from './actions';

class VolumeStore {

    constructor() {
        this.bindActions(volumeActions);

        this.volume = ls.isSet('volume') ? ls('volume') : 100;
        this.muted = false;

    }

    onSettingChange(setting) {
        this.setState(setting);
    }

}

export
default alt.createStore(VolumeStore);
