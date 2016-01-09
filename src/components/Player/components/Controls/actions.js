import alt from '../../../../alt'
import {handleTime} from '../../utils/time';
import _ from 'lodash';
import ls from 'local-storage';
import PlayerStore from '../../store';
import PlayerActions from '../../actions';
import SubtitleActions from '../SubtitleText/actions';

var throttlers = {};

class ControlActions {

    constructor() {
        this.generateActions(
            'settingChange',
            'changeTime',
            'time',
            'position',
            'length',
            'scrobble',
            'delayScrobbleGUI'
        );
    }
    
    pushTime(time) {
        this.actions.time(time);
        SubtitleActions.time(time); // print subtitle text if a subtitle is selected
    }

    handlePausePlay() {
        PlayerStore.getState().playing ? PlayerActions.pause() : PlayerActions.play();
    }

    handleFullscreen() {
        PlayerActions.toggleFullscreen(!PlayerStore.getState().fullscreen);
    }

    handleScrobblerThrottle(pageX) {
        if (!throttlers.scrobble)
            throttlers.scrobble = _.throttle(this.actions.handleScrobblerHover, 50);
        throttlers.scrobble(pageX);
    }

    handleScrobblerHover(pageX) {

        var controlState = this.alt.stores.ControlStore.state,
            newState = {},
            total_time = controlState.length,
            percent_done = pageX / document.body.clientWidth,
            newTime = total_time * percent_done;

        if (controlState.scrobbleTooltip != 'inline-block')
            newState.scrobbleTooltip = 'inline-block';

        if (controlState.currentTime != '00:00') {

            if (percent_done <= 0.5)
                var realPos = Math.floor(window.innerWidth * percent_done) - controlState.tooltipHalf;
            else
                var realPos = Math.floor(window.innerWidth * percent_done) + controlState.tooltipHalf;

            var seekTime = handleTime(percent_done * controlState.length, controlState.length);

            if (seekTime.length > 5)
                newState.tooltipHalf = 33;
            else
                newState.tooltipHalf = 24;

            if (realPos < 0) newState.tooltipLeft = newState.tooltipHalf + 'px';
            else if (realPos > window.innerWidth) newState.tooltipLeft = (window.innerWidth - newState.tooltipHalf) + 'px';
            else newState.tooltipLeft = (percent_done * 100) + '%';

            newState.humanTime = seekTime;
        }

        if (controlState.scrobbling)
            newState.seekPerc = percent_done < 0 ? 0 : percent_done > 1 ? 1 : percent_done;

        if (Object.keys(newState).length)
            this.actions.settingChange(newState);

    }
    
    handleScrobble(event) {

        var controlState = this.alt.stores.ControlStore.getState();

        if (!controlState.length || !controlState.seekable)
            return;

        _.delay(() => {
            if (event.pageX) {
                this.actions.settingChange({
                    keepScrobble: true,
                    scrobbling: false,
                    position: controlState.seekPerc,
                    scrobbleHeight: controlState.scrobbleHeight.replace(' scrobbling', '')
                });

                this.actions.delayScrobbleGUI();
                var percent_done = event.pageX / document.body.clientWidth;
                this.actions.scrobble(controlState.length * percent_done);
            }
        }, 50);

    }

    handleDragStart(event) {

        var controlState = this.alt.stores.ControlStore.state,
            percent_done = event.pageX / document.body.clientWidth;

        this.actions.settingChange({
            keepScrobble: true,
            seekPerc: percent_done,
            scrobbling: true,
            scrobbleHeight: controlState.scrobbleHeight + ' scrobbling'
        });
        this.actions.delayScrobbleGUI();
    }

    handleDragEnter(event) {
        this.actions.settingChange({
            progressHover: true
        });
    }

    handleDragEnd() {
        this.actions.settingChange({
            progressHover: false,
            scrobbleTooltip: 'none'
        });
    }

    handleGlobalMouseMove(pageX) {
        var controlState = this.alt.stores.ControlStore.state;
        if (controlState.scrobbling)
            this.actions.handleScrobblerThrottle(pageX);
    }

    handleGlobalMouseUp(event) {
        var controlState = this.alt.stores.ControlStore.state;
        if (controlState.scrobbling) {
            _.delay(() => {
                this.actions.handleScrobble(event);
                _.delay(() => {
                    this.actions.settingChange({
                        scrobbleTooltip: 'none'
                    });
                },100);
            },50);
        }
    }

    delayTime(t) {
        if (!throttlers.timeChange)
            throttlers.timeChange = _.throttle(this.actions.changeTime, 100);
        throttlers.timeChange(t);
    }

    handleVolume(event, t) {
        if (!throttlers.volume)
            throttlers.volume = _.throttle(this.actions.setVolume, 100);
        throttlers.volume(t);
    }

    setVolume(t) {

        if (t > 200) // don't allow volume higher than 200%
            t = 200;

        if (t < 0)
            t = 0;

        var wcjs = this.alt.stores.playerStore.state.wcjs,
            obj = {};

        if (this.alt.stores.ControlStore.muted) {
            if (wcjs)
                wcjs.mute = false;
            obj.muted = false;
        }

        obj.volume = t;

        this.actions.settingChange(obj);

        if (wcjs)
            wcjs.volume = t;
    }

    handleMute(event) {
        var controlState = this.alt.stores.ControlStore.state;
        this.actions.mute(!controlState.mute);
    }

    mute(mute) {
        var wcjs = PlayerStore.getState().wcjs;

        if (wcjs)
            wcjs.mute = mute;

        this.actions.settingChange({
            muted: mute
        });
    }

    volumeIndexEffect(f, b, i) {
        if (i) {
            var controlState = this.alt.stores.ControlStore.state;
            if (!controlState.volumeDragging) {
                var volumeIndex = controlState.volumeSlider.refs['track'].lastChild;
                var volumeClass = volumeIndex.className.replace(' volume-hover', '');
                if (i.type == 'react-mouseenter')
                    volumeIndex.className = volumeClass;
                else if (i.type == 'react-mouseleave')
                    volumeIndex.className = volumeClass + ' volume-hover';

            } else if (i.type) {
                this.actions.settingChange({
                    volumePendingEffects: i.type
                })
            }
        }
    }

    volumeRippleEffect(c, i, a) {
        if (a) {
            var controlState = this.alt.stores.ControlStore.state;
            if (!controlState.volumeDragging) {
                var volumeRipple = controlState.volumeSlider.refs['track'].lastChild.firstChild;
                var volumeClass = volumeRipple.className.replace(' volume-ripple-hover', '');
                if (a.type == 'react-mouseenter')
                    volumeRipple.className = volumeClass;
                else if (a.type == 'react-mouseleave')
                    volumeRipple.className = volumeClass + ' volume-ripple-hover';

            } else if (a.type) {
                this.actions.settingChange({
                    volumePendingRipples: a.type
                });
            }
        }
    }

    volumeDragStart() {
        this.actions.settingChange({
            volumeDragging: true
        });
    }

    volumeDragStop() {
        var obj = {
            volumeDragging: false
        };
        var controlState = this.alt.stores.ControlStore.state;
        if (controlState.volumePendingEffects) {
            this.actions.volumeIndexEffect(null, null, {
                type: controlState.volumePendingEffects
            });
            obj.volumePendingEffects = '';
        }
        if (controlState.volumePendingRipples) {
            this.actions.volumeRippleEffect(null, null, {
                type: controlState.volumePendingRipples
            });
            obj.volumePendingRipples = '';
        }
        this.actions.settingChange(obj);
        ls('volume', controlState.volume);

    }

}


export
default alt.createActions(ControlActions);
