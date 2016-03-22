import alt from '../../../../../../alt';
import _ from 'lodash';
import ls from 'local-storage';
import player from '../../../../utils/player';

var throttlers = {};

class VolumeActions {

    constructor() {
        this.generateActions(
            'settingChange'
        );
    }
    
    handleVolume() {
        var t = document.querySelector('.vol-slide').immediateValue;
        if (!throttlers.volume)
            throttlers.volume = _.throttle(this.actions.setVolume, 100);
        throttlers.volume(t);
    }

    setVolume(t) {

        if (t > 200) // don't allow volume higher than 200%
            t = 200;

        if (t < 0)
            t = 0;

        var wcjs = player.wcjs,
            obj = {},
            volumeState = this.alt.stores.VolumeStore.state;

        if (volumeState.muted) {
            if (wcjs)
                wcjs.mute = false;
            obj.muted = false;
        }

        obj.volume = t;

        this.actions.settingChange(obj);

        if (wcjs)
            wcjs.volume = t;

        if (!volumeState.volumeDragging)
            ls('volume', t);
    }

    handleMute(event) {
        var volumeState = this.alt.stores.VolumeStore.state;
        this.actions.mute(!volumeState.muted);
    }

    mute(mute) {
        var wcjs = player.wcjs;

        if (wcjs)
            wcjs.mute = mute;

        this.actions.settingChange({
            muted: mute
        });
    }

    volumeIndexEffect(f, b, i) {
        if (i) {
            var volumeState = this.alt.stores.VolumeStore.state;
            if (!volumeState.volumeDragging) {
//                  document.querySelector('.vol-slide .sliderKnob').style.opacity = 0;
//                var volumeIndex = volumeState.volumeSlider.refs['track'].lastChild;
//                var volumeClass = volumeIndex.className.replace(' volume-hover', '');
                var knob = document.querySelector('.vol-slide #sliderKnob');
                if (i.type == 'react-mouseenter')
                    knob.style.transform = 'scale(1.0)';
                else if (i.type == 'react-mouseleave')
                    knob.style.transform = 'scale(0)';

            } else if (i.type) {
                this.actions.settingChange({
                    volumePendingEffects: i.type
                })
            }
        }
    }

    volumeRippleEffect(c, i, a) {
//        if (a) {
//            var volumeState = this.alt.stores.VolumeStore.state;
//            if (!volumeState.volumeDragging) {
//                var volumeRipple = volumeState.volumeSlider.refs['track'].lastChild.firstChild;
//                var volumeClass = volumeRipple.className.replace(' volume-ripple-hover', '');
//                if (a.type == 'react-mouseenter')
//                    volumeRipple.className = volumeClass;
//                else if (a.type == 'react-mouseleave')
//                    volumeRipple.className = volumeClass + ' volume-ripple-hover';
//
//            } else if (a.type) {
//                this.actions.settingChange({
//                    volumePendingRipples: a.type
//                });
//            }
//        }
    }

    volumeDragStart() {
        this.actions.settingChange({
            volumeDragging: true
        });
    }

    volumeDragStop() {
        document.querySelector('.vol-slide').blur();
        var obj = {
            volumeDragging: false
        };
        var volumeState = this.alt.stores.VolumeStore.state;
        if (volumeState.volumePendingEffects) {
            this.actions.volumeIndexEffect(null, null, {
                type: volumeState.volumePendingEffects
            });
            obj.volumePendingEffects = '';
        }
//        if (volumeState.volumePendingRipples) {
//            this.actions.volumeRippleEffect(null, null, {
//                type: volumeState.volumePendingRipples
//            });
//            obj.volumePendingRipples = '';
//        }
        this.actions.settingChange(obj);
        ls('volume', volumeState.volume);

    }

}


export
default alt.createActions(VolumeActions);
