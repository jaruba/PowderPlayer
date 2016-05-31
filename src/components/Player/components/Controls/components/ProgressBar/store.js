import alt from '../../../../../../alt'
import progressActions from './actions';
import _ from 'lodash';
import player from '../../../../utils/player';
import traktUtil from '../../../../utils/trakt';
import TimeStore from '../HumanTime/store';
import TimeActions from '../HumanTime/actions';
import VisibilityStore from '../../../Visibility/store';
import VisibilityActions from '../../../Visibility/actions';
import {handleTime} from '../../../../utils/time';

var throttlers = {
    scrobbleKeys: false
};

class ProgressStore {

    constructor() {
        this.bindActions(progressActions);

        this.keepScrobble = false;
        this.seekPerc = 0;
        this.position = 0;
        this.scrobbleHeight = 'scrobbler';
        this.scrobbling = false;
        this.seekable = true;
        this.cache = 0;

    }

    onSettingChange(setting) {
        if (setting.position == 0) {
            // remove transition for progress bar periodically
            var progressElem = document.querySelector('.wcjs-player .time');
            if (progressElem) {
                progressElem.className = progressElem.className.split(' smooth-progress').join('');
                _.delay( () => {
                    progressElem.className = progressElem.className + ' smooth-progress';
                }, 100);
            }
        }
        this.setState(setting);
    }
    
    onSetCache(float) {
        this.setState({
            cache: float
        });
    }


    onSeekable(state) {
        this.setState({
            seekable: state
        });
    }

    onScrobble(time) {

        if (time < 0) time = 0;
        else if (player.wcjs.length && time > player.wcjs.length) time = player.wcjs.length - 2000;

        if (!player.wcjs.playing) {
            this.setState({
                position: time / player.wcjs.length
            });
            _.defer(() => {
                TimeActions.settingChange({
                    currentTime: handleTime(time, player.wcjs.length)
                });
            });
        }

        if (player.wcjs.state == 6) {
            // if playback ended, restart last item
            player.playItem( player.wcjs.playlist.itemCount - 1 , true );
        }

        player.wcjs.time = time;

        traktUtil.handleScrobble('start', player.itemDesc(), player.wcjs.position);

    }

    onChangeTime(q) {

        var t = q.jump,
            d = q.delay;

        var wcjs = player.wcjs;

        if (TimeStore.getState().forceTime)
            var forceProgress = ((this.seekPerc * wcjs.length) + t) / wcjs.length;
        else
            var forceProgress = ((wcjs.position * wcjs.length) + t) / wcjs.length;

        if (forceProgress < 0) forceProgress = 0;
        else if (forceProgress > 1) forceProgress = 1;

        this.setState({
            keepScrobble: true,
            seekPerc: forceProgress,
        });
        
        _.defer(() => {
            TimeActions.settingChange({
                forceTime: true,
                overTime: handleTime((forceProgress * wcjs.length), wcjs.length)
            });
            if (!VisibilityStore.getState().uiShown)
                VisibilityActions.settingChange({
                    uiShown: true
                });
        });

        if (throttlers.scrobbleKeys) clearTimeout(throttlers.scrobbleKeys);
        if (throttlers.scrobbleKeys2) clearTimeout(throttlers.scrobbleKeys2);
        if (throttlers.scrobbleKeys3) clearTimeout(throttlers.scrobbleKeys3);

        var scrobbleFunc = () => {
            wcjs.position = this.seekPerc;
            this.setState({
                position: this.seekPerc,
            });
            _.defer(() => {
                TimeActions.settingChange({
                    forceTime: false,
                    time: this.seekPerc * wcjs.length,
                    currentTime: handleTime((this.seekPerc * wcjs.length), wcjs.length)
                });
            });
            throttlers.scrobbleKeys2 = setTimeout(() => {
                this.setState({
                    keepScrobble: false
                });
                throttlers.scrobbleKeys3 = setTimeout(() => {
                    if (VisibilityStore.getState().uiShown)
                        VisibilityActions.settingChange({
                            uiShown: false
                        });
                }, 1000);
            }, 1500);
            throttlers.scrobbleKeys = false;

            traktUtil.handleScrobble('start', player.itemDesc(), this.seekPerc);
        };

        throttlers.scrobbleKeys = setTimeout(scrobbleFunc.bind(this), d);

    }

    onPosition(pos) {
        if (player.wcjs.state == 5) pos = 0;
        if (this.position != pos)
            this.setState({
                position: pos
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
default alt.createStore(ProgressStore);
