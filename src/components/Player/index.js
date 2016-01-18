import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import PlayerHeader from './components/Header.react';
import PlayerControls from './components/Controls';
import PlayerRender from './components/Renderer.react';
import Playlist from './components/Playlist.react';
import Settings from './components/MenuHolders/Settings';
import SubtitleList from './components/Subtitles.react';
import SubtitleText from './components/SubtitleText';
import Announcement from './components/Announcement.react';

import webFrame from 'web-frame';
import remote from 'remote';
import ls from 'local-storage';
import player from './utils/player';

import PlayerStore from './store';
import PlayerActions from './actions';
import SubtitleStore from './components/SubtitleText/store';
import SubtitleActions from './components/SubtitleText/actions';

import ControlStore from './components/Controls/store';
import ControlActions from './components/Controls/actions';

import VisibilityStore from './components/Visibility/store';
import VisibilityActions from './components/Visibility/actions';

import ReactNotify from 'react-notify';

import {mouseTrap} from 'react-mousetrap';

const Player = React.createClass({
    mixins: [PureRenderMixin],

    getInitialState() {
        var visibilityState = VisibilityStore.getState();
        return {
            uiShown: visibilityState.uiShown
        }
    },
    componentWillMount() {
        if (!ls.isSet('customSubSize'))
            ls('customSubSize', 100);
        VisibilityStore.listen(this.update);
        remote.getCurrentWindow().setMinimumSize(392, 228);
        webFrame.setZoomLevel(ls.isSet('zoomLevel') ? ls('zoomLevel') : 0);
        
        this.props.bindShortcut('space', (event) => {
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

        this.props.bindShortcut('ctrl+up', (event) => {
            var volume = Math.round((player.wcjs.volume + 5) / 5) * 5;
            if (volume > 200) volume = 200;
            ControlActions.setVolume(volume);
            PlayerActions.announcement('Volume '+volume+'%');
        });

        this.props.bindShortcut('ctrl+down', (event) => {
            var volume = Math.round((player.wcjs.volume - 5) / 5) * 5;
            if (volume < 0) volume = 0;
            ControlActions.setVolume(volume);
            PlayerActions.announcement('Volume '+volume+'%');
        });

        this.props.bindShortcut('ctrl+right', (event) => {
            var wjsPlayer = PlayerStore.getState();
            if (["ended","stopping","error"].indexOf(player.wcjs.state) == -1) {
                if (player.itemDesc().mrl.startsWith('file:///')) var wjsDelay = 200;
                else var wjsDelay = 700;
                ControlActions.delayTime({
                    jump: 60000,
                    delay: wjsDelay
                });
            }
        });

        this.props.bindShortcut('ctrl+left', (event) => {
            var wjsPlayer = PlayerStore.getState();
            if (["ended","stopping","error"].indexOf(player.wcjs.state) == -1) {
                if (player.itemDesc().mrl.startsWith('file:///')) var wjsDelay = 200;
                else var wjsDelay = 700;
                ControlActions.delayTime({
                    jump: -60000,
                    delay: wjsDelay
                });
            }
        });

        this.props.bindShortcut('alt+right', (event) => {
            var wjsPlayer = PlayerStore.getState();
            if (["ended","stopping","error"].indexOf(player.wcjs.state) == -1) {
                if (player.itemDesc().mrl.startsWith('file:///')) var wjsDelay = 200;
                else var wjsDelay = 700;
                ControlActions.delayTime({
                    jump: 10000,
                    delay: wjsDelay
                });
            }
        });

        this.props.bindShortcut('alt+left', (event) => {
            var wjsPlayer = PlayerStore.getState();
            if (["ended","stopping","error"].indexOf(player.wcjs.state) == -1) {
                if (player.itemDesc().mrl.startsWith('file:///')) var wjsDelay = 200;
                else var wjsDelay = 700;
                ControlActions.delayTime({
                    jump: -10000,
                    delay: wjsDelay
                });
            }
        });
        
        this.props.bindShortcut('shift+right', (event) => {
            var wjsPlayer = PlayerStore.getState();
            if (["ended","stopping","error"].indexOf(player.wcjs.state) == -1) {
                if (player.itemDesc().mrl.startsWith('file:///')) var wjsDelay = 200;
                else var wjsDelay = 700;
                ControlActions.delayTime({
                    jump: 3000,
                    delay: wjsDelay
                });
            }
        });

        this.props.bindShortcut('shift+left', (event) => {
            var wjsPlayer = PlayerStore.getState();
            if (["ended","stopping","error"].indexOf(player.wcjs.state) == -1) {
                if (player.itemDesc().mrl.startsWith('file:///')) var wjsDelay = 200;
                else var wjsDelay = 700;
                ControlActions.delayTime({
                    jump: -3000,
                    delay: wjsDelay
                });
            }
        });
        
        this.props.bindShortcut('right', (event) => {
            var wjsPlayer = PlayerStore.getState();
            if (["ended","stopping","error"].indexOf(player.wcjs.state) == -1) {
                if (player.itemDesc().mrl.startsWith('file:///')) var wjsDelay = 200;
                else var wjsDelay = 700;
                ControlActions.delayTime({
                    jump: (ControlStore.getState().length / 60),
                    delay: wjsDelay
                });
            }
        });

        this.props.bindShortcut('left', (event) => {
            var wjsPlayer = PlayerStore.getState();
            if (["ended","stopping","error"].indexOf(player.wcjs.state) == -1) {
                if (player.itemDesc().mrl.startsWith('file:///')) var wjsDelay = 200;
                else var wjsDelay = 700;
                ControlActions.delayTime({
                    jump: (-1) * (ControlStore.getState().length / 60),
                    delay: wjsDelay
                });
            }
        });

        this.props.bindShortcut('e', (event) => {
            var wjsPlayer = PlayerStore.getState();
            if (["ended","stopping","error"].indexOf(player.wcjs.state) == -1) {
                if (player.wcjs.playing)
                    player.wcjs.togglePause();
                ControlActions.delayTime({
                    jump: 500,
                    delay: 0
                });
                SubtitleActions.settingChange({
                    text: ''
                });
                PlayerActions.announcement('Next Frame');
            }
        });

        this.props.bindShortcut('g', (event) => {
            var subDelayField = player.fields.subDelay;
            var newValue = parseInt(subDelayField.getValue()) - 50;
            player.wcjs.subtitles.delay = newValue;
            player.set({
                subDelay: newValue
            });
            subDelayField.refs['input'].value = newValue + ' ms';
            PlayerActions.announcement('Subtitle Delay: ' + newValue + ' ms');
        });
    
        this.props.bindShortcut('h', (event) => {
            var subDelayField = player.fields.subDelay;
            var newValue = parseInt(subDelayField.getValue()) + 50;
            player.wcjs.subtitles.delay = newValue;
            player.set({
                subDelay: newValue
            });
            subDelayField.refs['input'].value = newValue + ' ms';
            PlayerActions.announcement('Subtitle Delay: ' + newValue + ' ms');
        });

        this.props.bindShortcut('j', (event) => {
            var audioDelayField = player.fields.audioDelay;
            var newValue = parseInt(audioDelayField.getValue()) - 50;
            player.wcjs.audio.delay = newValue;
            player.set({
                audioDelay: newValue
            });
            audioDelayField.refs['input'].value = newValue + ' ms';
            PlayerActions.announcement('Audio Delay: ' + newValue + ' ms');
        });
    
        this.props.bindShortcut('k', (event) => {
            var audioDelayField = player.fields.audioDelay;
            var newValue = parseInt(audioDelayField.getValue()) + 50;
            audioDelayField.refs['input'].value = newValue + ' ms';
            player.wcjs.audio.delay = newValue;
            player.set({
                audioDelay: newValue
            });
            PlayerActions.announcement('Audio Delay: ' + newValue + ' ms');
        });

        this.props.bindShortcut('alt+up', (event) => {
            var newValue = Math.round((ls('customSubSize') + 5) / 5) * 5;
            if (newValue > 500) newValue = 500;
            ls('customSubSize', newValue);
            PlayerActions.announcement('Subtitle Size ' + newValue + '%');
            player.fields.subSize.refs['input'].value = newValue + '%';
            player.events.emit('subtitleUpdate');
        });

        this.props.bindShortcut('alt+down', (event) => {
            var newValue = Math.round((ls('customSubSize') - 5) / 5) * 5;
            if (newValue < 5) newValue = 5;
            ls('customSubSize', newValue);
            PlayerActions.announcement('Subtitle Size ' + newValue + '%');
            player.fields.subSize.refs['input'].value = newValue + '%';
            player.events.emit('subtitleUpdate');
        });

        this.props.bindShortcut('shift+up', (event) => {
            var subState = SubtitleStore.getState();
            var newValue = parseInt(subState.marginBottom) + 5;
            PlayerActions.announcement('Moved Subtitles Up');
            SubtitleActions.settingChange({
                marginBottom: newValue + 'px'
            });
        });

        this.props.bindShortcut('shift+down', (event) => {
            var subState = SubtitleStore.getState();
            var newValue = parseInt(subState.marginBottom) - 5;
            if (newValue < 0) newValue = 0;
            PlayerActions.announcement('Moved Subtitles Down');
            SubtitleActions.settingChange({
                marginBottom: newValue + 'px'
            });
        });

        this.props.bindShortcut('[', (event) => {
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
                player.fields.speed.refs['input'].value = newValue + 'x';
                PlayerActions.announcement('Speed: ' + newValue + 'x');
            }
        });

        this.props.bindShortcut(']', (event) => {
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
                player.fields.speed.refs['input'].value = newValue + 'x';
                PlayerActions.announcement('Speed: ' + newValue + 'x');
            }
        });

        this.props.bindShortcut('=', (event) => {
            var newRate = 0;
            player.wcjs.input.rate = 1.0;
            var newValue = parseFloat(Math.round(player.wcjs.input.rate * 100) / 100).toFixed(2);
            player.fields.speed.refs['input'].value = newValue + 'x';
            PlayerActions.announcement('Speed: ' + newValue + 'x');
        });

        this.props.bindShortcut('t', (event) => {
            var controlState = ControlStore.getState();
            PlayerActions.announcement(controlState.currentTime + ' / ' + controlState.totalTime);
        });

        this.props.bindShortcut('f', (event) => {
            ControlActions.toggleFullscreen();
        });

        this.props.bindShortcut('f11', (event) => {
            ControlActions.toggleFullscreen();
        });

        this.props.bindShortcut('m', (event) => {
            var controlState = ControlStore.getState();
            var muted = !controlState.muted;
            ControlActions.mute(muted);
            if (muted)
                PlayerActions.announcement('Muted');
            else
                PlayerActions.announcement('Volume ' + player.wcjs.volume + '%');
        });

        this.props.bindShortcut('ctrl+l', (event) => {
            VisibilityActions.toggleMenu('playlist');
        });

        this.props.bindShortcut('n', (event) => {
            player.next();
        });

        this.props.bindShortcut('ctrl+h', (event) => {
            var visibilityState = VisibilityStore.getState();
            if (visibilityState.uiHidden)
                PlayerActions.announcement('UI Visible');
            else
                PlayerActions.announcement('UI Hidden');
            VisibilityActions.settingChange({
                uiHidden: !visibilityState.uiHidden
            });
        });

        this.props.bindShortcut('esc', (event) => {
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

        this.props.bindShortcut('p', (event) => {
            player.wcjs.time = 0;
            SubtitleActions.settingChange({
                text: ''
            });
        });
        
        var aspectRatios = ['Default','1:1','4:3','16:9','16:10','2.21:1','2.35:1','2.39:1','5:4'];
        
        this.props.bindShortcut('a', (event) => {
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
        
        this.props.bindShortcut('c', (event) => {
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
        
        this.props.bindShortcut('z', (event) => {
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

    },
    componentWillUnmount() {
        this.props.unbindShortcut('space');
        this.props.unbindShortcut('ctrl+up');
        this.props.unbindShortcut('ctrl+down');
        this.props.unbindShortcut('ctrl+left');
        this.props.unbindShortcut('ctrl+right');
        this.props.unbindShortcut('alt+left');
        this.props.unbindShortcut('alt+right');
        this.props.unbindShortcut('shift+left');
        this.props.unbindShortcut('shift+right');
        this.props.unbindShortcut('left');
        this.props.unbindShortcut('right');
        this.props.unbindShortcut('alt+up');
        this.props.unbindShortcut('alt+down');
        this.props.unbindShortcut('shift+up');
        this.props.unbindShortcut('shift+down');
        this.props.unbindShortcut('t');
        this.props.unbindShortcut('f');
        this.props.unbindShortcut('f11');
        this.props.unbindShortcut('m');
        this.props.unbindShortcut('ctrl+l');
        this.props.unbindShortcut('n');
        this.props.unbindShortcut('esc');
        this.props.unbindShortcut('e');
        this.props.unbindShortcut('g');
        this.props.unbindShortcut('h');
        this.props.unbindShortcut('j');
        this.props.unbindShortcut('k');
        this.props.unbindShortcut(']');
        this.props.unbindShortcut('[');
        this.props.unbindShortcut('=');
        this.props.unbindShortcut('ctrl+h');
        this.props.unbindShortcut('a');
        this.props.unbindShortcut('c');
        this.props.unbindShortcut('z');
        PlayerStore.unlisten(this.update);
        VisibilityStore.unlisten(this.update);
    },
    componentDidMount() {
        var announcer = document.getElementsByClassName('wcjs-announce')[0];
//        if (['', '0'].indexOf(announcer.style.opacity) > -1) {
//            events.buffering(0);
//        }
        player.set({
            notifier: this.refs.notificator
        });
    },
    update() {
        console.log('player update');
        if (this.isMounted()) {
            var visibilityState = VisibilityStore.getState();
            this.setState({
                uiShown: visibilityState.uiShown
            });
        }
    },
    hideUI() {
        if (!ControlStore.getState().scrobbling) {
            VisibilityActions.uiShown(false);
        } else {
            player.hoverTimeout = setTimeout(this.hideUI, 3000);
        }
    },
    hover(event) {
        player.hoverTimeout && clearTimeout(player.hoverTimeout);
        this.state.uiShown || VisibilityActions.uiShown(true);
        player.hoverTimeout = setTimeout(this.hideUI, 3000);
    },
    render() {
        var cursorStyle = {
            cursor: this.state.uiShown ? 'pointer' : 'none'
        };
        return (
            <div onMouseMove={this.hover} className="wcjs-player" style={cursorStyle}>
                <PlayerHeader />
                <PlayerRender />
                <Announcement />
                <SubtitleText />
                <PlayerControls />
                <Playlist />
                <Settings />
                <SubtitleList />
                <ReactNotify ref='notificator'/>
            </div>
        );
    }
});

export
default mouseTrap(Player)
