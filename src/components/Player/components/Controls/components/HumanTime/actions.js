import alt from '../../../../../../alt'
import SubtitleActions from '../../../SubtitleText/actions';
import {handleTime} from '../../../../utils/time';
import ls from 'local-storage';

class TimeActions {

    constructor() {
        this.generateActions(
            'settingChange',
            'time',
            'length'
        );
    }
    
    pushTime(time) {
        var visibilityState = this.alt.stores.VisibilityStore.state;
        if (ls('renderHidden') || ((visibilityState.uiShown && !visibilityState.uiHidden) || (visibilityState.playlist || visibilityState.settings))) {
            var timeState = this.alt.stores.TimeStore.state;
            var newTime = handleTime(time, timeState.length);
            if (newTime != timeState.currentTime)
                this.actions.time(time);
        }

        SubtitleActions.time(time); // print subtitle text if a subtitle is selected
    }

}


export
default alt.createActions(TimeActions);
