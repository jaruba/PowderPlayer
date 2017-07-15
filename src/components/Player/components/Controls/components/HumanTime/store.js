import alt from '../../../../../../alt'
import _ from 'lodash';
import ls from 'local-storage';
import {handleTime} from '../../../../utils/time';
import timeActions from './actions';
import PlayerStore from '../../../../store';
import PlayerActions from '../../../../actions';
import VisibilityStore from '../../../Visibility/store';
import VisibilityActions from '../../../Visibility/actions';
import traktUtil from '../../../../utils/trakt';
import player from '../../../../utils/player';

var throttlers = {
    scrobbleKeys: false
};

class TimeStore {

    constructor() {
        this.bindActions(timeActions);

        this.currentTime = '00:00';
        this.totalTime = '00:00';
        this.length = 0;
        this.forceTime = false;
        this.overTime = false;

    }

    onSettingChange(setting) {
        this.setState(setting);
    }

    onTime(time) {
        this.setState({
            currentTime: handleTime(time, this.length)
        });
    }

    onLength(length) {

        if (ls('speedPulsing') && ls('speedPulsing') == 'enabled')
            _.defer(PlayerActions.pulse);

        if (ls('forceDownload'))
            _.defer(PlayerActions.startForceDownload);

        _.defer(() => {
            this.setState({
                length: length,
                totalTime: handleTime(length, length)
            });
        });
    }

}

export
default alt.createStore(TimeStore);
