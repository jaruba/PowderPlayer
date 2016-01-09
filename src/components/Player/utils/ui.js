import PlayerActions from '../actions';
import PlayerStore from '../store';
import SubtitleActions from '../components/SubtitleText/actions';
import _ from 'lodash';

module.exports = {
    
    toggleMenu: (arg) => {
        PlayerActions.toggleMenu(arg);
    },
    
    defaultSettings: () => {
        _.defer(() => {
            SubtitleActions.setSubDelay(0);
            PlayerActions.setAudioDelay(0);
            PlayerActions.setRate(1);
        });
        
        var playerState = PlayerStore.getState();
        if (playerState.speedField.refs['input']) {
            playerState.speedField.refs['input'].defaultValue = '1.00x';
            playerState.subDelayField.refs['input'].defaultValue = '0 ms';
            playerState.audioDelayField.refs['input'].defaultValue = '0 ms';
            playerState.audioChannelField.refs['input'].defaultValue = 'Stereo';
            playerState.aspectField.refs['input'].defaultValue = 'Default';
            playerState.cropField.refs['input'].defaultValue = 'Default';
            playerState.zoomField.refs['input'].defaultValue = 'Default';
        }
    }
}