import player from './player';
import ls from 'local-storage';

import PlayerStore from '../store';
import PlayerActions from '../actions';
import SubtitleStore from '../components/SubtitleText/store';
import SubtitleActions from '../components/SubtitleText/actions';
import ControlStore from '../components/Controls/store';
import ControlActions from '../components/Controls/actions';
import TimeStore from '../components/Controls/components/HumanTime/store';
import VolumeStore from '../components/Controls/components/Volume/store';
import VolumeActions from '../components/Controls/components/Volume/actions';
import ProgressStore from '../components/Controls/components/ProgressBar/store';
import ProgressActions from '../components/Controls/components/ProgressBar/actions';
import VisibilityStore from '../components/Visibility/store';
import VisibilityActions from '../components/Visibility/actions';

var hotkeys = {};

hotkeys.attach = (props) => {
    props.bindShortcut('space', (event) => {
        event.preventDefault();
        if (player.wcjs.playing) {
            PlayerActions.announcement({
                text: 'Paused',
                delay: 500
            });
        } else {
            PlayerActions.announcement({
                text: 'Playing', 
                delay: 500
            });
        }
        player.wcjs.togglePause();
    });

    props.bindShortcut('ctrl+up', (event) => {
        var volume = Math.round((player.wcjs.volume + 5) / 5) * 5;
        if (volume > 200) volume = 200;
        VolumeActions.setVolume(volume);
        PlayerActions.announcement('Volume '+volume+'%');
    });

    props.bindShortcut('ctrl+down', (event) => {
        var volume = Math.round((player.wcjs.volume - 5) / 5) * 5;
        if (volume < 0) volume = 0;
        VolumeActions.setVolume(volume);
        PlayerActions.announcement('Volume '+volume+'%');
    });

    props.bindShortcut('ctrl+right', (event) => {
        if (["ended","stopping","error"].indexOf(player.wcjs.state) == -1) {
            if (player.itemDesc().mrl.startsWith('file:///')) var wjsDelay = 200;
            else var wjsDelay = 700;
            ProgressActions.delayTime({
                jump: 60000,
                delay: wjsDelay
            });
        }
    });

    props.bindShortcut('ctrl+left', (event) => {
        if (["ended","stopping","error"].indexOf(player.wcjs.state) == -1) {
            if (player.itemDesc().mrl.startsWith('file:///')) var wjsDelay = 200;
            else var wjsDelay = 700;
            ProgressActions.delayTime({
                jump: -60000,
                delay: wjsDelay
            });
        }
    });

    props.bindShortcut('alt+right', (event) => {
        if (["ended","stopping","error"].indexOf(player.wcjs.state) == -1) {
            if (player.itemDesc().mrl.startsWith('file:///')) var wjsDelay = 200;
            else var wjsDelay = 700;
            ProgressActions.delayTime({
                jump: 10000,
                delay: wjsDelay
            });
        }
    });

    props.bindShortcut('alt+left', (event) => {
        if (["ended","stopping","error"].indexOf(player.wcjs.state) == -1) {
            if (player.itemDesc().mrl.startsWith('file:///')) var wjsDelay = 200;
            else var wjsDelay = 700;
            ProgressActions.delayTime({
                jump: -10000,
                delay: wjsDelay
            });
        }
    });
    
    props.bindShortcut('shift+right', (event) => {
        if (["ended","stopping","error"].indexOf(player.wcjs.state) == -1) {
            if (player.itemDesc().mrl.startsWith('file:///')) var wjsDelay = 200;
            else var wjsDelay = 700;
            ProgressActions.delayTime({
                jump: 3000,
                delay: wjsDelay
            });
        }
    });

    props.bindShortcut('shift+left', (event) => {
        if (["ended","stopping","error"].indexOf(player.wcjs.state) == -1) {
            if (player.itemDesc().mrl.startsWith('file:///')) var wjsDelay = 200;
            else var wjsDelay = 700;
            ProgressActions.delayTime({
                jump: -3000,
                delay: wjsDelay
            });
        }
    });
    
    props.bindShortcut('right', (event) => {
        if (["ended","stopping","error"].indexOf(player.wcjs.state) == -1) {
            if (player.itemDesc().mrl.startsWith('file:///')) var wjsDelay = 200;
            else var wjsDelay = 700;
            ProgressActions.delayTime({
                jump: (player.wcjs.length / 60),
                delay: wjsDelay
            });
        }
    });

    props.bindShortcut('left', (event) => {
        if (["ended","stopping","error"].indexOf(player.wcjs.state) == -1) {
            if (player.itemDesc().mrl.startsWith('file:///')) var wjsDelay = 200;
            else var wjsDelay = 700;
            ProgressActions.delayTime({
                jump: (-1) * (player.wcjs.length / 60),
                delay: wjsDelay
            });
        }
    });

    props.bindShortcut('e', (event) => {
        var wjsPlayer = PlayerStore.getState();
        if (["ended","stopping","error"].indexOf(player.wcjs.state) == -1) {
            if (player.wcjs.playing)
                player.wcjs.togglePause();
            ProgressActions.delayTime({
                jump: 500,
                delay: 0
            });
            SubtitleActions.settingChange({
                text: ''
            });
            PlayerActions.announcement('Next Frame');
        }
    });

    props.bindShortcut('g', (event) => {
        var subDelayField = player.fields.subDelay;
        var newValue = parseInt(subDelayField.value) - 50;
        player.wcjs.subtitles.delay = newValue;
        player.set({
            subDelay: newValue
        });
        subDelayField.value = newValue + ' ms';
        PlayerActions.announcement('Subtitle Delay: ' + newValue + ' ms');
    });

    props.bindShortcut('h', (event) => {
        var subDelayField = player.fields.subDelay;
        var newValue = parseInt(subDelayField.value) + 50;
        player.wcjs.subtitles.delay = newValue;
        player.set({
            subDelay: newValue
        });
        subDelayField.value = newValue + ' ms';
        PlayerActions.announcement('Subtitle Delay: ' + newValue + ' ms');
    });

    props.bindShortcut('j', (event) => {
        var audioDelayField = player.fields.audioDelay;
        var newValue = parseInt(audioDelayField.value) - 50;
        player.wcjs.audio.delay = newValue;
        player.set({
            audioDelay: newValue
        });
        audioDelayField.value = newValue + ' ms';
        PlayerActions.announcement('Audio Delay: ' + newValue + ' ms');
    });

    props.bindShortcut('k', (event) => {
        var audioDelayField = player.fields.audioDelay;
        var newValue = parseInt(audioDelayField.value) + 50;
        audioDelayField.value = newValue + ' ms';
        player.wcjs.audio.delay = newValue;
        player.set({
            audioDelay: newValue
        });
        PlayerActions.announcement('Audio Delay: ' + newValue + ' ms');
    });

    props.bindShortcut('alt+up', (event) => {
        var newValue = Math.round((ls('customSubSize') + 5) / 5) * 5;
        if (newValue > 500) newValue = 500;
        ls('customSubSize', newValue);
        PlayerActions.announcement('Subtitle Size ' + newValue + '%');
        player.fields.subSize.value = newValue + '%';
        player.events.emit('subtitleUpdate');
    });

    props.bindShortcut('alt+down', (event) => {
        var newValue = Math.round((ls('customSubSize') - 5) / 5) * 5;
        if (newValue < 5) newValue = 5;
        ls('customSubSize', newValue);
        PlayerActions.announcement('Subtitle Size ' + newValue + '%');
        player.fields.subSize.value = newValue + '%';
        player.events.emit('subtitleUpdate');
    });

    props.bindShortcut('shift+up', (event) => {
        var subState = SubtitleStore.getState();
        var newValue = parseInt(subState.marginBottom) + 5;
        PlayerActions.announcement('Moved Subtitles Up');
        SubtitleActions.settingChange({
            marginBottom: newValue + 'px'
        });
    });

    props.bindShortcut('shift+down', (event) => {
        var subState = SubtitleStore.getState();
        var newValue = parseInt(subState.marginBottom) - 5;
        if (newValue < 0) newValue = 0;
        PlayerActions.announcement('Moved Subtitles Down');
        SubtitleActions.settingChange({
            marginBottom: newValue + 'px'
        });
    });

    props.bindShortcut('[', (event) => {
        var newRate = 0;
        var curRate = parseFloat(player.wcjs.input.rate);
        
        if (curRate >= 0.25 && curRate <= 0.5) newRate = 0.125;
        else if (curRate > 0.5 && curRate <= 1) newRate = 0.25;
        else if (curRate > 1 && curRate <= 2) newRate = 0.5;
        else if (curRate > 2 && curRate <= 4) newRate = 1;
        else if (curRate > 4) newRate = curRate /2;

        if ((curRate + newRate) >= 0.125) {
            player.wcjs.input.rate = curRate - newRate;
            var newValue = parseFloat(Math.round(player.wcjs.input.rate * 100) / 100).toFixed(2);
            player.fields.speed.value = newValue + 'x';
            PlayerActions.announcement('Speed: ' + newValue + 'x');
        }
    });

    props.bindShortcut(']', (event) => {
        var newRate = 0;
        var curRate = parseFloat(player.wcjs.input.rate);
        
        if (curRate < 0.25) newRate = 0.125;
        else if (curRate >= 0.25 && curRate < 0.5) newRate = 0.125;
        else if (curRate >= 0.5 && curRate < 1) newRate = 0.25;
        else if (curRate >= 1 && curRate < 2) newRate = 0.5;
        else if (curRate >= 2 && curRate < 4) newRate = 1;
        else if (curRate >= 4) newRate = curRate;

        if ((curRate + newRate) < 100) {
            player.wcjs.input.rate = curRate + newRate;
            var newValue = parseFloat(Math.round(player.wcjs.input.rate * 100) / 100).toFixed(2);
            player.fields.speed.value = newValue + 'x';
            PlayerActions.announcement('Speed: ' + newValue + 'x');
        }
    });

    props.bindShortcut('=', (event) => {
        var newRate = 0;
        player.wcjs.input.rate = 1.0;
        var newValue = parseFloat(Math.round(player.wcjs.input.rate * 100) / 100).toFixed(2);
        player.fields.speed.value = newValue + 'x';
        PlayerActions.announcement('Speed: ' + newValue + 'x');
    });

    props.bindShortcut('t', (event) => {
        var timeState = TimeStore.getState();
        PlayerActions.announcement(timeState.currentTime + ' / ' + timeState.totalTime);
    });

    props.bindShortcut('f', (event) => {
        ControlActions.toggleFullscreen();
    });

    props.bindShortcut('f11', (event) => {
        ControlActions.toggleFullscreen();
    });

    props.bindShortcut('m', (event) => {
        var volumeState = VolumeStore.getState();
        var muted = !volumeState.muted;
        VolumeActions.mute(muted);
        if (muted)
            PlayerActions.announcement('Muted');
        else
            PlayerActions.announcement('Volume ' + player.wcjs.volume + '%');
    });

    props.bindShortcut('ctrl+l', (event) => {
        VisibilityActions.toggleMenu('playlist');
    });

    props.bindShortcut('n', (event) => {
        player.next();
    });

    props.bindShortcut('ctrl+h', (event) => {
        var visibilityState = VisibilityStore.getState();
        if (visibilityState.uiHidden)
            PlayerActions.announcement('UI Visible');
        else
            PlayerActions.announcement('UI Hidden');
        VisibilityActions.settingChange({
            uiHidden: !visibilityState.uiHidden
        });
    });

    props.bindShortcut('esc', (event) => {
        var controlState = ControlStore.getState();
        var visibilityState = VisibilityStore.getState();
        if (visibilityState.playlist) {
            VisibilityActions.settingChange({
                playlist: false
            });
        } else if (visibilityState.settings) {
            VisibilityActions.settingChange({
                settings: false
            });
        } else if (visibilityState.subtitles) {
            VisibilityActions.settingChange({
                subtitles: false
            });
        } else if (controlState.fullscreen) {
            ControlActions.toggleFullscreen(false);
        }
    });

    props.bindShortcut('p', (event) => {
        player.wcjs.time = 0;
        SubtitleActions.settingChange({
            text: ''
        });
    });
    
    var aspectRatios = ['Default','1:1','4:3','16:9','16:10','2.21:1','2.35:1','2.39:1','5:4'];
    
    props.bindShortcut('a', (event) => {
        aspectRatios.some((el, ij) => {
            if (el == player.aspect) {
                if (aspectRatios.length == ij + 1)
                    var newValue = 0;
                else
                    var newValue = ij + 1;

                player.set({
                    aspect: aspectRatios[newValue],
                    crop: 'Default',
                    zoom: 1
                });
                PlayerActions.announcement('Aspect Ratio: ' + aspectRatios[newValue]);
                player.events.emit('resizeNow');
                return true;
            } else return false;
        });
    });
    
    var crops = ['Default','16:10','16:9','1.85:1','2.21:1','2.35:1','2.39:1','5:3','4:3','5:4','1:1'];
    
    props.bindShortcut('c', (event) => {
        crops.some((el, ij) => {
            if (el == player.crop) {
                if (crops.length == ij + 1)
                    var newValue = 0;
                else
                    var newValue = ij + 1;

                player.set({
                    crop: crops[newValue],
                    aspect: 'Default',
                    zoom: 1
                });
                PlayerActions.announcement('Crop: ' + crops[newValue]);
                player.events.emit('resizeNow');
                return true;
            } else return false;
        });
    });

    var zooms = [['Default',1],['2x Double',2],['0.25x Quarter',0.25],['0.5x Half',0.5]];
    
    props.bindShortcut('z', (event) => {
        zooms.some((el, ij) => {
            if (el[1] == player.zoom) {
                if (zooms.length == ij+1)
                    var newValue = 0;
                else
                    var newValue = ij + 1;

                player.set({
                    zoom: zooms[newValue][1],
                    crop: 'Default',
                    aspect: 'Default'
                });
                PlayerActions.announcement('Zoom: ' + zooms[newValue][0]);
                player.events.emit('resizeNow');
                return true;
            } else return false;
        });
    });

}

hotkeys.detach = (props) => {
    props.unbindShortcut('space');
    props.unbindShortcut('ctrl+up');
    props.unbindShortcut('ctrl+down');
    props.unbindShortcut('ctrl+left');
    props.unbindShortcut('ctrl+right');
    props.unbindShortcut('alt+left');
    props.unbindShortcut('alt+right');
    props.unbindShortcut('shift+left');
    props.unbindShortcut('shift+right');
    props.unbindShortcut('left');
    props.unbindShortcut('right');
    props.unbindShortcut('alt+up');
    props.unbindShortcut('alt+down');
    props.unbindShortcut('shift+up');
    props.unbindShortcut('shift+down');
    props.unbindShortcut('t');
    props.unbindShortcut('f');
    props.unbindShortcut('f11');
    props.unbindShortcut('m');
    props.unbindShortcut('ctrl+l');
    props.unbindShortcut('n');
    props.unbindShortcut('esc');
    props.unbindShortcut('e');
    props.unbindShortcut('g');
    props.unbindShortcut('h');
    props.unbindShortcut('j');
    props.unbindShortcut('k');
    props.unbindShortcut(']');
    props.unbindShortcut('[');
    props.unbindShortcut('=');
    props.unbindShortcut('ctrl+h');
    props.unbindShortcut('a');
    props.unbindShortcut('c');
    props.unbindShortcut('z');
}

module.exports = hotkeys;
