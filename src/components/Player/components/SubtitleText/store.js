import alt from '../../../../alt'
import subUtil from '../../utils/subtitles';
import SubtitleActions from './actions';
import PlayerStore from '../../store';

class SubtitleStore {

    constructor() {
        this.bindActions(SubtitleActions);

        this.subtitle = [];
        this.text = '';
        this.size = 21.3;
        this.marginBottom = '70px';
        this.selectedSub = 1;
        this.trackSub = -1;

    }

    onSettingChange(setting) {
        this.setState(setting);
    }

}

export
default alt.createStore(SubtitleStore);
