import alt from '../../../../alt'
import VisibilityActions from './actions';

class VisibilityStore {

    constructor() {
        this.bindActions(VisibilityActions);

        this.playlist = false;
        this.settings = false;
        this.subtitles = false;
        this.casting = false;
        this.uiShown = true;
        this.uiHidden = false;

    }

    onSettingChange(setting) {
        this.setState(setting);
    }

    onToggleMenu(menu) {
        var obj = {
            playlist: false,
            settings: false,
            casting: false,
            subtitles: false
        };
        obj[menu] = !this[menu];
        this.setState(obj);
    }

    onUiShown(toggle) {
        this.setState({
            uiShown: toggle
        });
    }

}

export
default alt.createStore(VisibilityStore);
