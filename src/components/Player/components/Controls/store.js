import alt from '../../../../alt'
import _ from 'lodash';
import ls from 'local-storage';
import {handleTime} from '../../utils/time';
import controlActions from './actions';
import PlayerStore from '../../store';
import PlayerActions from '../../actions';
import traktUtil from '../../utils/trakt';

var throttlers = {
    scrobbleKeys: false
};

class ControlStore {

    constructor() {
        this.bindActions(controlActions);

        this.keepScrobble = false;
        this.seekPerc = 0;
        this.currentTime = '00:00';
        this.totalTime = '00:00';
        this.position = 0;
        this.length = 0;
        this.volume = ls.isSet('volume') ? ls('volume') : 100;
        this.muted = false;
        this.forceTime = false;
        this.overTime = false;
        this.scrobbleHeight = 'scrobbler';
        this.scrobbleTooltip = 'none';
        this.progressHover = false;
        this.foundSubs = false;

        this.scrobbling = false;
        this.seekable = true;

    }

    onSettingChange(setting) {
        this.setState(setting);
    }

    onScrobble(time) {

        if (time < 0) time = 0;
        else if (this.length && time > this.length) time = this.length - 2000;

        var playerState = PlayerStore.getState();

        if (!playerState.playing)
            this.setState({
                position: time / this.length,
                currentTime: handleTime(time, this.length)
            });

        playerState.wcjs.time = time;

        traktUtil.handleScrobble('start', playerState.itemDesc(), playerState.wcjs.position);

    }

    onChangeTime(q) {
        var t = q.jump,
            d = q.delay;

        var wcjs = PlayerStore.getState().wcjs;

        if (this.forceTime)
            var forceProgress = ((this.seekPerc * this.length) + t) / this.length;
        else
            var forceProgress = ((wcjs.position * this.length) + t) / this.length;

        if (forceProgress < 0) forceProgress = 0;
        else if (forceProgress > 1) forceProgress = 1;

        this.setState({
            keepScrobble: true,
            seekPerc: forceProgress,
            forceTime: true,
            overTime: handleTime((forceProgress * this.length), this.length)
        });

        _.defer(() => {
            PlayerActions.settingChange({
                uiShown: true
            });
        });

        if (throttlers.scrobbleKeys) clearTimeout(throttlers.scrobbleKeys);

        var scrobbleFunc = () => {
            wcjs.position = this.seekPerc;
            this.setState({
                forceTime: false,
                position: this.seekPerc,
                time: this.seekPerc * this.length,
                currentTime: handleTime((this.seekPerc * this.length), this.length)
            });
            _.delay(() => {
                this.setState({
                    keepScrobble: false
                });
                _.delay(() => {
                    PlayerActions.settingChange({
                        uiShown: false
                    });
                }, 1000);
            }, 1500);
            throttlers.scrobbleKeys = false;

            traktUtil.handleScrobble('start', PlayerStore.getState().itemDesc(), this.seekPerc);
        };

        throttlers.scrobbleKeys = setTimeout(scrobbleFunc.bind(this), d);

    }

    onTime(time) {

        var newTime = handleTime(time, this.length);

        if (newTime != this.currentTime)
            this.setState({
                currentTime: handleTime(time, this.length)
            });

    }

    onPosition(pos) {
        if (this.position != pos)
            this.setState({
                position: pos
            });
    }

    onLength(length) {

        if (ls('speedPulsing') && ls('speedPulsing') == 'enabled')
            _.defer(PlayerActions.pulse);

        _.defer(() => {
            this.setState({
                length: length,
                totalTime: handleTime(length, length)
            });
        });
    }

    onDelayScrobbleGUI() {
        _.delay(() => {
            this.setState({
                keepScrobble: false
            })
        }, 1000);
    }

}

export
default alt.createStore(ControlStore);
