import VisibilityActions from '../components/Visibility/actions';
import PlayerStore from '../store';
import SubtitleActions from '../components/SubtitleText/actions';
import _ from 'lodash';
import player from './player';

module.exports = {
    
    toggleMenu: (arg) => {
        VisibilityActions.toggleMenu(arg);
    },
    
    defaultSettings: () => {

        var wcjs = player.wcjs;

        wcjs.audio.delay = 0;
        wcjs.subtitles.delay = 0;

        player.events.emit('subtitleUpdate');

        var playerState = player.fields;
        if (playerState.speed.refs['input']) {
            playerState.subDelay.refs['input'].value = '0 ms';
            playerState.audioDelay.refs['input'].value = '0 ms';
            playerState.audioChannel.refs['input'].value = 'Stereo';
            playerState.aspect.refs['input'].value = 'Default';
            playerState.crop.refs['input'].value = 'Default';
            playerState.zoom.refs['input'].value = 'Default';
        }
        player.set({
            aspect: 'Default',
            crop: 'Default',
            zoom: 1,
            audioDelay: 0,
            subDelay: 0
        });
    }
}
