import VisibilityActions from '../components/Visibility/actions';
import PlayerStore from '../store';
import SubtitleActions from '../components/SubtitleText/actions';
import _ from 'lodash';
import config from './config';

module.exports = {
    
    toggleMenu: (arg) => {
        VisibilityActions.toggleMenu(arg);
    },
    
    defaultSettings: () => {

        var playerState = PlayerStore.getState();
        var wcjs = playerState.wcjs;

        wcjs.audio.delay = 0;
        wcjs.subtitles.delay = 0;

        config.set({
            audioDelay: 0,
            subDelay: 0
        });

        playerState.events.emit('subtitleUpdate');

        var configState = config.fields;
        if (configState.speed.refs['input']) {
            configState.subDelay.refs['input'].value = '0 ms';
            configState.audioDelay.refs['input'].value = '0 ms';
            configState.audioChannel.refs['input'].value = 'Stereo';
            configState.aspect.refs['input'].value = 'Default';
            configState.crop.refs['input'].value = 'Default';
            configState.zoom.refs['input'].value = 'Default';
        }
        config.set({
            aspect: 'Default',
            crop: 'Default',
            zoom: 1
        });
    }
}
