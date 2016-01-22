import alt from '../../../../../../alt'
import tooltipActions from './actions';

class TooltipStore {

    constructor() {
        this.bindActions(tooltipActions);

        this.scrobbleTooltip = 'none';

    }

    onSettingChange(setting) {
        this.setState(setting);
    }

}

export
default alt.createStore(TooltipStore);
