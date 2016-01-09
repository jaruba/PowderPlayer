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
        this.delay = 0;
        this.marginBottom = '70px';
        this.selectedSub = 1;
        this.trackSub = -1;

    }

    onSettingChange(setting) {
        this.setState(setting);
    }

    onSetSubDelay(newDelay) {
        PlayerStore.getState().wcjs.subtitles.delay = newDelay;
        this.setState({
            subDelay: newDelay
        });
    }

}

export
default alt.createStore(SubtitleStore);
