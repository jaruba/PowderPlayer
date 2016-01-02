import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import PlayerHeader from './components/Header.react';
import PlayerControls from './components/Controls.react';
import PlayerRender from './components/Renderer.react';
import Playlist from './components/Playlist.react';
import Settings from './components/Settings.react';
import SubtitleList from './components/Subtitles.react';
import SubtitleText from './components/SubtitleText.react';
import Announcement from './components/Announcement.react';

import webFrame from 'web-frame';
import remote from 'remote';
import ls from 'local-storage';

import PlayerStore from './store';
import PlayerActions from './actions';

import ReactNotify from 'react-notify';

import {mouseTrap} from 'react-mousetrap';

const Player = React.createClass({
    mixins: [PureRenderMixin],

    getInitialState() {
        var playerState = PlayerStore.getState();
        return {
            uri: playerState.uri,

            volume: playerState.volume,
            position: playerState.position,
            buffering: playerState.buffering,
            uiShown: playerState.uiShown,
            
            rippleEffects: playerState.rippleEffects
        }
    },
    componentWillMount() {
        if (!ls.isSet('customSubSize'))
            ls('customSubSize', 100);
        PlayerStore.listen(this.update);
        remote.getCurrentWindow().setMinimumSize(392, 228);
        webFrame.setZoomLevel(ls.isSet('zoomLevel') ? ls('zoomLevel') : 0);
        
        this.props.bindShortcut('space', (event) => {
            event.preventDefault();
            if (PlayerStore.getState().playing) {
                PlayerActions.announcement({
                    text: 'Paused',
                    delay: 500
                });
                PlayerActions.pause()
            } else {
                PlayerActions.announcement({
                    text: 'Playing', 
                    delay: 500
                });
                PlayerActions.play();
            }
        });

        this.props.bindShortcut('ctrl+up', (event) => {
            var volume = Math.round((this.state.volume + 5) / 5) * 5;
            if (volume > 200) volume = 200;
            PlayerActions.volume(volume);
            PlayerActions.announcement('Volume '+volume+'%');
        });

        this.props.bindShortcut('ctrl+down', (event) => {
            var volume = Math.round((this.state.volume - 5) / 5) * 5;
            if (volume < 0) volume = 0;
            PlayerActions.volume(volume);
            PlayerActions.announcement('Volume '+volume+'%');
        });

        this.props.bindShortcut('ctrl+right', (event) => {
            var wjsPlayer = PlayerStore.getState();
            if (["ended","stopping","error"].indexOf(wjsPlayer.wcjs.state) == -1) {
                if (wjsPlayer.itemDesc().mrl.startsWith('file:///')) var wjsDelay = 200;
                else var wjsDelay = 700;
                PlayerActions.delayTime({
                    jump: 60000,
                    delay: wjsDelay
                });
            }
        });

        this.props.bindShortcut('ctrl+left', (event) => {
            var wjsPlayer = PlayerStore.getState();
            if (["ended","stopping","error"].indexOf(wjsPlayer.wcjs.state) == -1) {
                if (wjsPlayer.itemDesc().mrl.startsWith('file:///')) var wjsDelay = 200;
                else var wjsDelay = 700;
                PlayerActions.delayTime({
                    jump: -60000,
                    delay: wjsDelay
                });
            }
        });

        this.props.bindShortcut('alt+right', (event) => {
            var wjsPlayer = PlayerStore.getState();
            if (["ended","stopping","error"].indexOf(wjsPlayer.wcjs.state) == -1) {
                if (wjsPlayer.itemDesc().mrl.startsWith('file:///')) var wjsDelay = 200;
                else var wjsDelay = 700;
                PlayerActions.delayTime({
                    jump: 10000,
                    delay: wjsDelay
                });
            }
        });

        this.props.bindShortcut('alt+left', (event) => {
            var wjsPlayer = PlayerStore.getState();
            if (["ended","stopping","error"].indexOf(wjsPlayer.wcjs.state) == -1) {
                if (wjsPlayer.itemDesc().mrl.startsWith('file:///')) var wjsDelay = 200;
                else var wjsDelay = 700;
                PlayerActions.delayTime({
                    jump: -10000,
                    delay: wjsDelay
                });
            }
        });
        
        this.props.bindShortcut('shift+right', (event) => {
            var wjsPlayer = PlayerStore.getState();
            if (["ended","stopping","error"].indexOf(wjsPlayer.wcjs.state) == -1) {
                if (wjsPlayer.itemDesc().mrl.startsWith('file:///')) var wjsDelay = 200;
                else var wjsDelay = 700;
                PlayerActions.delayTime({
                    jump: 3000,
                    delay: wjsDelay
                });
            }
        });

        this.props.bindShortcut('shift+left', (event) => {
            var wjsPlayer = PlayerStore.getState();
            if (["ended","stopping","error"].indexOf(wjsPlayer.wcjs.state) == -1) {
                if (wjsPlayer.itemDesc().mrl.startsWith('file:///')) var wjsDelay = 200;
                else var wjsDelay = 700;
                PlayerActions.delayTime({
                    jump: -3000,
                    delay: wjsDelay
                });
            }
        });
        
        this.props.bindShortcut('right', (event) => {
            var wjsPlayer = PlayerStore.getState();
            if (["ended","stopping","error"].indexOf(wjsPlayer.wcjs.state) == -1) {
                if (wjsPlayer.itemDesc().mrl.startsWith('file:///')) var wjsDelay = 200;
                else var wjsDelay = 700;
                PlayerActions.delayTime({
                    jump: (PlayerStore.getState().length / 60),
                    delay: wjsDelay
                });
            }
        });

        this.props.bindShortcut('left', (event) => {
            var wjsPlayer = PlayerStore.getState();
            if (["ended","stopping","error"].indexOf(wjsPlayer.wcjs.state) == -1) {
                if (wjsPlayer.itemDesc().mrl.startsWith('file:///')) var wjsDelay = 200;
                else var wjsDelay = 700;
                PlayerActions.delayTime({
                    jump: (-1) * (PlayerStore.getState().length / 60),
                    delay: wjsDelay
                });
            }
        });

        this.props.bindShortcut('e', (event) => {
            var wjsPlayer = PlayerStore.getState();
            if (["ended","stopping","error"].indexOf(wjsPlayer.wcjs.state) == -1) {
                PlayerActions.pause();
                PlayerActions.delayTime({
                    jump: 500,
                    delay: 0
                });
                PlayerActions.settingChange({
                    subText: ''
                });
                PlayerActions.announcement('Next Frame');
            }
        });

        this.props.bindShortcut('g', (event) => {
            var subDelayField = PlayerStore.getState().subDelayField;
            var newValue = parseInt(subDelayField.getValue())-50;
            subDelayField.setValue(newValue + ' ms');
            PlayerActions.setSubDelay(newValue);
            PlayerActions.announcement('Subtitle Delay: ' + newValue + ' ms');
        });
    
        this.props.bindShortcut('h', (event) => {
            var subDelayField = PlayerStore.getState().subDelayField;
            var newValue = parseInt(subDelayField.getValue())+50;
            subDelayField.setValue(newValue + ' ms');
            PlayerActions.setSubDelay(newValue);
            PlayerActions.announcement('Subtitle Delay: ' + newValue + ' ms');
        });

        this.props.bindShortcut('j', (event) => {
            var audioDelayField = PlayerStore.getState().audioDelayField;
            var newValue = parseInt(audioDelayField.getValue())-50;
            audioDelayField.setValue(newValue + ' ms');
            PlayerActions.setAudioDelay(newValue);
            PlayerActions.announcement('Audio Delay: ' + newValue + ' ms');
        });
    
        this.props.bindShortcut('k', (event) => {
            var audioDelayField = PlayerStore.getState().audioDelayField;
            var newValue = parseInt(audioDelayField.getValue())+50;
            audioDelayField.setValue(newValue + ' ms');
            PlayerActions.setAudioDelay(newValue);
            PlayerActions.announcement('Audio Delay: ' + newValue + ' ms');
        });

        this.props.bindShortcut('alt+up', (event) => {
            var newValue = Math.round((ls('customSubSize') + 5) / 5) * 5;
            if (newValue > 500) newValue = 500;
            ls('customSubSize', newValue);
            PlayerActions.announcement('Subtitle Size ' + newValue + '%');
            PlayerStore.getState().subSizeField.setValue(newValue + '%');
        });

        this.props.bindShortcut('alt+down', (event) => {
            var newValue = Math.round((ls('customSubSize') - 5) / 5) * 5;
            if (newValue < 5) newValue = 5;
            ls('customSubSize', newValue);
            PlayerActions.announcement('Subtitle Size ' + newValue + '%');
            PlayerStore.getState().subSizeField.setValue(newValue + '%');
        });

        this.props.bindShortcut('shift+up', (event) => {
            var playerState = PlayerStore.getState();
            var newValue = parseInt(playerState.subBottom) + 5;
            PlayerActions.announcement('Moved Subtitles Up');
            PlayerActions.settingChange({
                subBottom: newValue + 'px'
            });
        });

        this.props.bindShortcut('shift+down', (event) => {
            var playerState = PlayerStore.getState();
            var newValue = parseInt(playerState.subBottom) - 5;
            if (newValue < 0) newValue = 0;
            PlayerActions.announcement('Moved Subtitles Down');
            PlayerActions.settingChange({
                subBottom: newValue + 'px'
            });
        });

        this.props.bindShortcut('[', (event) => {
            
            var newRate = 0;
            var playerState = PlayerStore.getState();
            var curRate = parseFloat(playerState.wcjs.input.rate);
            
            if (curRate >= 0.25 && curRate <= 0.5) newRate = 0.125;
            else if (curRate > 0.5 && curRate <= 1) newRate = 0.25;
            else if (curRate > 1 && curRate <= 2) newRate = 0.5;
            else if (curRate > 2 && curRate <= 4) newRate = 1;
            else if (curRate > 4) newRate = curRate /2;
    
            if ((curRate + newRate) >= 0.125) {
                playerState.wcjs.input.rate = curRate - newRate;
    
                var newValue = parseFloat(Math.round(playerState.wcjs.input.rate * 100) / 100).toFixed(2);
        
                playerState.speedField.setValue(newValue + 'x');
                
                PlayerActions.announcement('Speed: ' + newValue + 'x');
            }
        });

        this.props.bindShortcut(']', (event) => {
    
            var newRate = 0;
            var playerState = PlayerStore.getState();
            var curRate = parseFloat(playerState.wcjs.input.rate);
            
            if (curRate < 0.25) newRate = 0.125;
            else if (curRate >= 0.25 && curRate < 0.5) newRate = 0.125;
            else if (curRate >= 0.5 && curRate < 1) newRate = 0.25;
            else if (curRate >= 1 && curRate < 2) newRate = 0.5;
            else if (curRate >= 2 && curRate < 4) newRate = 1;
            else if (curRate >= 4) newRate = curRate;
    
            if ((curRate + newRate) < 100) {
                playerState.wcjs.input.rate = curRate + newRate;
    
                var newValue = parseFloat(Math.round(playerState.wcjs.input.rate * 100) / 100).toFixed(2);
        
                playerState.speedField.setValue(newValue + 'x');
                
                PlayerActions.announcement('Speed: ' + newValue + 'x');
            }
        });

        this.props.bindShortcut('=', (event) => {
    
            var newRate = 0;
            var playerState = PlayerStore.getState();

            playerState.wcjs.input.rate = 1.0;

            var newValue = parseFloat(Math.round(playerState.wcjs.input.rate * 100) / 100).toFixed(2);
    
            playerState.speedField.setValue(newValue + 'x');
            
            PlayerActions.announcement('Speed: ' + newValue + 'x');

        });

        this.props.bindShortcut('t', (event) => {
            var playerState = PlayerStore.getState();
            PlayerActions.announcement(playerState.currentTime + ' / ' + playerState.totalTime);
        });

        this.props.bindShortcut('f', (event) => {
            PlayerActions.toggleFullscreen(!PlayerStore.getState().fullscreen);
        });

        this.props.bindShortcut('f11', (event) => {
            PlayerActions.toggleFullscreen(!PlayerStore.getState().fullscreen);
        });

        this.props.bindShortcut('m', (event) => {
            var playerState = PlayerStore.getState();
            PlayerActions.mute(!playerState.muted);
            if (!playerState.muted)
                PlayerActions.announcement('Muted');
            else
                PlayerActions.announcement('Volume ' + playerState.wcjs.volume + '%');
        });

        this.props.bindShortcut('ctrl+l', (event) => {
            PlayerActions.togglePlaylist();
        });

        this.props.bindShortcut('n', (event) => {
            PlayerActions.next();
        });

        this.props.bindShortcut('ctrl+h', (event) => {
            var playerState = PlayerStore.getState();
            if (playerState.uiHidden)
                PlayerActions.announcement('UI Visible');
            else
                PlayerActions.announcement('UI Hidden');
            PlayerActions.settingChange({
                uiHidden: !playerState.uiHidden
            });
        });

        this.props.bindShortcut('esc', (event) => {
            var playerState = PlayerStore.getState();
            if (playerState.playlistOpen) {
                PlayerActions.settingChange({
                    playlistOpen: false
                });
            } else if (playerState.settingsOpen) {
                PlayerActions.settingChange({
                    settingsOpen: false
                });
            } else if (playerState.subtitlesOpen) {
                PlayerActions.settingChange({
                    subtitlesOpen: false
                });
            } else if (playerState.fullscreen) {
                PlayerActions.toggleFullscreen(false);
            }
        });

        this.props.bindShortcut('p', (event) => {
            PlayerStore.getState().wcjs.time = 0;
        });
        
        var aspectRatios = ['Default','1:1','4:3','16:9','16:10','2.21:1','2.35:1','2.39:1','5:4'];
        
        this.props.bindShortcut('a', (event) => {
            var playerState = PlayerStore.getState();
            aspectRatios.some((el, ij) => {
                if (el == playerState.aspectRatio) {
                    if (aspectRatios.length == ij+1)
                        var newValue = 0;
                    else
                        var newValue = ij + 1;

                    PlayerActions.settingChange({
                        aspectRatio: aspectRatios[newValue],
                        crop: 'Default',
                        zoom: 1
                    });
                    PlayerActions.announcement('Aspect Ratio: ' + aspectRatios[newValue]);
                    playerState.events.emit('resizeNow');
                    return true;
                } else return false;
            });
        });
        
        var crops = ['Default','16:10','16:9','1.85:1','2.21:1','2.35:1','2.39:1','5:3','4:3','5:4','1:1'];
        
        this.props.bindShortcut('c', (event) => {
            var playerState = PlayerStore.getState();
            crops.some((el, ij) => {
                if (el == playerState.crop) {
                    if (crops.length == ij+1)
                        var newValue = 0;
                    else
                        var newValue = ij + 1;

                    PlayerActions.settingChange({
                        crop: crops[newValue],
                        aspectRatio: 'Default',
                        zoom: 1
                    });
                    PlayerActions.announcement('Crop: ' + crops[newValue]);
                    playerState.events.emit('resizeNow');
                    return true;
                } else return false;
            });
        });

        var zooms = [['Default',1],['2x Double',2],['0.25x Quarter',0.25],['0.5x Half',0.5]];
        
        this.props.bindShortcut('z', (event) => {
            var playerState = PlayerStore.getState();
            zooms.some((el, ij) => {
                if (el[1] == playerState.zoom) {
                    if (zooms.length == ij+1)
                        var newValue = 0;
                    else
                        var newValue = ij + 1;

                    PlayerActions.settingChange({
                        zoom: zooms[newValue][1],
                        crop: 'Default',
                        aspectRatio: 'Default'
                    });
                    PlayerActions.announcement('Zoom: ' + zooms[newValue][0]);
                    playerState.events.emit('resizeNow');
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
    },
    componentDidMount() {
        var announcer = document.getElementsByClassName('wcjs-announce')[0];
        if (['', '0'].indexOf(announcer.style.opacity) > -1) {
            PlayerActions.buffering(0);
        }
        PlayerActions.settingChange({
            notifier: this.refs.notificator
        });
    },
    update() {
        if (this.isMounted()) {
            var playerState = PlayerStore.getState();
            this.setState({
                uri: playerState.uri,

                volume: playerState.volume,
                position: playerState.position,
                buffering: playerState.buffering,
                uiShown: playerState.uiShown,
                
                fontSize: playerState.fontSize,
                subSize: playerState.subSize,
                
                rippleEffects: playerState.rippleEffects
            });
        }
    },
    hideUI() {
        if (!PlayerStore.getState().scrobbling) {
            PlayerActions.uiShown(false);
        } else {
            this.hoverTimeout = setTimeout(this.hideUI, 3000);
        }
    },
    hover(event) {
        this.hoverTimeout && clearTimeout(this.hoverTimeout);
        this.state.uiShown || PlayerActions.uiShown(true);
        this.hoverTimeout = setTimeout(this.hideUI, 3000);
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
