import React from 'react';
import _ from 'lodash';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import MUI from 'material-ui';

const {
    RaisedButton, Toggle, Tabs, Tab, TextField, IconButton
} = MUI;
import PlayerStore from '../store';
import PlayerActions from '../actions';
import traktUtil from '../utils/trakt';
import MessageActions from '../../Message/actions';
import ModalActions from '../../Modal/actions';
import Register from '../../../utils/registerUtil';
import ls from 'local-storage';

var injectTapEventPlugin = require("react-tap-event-plugin");
injectTapEventPlugin();

import webFrame from 'web-frame';

const dialog = require('remote').require('dialog');

export
default React.createClass({

    childContextTypes: {
        muiTheme: React.PropTypes.object,
    },

    getChildContext() {
        return {
            muiTheme: MUI.Styles.ThemeManager.getMuiTheme(MUI.Styles['DarkRawTheme'])
        };
    },
    
    mixins: [PureRenderMixin],

    getInitialState() {
        var playerState = PlayerStore.getState();
        return {
            open: false,
            uiHidden: playerState.uiHidden,
            alwaysOnTop: playerState.alwaysOnTop,
            clickPause: playerState.clickPause,
            playerRippleEffects: playerState.rippleEffects,
            playerNotifs: ls.isSet('playerNotifs') ? ls('playerNotifs') : true,
            trakt: traktUtil.loggedIn ? true : false,
            traktScrobble: ls.isSet('traktScrobble') ? ls('traktScrobble') : true,
            findSubs: ls.isSet('findSubs') ? ls('findSubs') : true,
            autoSub: ls.isSet('autoSub') ? ls('autoSub') : true,
            menuFlags: ls.isSet('menuFlags') ? ls('menuFlags') : true,
            defaultSubDelay: playerState.subDelay,
            defaultAudioDelay: playerState.audioDelay,
            speed: playerState.speed,
            customSubSize: ls('customSubSize'),
            zoomLevel: ls.isSet('zoomLevel') ? ls('zoomLevel') : 0,
            audioChannels: ['Error', 'Stereo', 'Reverse Stereo', 'Left', 'Right', 'Dolby'],
            defaultAudioChannel: playerState.audioChannel,
            subColor: ls.isSet('subColor') ? ls('subColor') : 0,
            subColors: ['White', 'Yellow', 'Green', 'Cyan', 'Blue'],
            defaultAudioTrack: playerState.audioTrack,
            encoding: ls.isSet('selectedEncoding') ? ls('selectedEncoding') : 0,
            defaultPort: ls('peerPort'),
            defaultPeers: ls('maxPeers'),
            downloadFolder: ls('downloadFolder') ? ls('downloadFolder') : 'Temp',
            bufferSize: parseInt(ls('bufferSize') / 1000).toFixed(1),
            speedPulsing: ls('speedPulsing') ? ls('speedPulsing') : 'disabled',
            subEncodings: [
                ['Auto Detect', 'auto'],
                ['Universal (UTF-8)', 'utf8'],
                ['Universal (UTF-16)', 'utf16'],
                ['Universal (big endian UTF-16)', 'UTF-16BE'],
                ['Universal (little endian UTF-16)', 'utf16le'],
                ['Universal, Chinese (GB18030)', 'GB18030'],
                ['Western European (Latin-9)', 'latin9'],
                ['Western European (Windows-1252)', 'windows1252'],
                ['Western European (IBM 00850)', 'ibm850'],
                ['Eastern European (Latin-2)', 'latin2'],
                ['Eastern European (Windows-1250)', 'windows1250'],
                ['Esperanto (Latin-3)', 'latin3'],
                ['Nordic (Latin-6)', 'latin6'],
                ['Cyrillic (Windows-1251)', 'windows1251'],
                ['Russian (KOI8-R)', 'koi8-ru'],
                ['Ukranian (KOI8-U)', 'koi8-u'],
                ['Arabic (ISO 8859-6)', 'ISO-8859-6'],
                ['Arabic (Windows-1256)', 'windows1256'],
                ['Greek (ISO 8859-7)', 'ISO-8859-7'],
                ['Greek (Windows-1253)', 'windows1253'],
                ['Hebrew (ISO 8859-8)', 'ISO-8859-8'],
                ['Hebrew (Windows-1255)', 'windows1255'],
                ['Turkish (ISO 8859-9)', 'ISO-8859-9'],
                ['Turkish (Windows-1254)', 'windows1254'],
                ['Thai (TIS 620-2533/ISO 8859-11)', 'ISO-8859-11'],
                ['Thai (Windows-874)', 'windows874'],
                ['Baltic (Latin-7)', 'latin7'],
                ['Baltic (Windows-1257)', 'windows1257'],
                ['Celtic (Latin-8)', 'latin8'],
                ['South-Eastern European (Latin-10)', 'latin10'],
                ['Simplified Chinese (ISO-2022-CN-EXT)', 'ISO-2022-CN-EXT'],
                ['Simplified Chinese Unix (EUC-CN)', 'EUC-CN'],
                ['Japanese (7-bits JIS/ISO-2022-JP-2)', 'ISO-2022-JP-2'],
                ['Japanese Unix (EUC-JP)', 'EUC-JP'],
                ['Japanese (Shift JIS)', 'Shift_JIS'],
                ['Korean (EUC-KR/CP949)', 'EUC-KR'],
                ['Korean (ISO-2022-KR)', 'ISO-2022-KR'],
                ['Traditional Chinese (Big5)', 'Big5'],
                ['Traditional Chinese Unix (EUC-TW)', 'EUC-TW'],
                ['Hong-Kong Supplementary (HKSCS)', 'Big5-HKSCS'],
                ['Vietnamese (VISCII)', 'viscii'],
                ['Vietnamese (Windows-1258)', 'windows1258']
            ],
            
            aspectRatios: ['Default','1:1','4:3','16:9','16:10','2.21:1','2.35:1','2.39:1','5:4'],
            crops: ['Default','16:10','16:9','1.85:1','2.21:1','2.35:1','2.39:1','5:3','4:3','5:4','1:1'],
            zooms: [['Default',1],['2x Double',2],['0.25x Quarter',0.25],['0.5x Half',0.5]],
            aspectRatio: playerState.aspectRatio,
            crop: playerState.crop,
            zoom: playerState.zoom
        }
    },
    componentWillMount() {
        PlayerStore.listen(this.update);
    },

    componentWillUnmount() {
        PlayerStore.unlisten(this.update);
    },
    
    componentDidMount() {
        PlayerActions.settingChange({
            subDelayField: this.refs['subDelayInput'],
            audioDelayField: this.refs['audioDelayInput'],
            audioChannelField: this.refs['audioChannelInput'],
            speedField: this.refs['speedInput'],
            audioTrackField: this.refs['audioTrackInput'],
            subSizeField: this.refs['subSizeInput'],
            aspectField: this.refs['aspectInput'],
            cropField: this.refs['cropInput'],
            zoomField: this.refs['zoomInput']
        });
    },
        
    update() {
        if (this.isMounted()) {
            var playerState = PlayerStore.getState();
            this.setState({
                open: playerState.settingsOpen,
                uiHidden: playerState.uiHidden,
                alwaysOnTop: playerState.alwaysOnTop,
                clickPause: playerState.clickPause,
                playerRippleEffects: playerState.rippleEffects,
                trakt: traktUtil.loggedIn ? true : false,
                defaultSubDelay: playerState.subDelay,
                defaultAudioDelay: playerState.audioDelay,
                speed: playerState.speed,
                customSubSize: ls('customSubSize'),
                zoomLevel: ls.isSet('zoomLevel') ? ls('zoomLevel') : 0,
                defaultAudioChannel: playerState.audioChannel,
                subColor: ls.isSet('subColor') ? ls('subColor') : 0,
                defaultAudioTrack: playerState.audioTrack,
                encoding: ls.isSet('selectedEncoding') ? ls('selectedEncoding') : 0,
                aspectRatio: playerState.aspectRatio,
                crop: playerState.crop,
                zoom: playerState.zoom
            });
        }
    },

    close() {
        PlayerActions.openSettings(false);
    },
    openTraktLogin(event) {
        if (traktUtil.loggedIn) {
            traktUtil.logOut();
            MessageActions.open('Logout Successful');
            this.setState({
                trakt: false
            });
        } else {
            ModalActions.open({
                title: 'Login to Trakt',
                type: 'TraktCode',
                theme: 'DarkRawTheme'
            });
        }
    },

    handleAlwaysOnTop(event, toggled) {
        PlayerActions.settingChange({
            alwaysOnTop: toggled
        });
        PlayerActions.toggleAlwaysOnTop(toggled);
    },

    handlePlayerRippleEffects(event, toggled) {
        ls('playerRippleEffects', toggled);
        PlayerActions.settingChange({
            rippleEffects: toggled
        });
    },

    handleFindSubs(event, toggled) {
        ls('findSubs', toggled);
        this.setState({
            findSubs: toggled
        });
    },

    handleScrobbler(event, toggled) {
        ls('traktScrobble', toggled);
        this.setState({
            traktScrobble: toggled
        });
    },

    handlePlayerNotifs(event, toggled) {
        ls('playerNotifs', toggled);
        this.setState({
            playerNotifs: toggled
        });
    },
    
    handleAutoSub(event, toggled) {
        ls('autoSub', toggled);
        this.setState({
            autoSub: toggled
        });
    },

    handleMenuFlags(event, toggled) {
        ls('menuFlags', toggled);
        this.setState({
            menuFlags: toggled
        });
    },

    handleClickPause(event, toggled) {
        ls('clickPause', toggled);
        PlayerActions.settingChange({
            clickPause: toggled
        });
    },

    _handleSubDelayDown(event) {
        this.refs['subDelayInput'].setValue((parseInt(this.refs['subDelayInput'].getValue()) - 50) + ' ms');
        if (event)
            PlayerActions.setSubDelay(parseInt(this.refs['subDelayInput'].getValue()));
    },

    _handleSubDelayUp(event) {
        this.refs['subDelayInput'].setValue((parseInt(this.refs['subDelayInput'].getValue()) + 50) + ' ms');
        if (event)
            PlayerActions.setSubDelay(parseInt(this.refs['subDelayInput'].getValue()));
    },
    
    _handleSubDelayKeys(event) {
        if (event.keyCode == 38) {
            event.preventDefault();
            this._handleSubDelayUp();
        } else if (event.keyCode == 40) {
            event.preventDefault();
            this._handleSubDelayDown();
        } else if ([13, 27].indexOf(event.keyCode) > -1) {
            event.preventDefault();
            this.refs['subDelayInput'].blur();
        }
    },
    
    _handleSubDelayBlur(event) {
        var newValue = parseInt(this.refs['subDelayInput'].getValue());
        if (isNaN(newValue))
            newValue = 0;

        this.refs['subDelayInput'].setValue(newValue+' ms');
        PlayerActions.setSubDelay(newValue);
    },

    _handleAudioDelayDown(event) {
        this.refs['audioDelayInput'].setValue((parseInt(this.refs['audioDelayInput'].getValue())-50)+' ms');
        if (event)
            PlayerActions.setAudioDelay(parseInt(this.refs['audioDelayInput'].getValue()));
    },
    
    _handleAudioDelayUp(event) {
        this.refs['audioDelayInput'].setValue((parseInt(this.refs['audioDelayInput'].getValue())+50)+' ms');
        if (event)
            PlayerActions.setAudioDelay(parseInt(this.refs['audioDelayInput'].getValue()));
    },
    
    _handleAudioDelayKeys(event) {
        if (event.keyCode == 38) {
            event.preventDefault();
            this._handleAudioDelayUp();
        } else if (event.keyCode == 40) {
            event.preventDefault();
            this._handleAudioDelayDown();
        } else if ([13, 27].indexOf(event.keyCode) > -1) {
            event.preventDefault();
            this.refs['audioDelayInput'].blur();
        }
    },
    
    _handleAudioDelayBlur(event) {
        var newValue = parseInt(this.refs['audioDelayInput'].getValue());
        if (isNaN(newValue))
            newValue = 0;

        this.refs['audioDelayInput'].setValue(newValue+' ms');
        PlayerActions.setAudioDelay(newValue);
    },

    _handleSpeedDown(event) {
        
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
    
            this.refs['speedInput'].setValue(newValue + 'x');
        }
    },
    
    _handleSpeedUp(event) {

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
    
            this.refs['speedInput'].setValue(newValue + 'x');
        }
    },
    
    _handleSpeedKeys(event) {
        if (event.keyCode == 38) {
            event.preventDefault();
            this._handleSpeedUp();
        } else if (event.keyCode == 40) {
            event.preventDefault();
            this._handleSpeedDown();
        } else if ([13, 27].indexOf(event.keyCode) > -1) {
            event.preventDefault();
            this.refs['speedInput'].blur();
        }
    },
    
    _handleSpeedBlur(event) {
        var newValue = parseFloat(this.refs['speedInput'].getValue());
        if (isNaN(newValue))
            newValue = 0.125;

        if (newValue > 64)
            newValue = 64;
        else if (newValue < 0.25)
            newValue = 0.125;

        var newValue = parseFloat(Math.round(newValue * 100) / 100).toFixed(2);

        this.refs['speedInput'].setValue(newValue+'x');
        PlayerStore.getState().wcjs.input.rate = newValue;
    },
    
    _handleSubSizeDown(event) {
        var newValue = parseInt(this.refs['subSizeInput'].getValue()) - 5;
        this.refs['subSizeInput'].setValue(newValue + '%');
        if (event) {
            ls('customSubSize', newValue);
            this.setState({
                customSubSize: newValue
            });
        }
    },
    
    _handleSubSizeUp(event) {
        var newValue = parseInt(this.refs['subSizeInput'].getValue()) + 5;
        this.refs['subSizeInput'].setValue(newValue + '%');
        if (event) {
            ls('customSubSize', newValue);
            this.setState({
                customSubSize: newValue
            });
        }
    },
    
    _handleSubSizeKeys(event) {
        if (event.keyCode == 38) {
            event.preventDefault();
            this._handleSubDelayUp();
        } else if (event.keyCode == 40) {
            event.preventDefault();
            this._handleSubDelayDown();
        } else if ([13, 27].indexOf(event.keyCode) > -1) {
            event.preventDefault();
            this.refs['subSizeInput'].blur();
        }
    },
    
    _handleSubSizeBlur(event) {
        var newValue = parseInt(this.refs['subSizeInput'].getValue());
        if (isNaN(newValue))
            newValue = 5;
            
        if (newValue < 5)
            newValue = 5;
        else if (newValue > 400)
            newValue = 400;

        this.refs['subSizeInput'].setValue(newValue+'%');
        
        ls('customSubSize', newValue);
        this.setState({
            customSubSize: newValue
        });
    },

    _handleZoomLevelDown(event) {
        var newValue = parseFloat(this.refs['zoomLevelInput'].getValue()) - 0.5;
        this.refs['zoomLevelInput'].setValue(newValue);
        webFrame.setZoomLevel(newValue);
        ls('zoomLevel', newValue);
    },

    _handleZoomLevelUp(event) {
        var newValue = parseFloat(this.refs['zoomLevelInput'].getValue()) + 0.5;
        this.refs['zoomLevelInput'].setValue(newValue);
        webFrame.setZoomLevel(newValue);
        ls('zoomLevel', newValue);
    },
    
    _handleAudioChannelDown(event) {
        var newChannel = parseInt(this.state.defaultAudioChannel) - 1;
        if (newChannel == 0)
            newChannel = this.state.audioChannels.length -1;
        PlayerStore.getState().wcjs.audio.channel = newChannel;
        PlayerActions.settingChange({
            audioChannel: newChannel
        });
        this.refs['audioChannelInput'].setValue(this.state.audioChannels[newChannel]);
    },
    
    _handleAudioChannelUp(event) {
        var newChannel = parseInt(this.state.defaultAudioChannel) + 1;
        if (newChannel == this.state.audioChannels.length)
            newChannel = 1;
        PlayerStore.getState().wcjs.audio.channel = newChannel;
        PlayerActions.settingChange({
            audioChannel: newChannel
        });
        this.refs['audioChannelInput'].setValue(this.state.audioChannels[newChannel]);
    },
    
    _handleSubColorDown(event) {
        if (!ls.isSet('subColor')) ls('subColor', 0);
        var newColor = ls('subColor') - 1;
        if (newColor == -1)
            newColor = this.state.subColors.length -1;
        ls('subColor', newColor);
        this.setState({
            subColor: newColor
        });
        this.refs['subColorInput'].setValue(this.state.subColors[newColor]);
    },
    
    _handleSubColorUp(event) {
        if (!ls.isSet('subColor')) ls('subColor', 0);
        var newColor = ls('subColor') + 1;
        if (newColor == this.state.subColors.length)
            newColor = 0;
        ls('subColor', newColor);
        this.setState({
            subColor: newColor
        });
        this.refs['subColorInput'].setValue(this.state.subColors[newColor]);
    },
    
    _handleAudioTracksDown(event) {
        var newTrack = parseInt(this.state.defaultAudioTrack) - 1;
        var wcjs = PlayerStore.getState().wcjs;
        if (newTrack == -1)
            newTrack = wcjs.audio.count -1;

        PlayerActions.settingChange({
            audioTrack: newTrack
        });
        wcjs.audio.track = newTrack;
        this.refs['audioTrackInput'].setValue(wcjs.audio[newTrack]);
    },
    
    _handleAudioTracksUp(event) {
        var newTrack = parseInt(this.state.defaultAudioTrack) + 1;
        var wcjs = PlayerStore.getState().wcjs;
        if (newTrack == wcjs.audio.count)
            newTrack = 0;

        PlayerActions.settingChange({
            audioTrack: newTrack
        });
        wcjs.audio.track = newTrack;
        this.refs['audioTrackInput'].setValue(wcjs.audio[newTrack]);
    },
    
    _handleSubEncodingDown(event) {
        if (!ls.isSet('selectedEncoding')) ls('selectedEncoding', 0);
        var newEncoding = ls('selectedEncoding') - 1;
        if (newEncoding == -1)
            newEncoding = this.state.subEncodings.length -1;

        ls('selectedEncoding', newEncoding);
        ls('subEncoding', this.state.subEncodings[newEncoding][1]);
        PlayerActions.settingChange({
            encoding: newEncoding
        });
        this.refs['subEncodingInput'].setValue(this.state.subEncodings[newEncoding][0]);
    },
    
    _handleSubEncodingUp(event) {
        if (!ls.isSet('selectedEncoding')) ls('selectedEncoding', 0);
        var newEncoding = ls('selectedEncoding') + 1;
        if (newEncoding == this.state.subEncodings.length)
            newEncoding = 0;

        ls('selectedEncoding', newEncoding);
        ls('subEncoding', this.state.subEncodings[newEncoding][1]);
        PlayerActions.settingChange({
            encoding: newEncoding
        });
        this.refs['subEncodingInput'].setValue(this.state.subEncodings[newEncoding][0]);
    },
    
    _handlePortDown(event) {
        var newValue = parseInt(this.refs['portInput'].getValue())-1;
        if (newValue < 1)
            newValue = 1;
        if (newValue > 65535)
            newValue = 65535;
        this.refs['portInput'].setValue(newValue);
        if (event)
            ls('peerPort', newValue);
    },

    _handlePortUp(event) {
        var newValue = parseInt(this.refs['portInput'].getValue())+1;
        if (newValue > 65535)
            newValue = 65535;
        this.refs['portInput'].setValue(newValue);
        if (event)
            ls('peerPort', newValue);
    },
    
    _handlePortKeys(event) {
        if (event.keyCode == 38) {
            event.preventDefault();
            this._handlePortUp();
        } else if (event.keyCode == 40) {
            event.preventDefault();
            this._handlePortDown();
        } else if ([13, 27].indexOf(event.keyCode) > -1) {
            event.preventDefault();
            this.refs['portInput'].blur();
        }
    },
    
    _handlePortBlur(event) {
        var newValue = parseInt(this.refs['portInput'].getValue());
        if (isNaN(newValue) || newValue < 1)
            newValue = 1;
        if (newValue > 65535)
            newValue = 65535;

        this.refs['portInput'].setValue(newValue);
        ls('peerPort', newValue);
    },
    
    _handlePeersDown(event) {
        var newValue = parseInt(this.refs['peerInput'].getValue())-1;
        if (newValue < 1)
            newValue = 1;
        if (newValue > 100000)
            newValue = 100000;
        this.refs['peerInput'].setValue(newValue);
        if (event)
            ls('maxPeers', newValue);
    },

    _handlePeersUp(event) {
        var newValue = parseInt(this.refs['peerInput'].getValue())+1;
        if (newValue > 100000)
            newValue = 100000;
        this.refs['peerInput'].setValue(newValue);
        if (event)
            ls('maxPeers', newValue);
    },
    
    _handlePeersKeys(event) {
        if (event.keyCode == 38) {
            event.preventDefault();
            this._handlePeersUp();
        } else if (event.keyCode == 40) {
            event.preventDefault();
            this._handlePeersDown();
        } else if ([13, 27].indexOf(event.keyCode) > -1) {
            event.preventDefault();
            this.refs['peerInput'].blur();
        }
    },
    
    _handlePeersBlur(event) {
        var newValue = parseInt(this.refs['peerInput'].getValue());
        if (isNaN(newValue) || newValue < 1)
            newValue = 1;
        if (newValue > 100000)
            newValue = 100000;

        this.refs['peerInput'].setValue(newValue);
        ls('maxPeers', newValue);
    },

    _handleBufferSizeDown(event) {
        var newValue = (parseFloat(this.refs['bufferInput'].getValue()) * 1000) - 500;
        if (newValue < 0)
            newValue = 0;
        if (newValue > 60000)
            newValue = 60000;
        this.refs['bufferInput'].setValue((newValue/1000).toFixed(1) + ' sec');
        if (event)
            ls('bufferSize', newValue);
    },

    _handleBufferSizeUp(event) {
        var newValue = (parseFloat(this.refs['bufferInput'].getValue()) * 1000) + 500;
        if (newValue > 60000)
            newValue = 60000;
        this.refs['bufferInput'].setValue((newValue/1000).toFixed(1) + ' sec');
        if (event)
            ls('bufferSize', newValue);
    },

    _handleBufferSizeKeys(event) {
        if (event.keyCode == 38) {
            event.preventDefault();
            this._handleBufferSizeUp();
        } else if (event.keyCode == 40) {
            event.preventDefault();
            this._handleBufferSizeDown();
        } else if ([13, 27].indexOf(event.keyCode) > -1) {
            event.preventDefault();
            this.refs['bufferInput'].blur();
        }
    },

    _handleBufferSizeBlur(event) {
        var newValue = parseFloat(this.refs['bufferInput'].getValue()) * 1000;
        if (isNaN(newValue) || newValue < 0)
            newValue = 0;
        if (newValue > 60000)
            newValue = 60000;

        this.refs['bufferInput'].setValue((newValue/1000).toFixed(1) + ' sec');
        ls('bufferSize', newValue);
    },

    _handleClearDownload(event) {
        ls.remove('downloadFolder');
        this.refs['downloadInput'].setValue('Temp');
    },
    
    _handleDownloadFocus(event) {
        this.refs['downloadInput'].blur();
        dialog.showOpenDialog({
            title: 'Select folder',
            properties: ['openDirectory', 'createDirectory']
        }, (folder) => {
            if (folder && folder.length) {
                ls('downloadFolder', folder[0]);
                this.refs['downloadInput'].setValue(folder[0]);
            }
        });
    },

    _handlePulsingToggle(event) {
        var newValue = this.refs['pulseInput'].getValue();
        if (newValue == 'disabled') {
            newValue = 'enabled';
            PlayerActions.pulse();
        } else if (newValue == 'enabled') {
            newValue = 'disabled';
            PlayerActions.flood();
        }
        ls('speedPulsing', newValue);
        this.setState({
            speedPulsing: newValue
        });
        this.refs['pulseInput'].setValue(newValue);
    },

    _handleAspectUp(event) {

        var aspectRatio = this.state.aspectRatio;
        var aspectRatios = this.state.aspectRatios;
        var zoomInput = this.refs['zoomInput'];
        var aspectInput = this.refs['aspectInput'];
        var cropInput = this.refs['cropInput'];

        aspectRatios.some((el, ij) => {
            if (el == aspectRatio) {
                if (aspectRatios.length == ij+1)
                    var newValue = 0;
                else
                    var newValue = ij + 1;

                PlayerActions.settingChange({
                    aspectRatio: aspectRatios[newValue],
                    crop: 'Default',
                    zoom: 1
                });

                aspectInput.setValue(aspectRatios[newValue]);
                zoomInput.setValue('Default');
                cropInput.setValue('Default');
                _.defer(() => {
                    PlayerStore.getState().events.emit('resizeNow');
                });

                return true;
            } else return false;
        });
    },

    _handleAspectDown(event) {

        var aspectRatio = this.state.aspectRatio;
        var aspectRatios = this.state.aspectRatios;
        var zoomInput = this.refs['zoomInput'];
        var aspectInput = this.refs['aspectInput'];
        var cropInput = this.refs['cropInput'];

        aspectRatios.some((el, ij) => {
            if (el == aspectRatio) {
                if (ij - 1 < 0)
                    var newValue = aspectRatios.length - 1;
                else
                    var newValue = ij - 1;

                PlayerActions.settingChange({
                    aspectRatio: aspectRatios[newValue],
                    crop: 'Default',
                    zoom: 1
                });

                aspectInput.setValue(aspectRatios[newValue]);
                zoomInput.setValue('Default');
                cropInput.setValue('Default');
                _.defer(() => {
                    PlayerStore.getState().events.emit('resizeNow');
                });

                return true;
            } else return false;
        });
    },

    _handleCropUp(event) {

        var crop = this.state.crop;
        var crops = this.state.crops;
        var zoomInput = this.refs['zoomInput'];
        var aspectInput = this.refs['aspectInput'];
        var cropInput = this.refs['cropInput'];

        crops.some((el, ij) => {
            if (el == crop) {
                if (crops.length == ij+1)
                    var newValue = 0;
                else
                    var newValue = ij + 1;

                PlayerActions.settingChange({
                    crop: crops[newValue],
                    aspectRatio: 'Default',
                    zoom: 1
                });

                cropInput.setValue(crops[newValue]);
                zoomInput.setValue('Default');
                aspectInput.setValue('Default');
                _.defer(() => {
                    PlayerStore.getState().events.emit('resizeNow');
                });

                return true;
            } else return false;
        });
    },

    _handleCropDown(event) {

        var crop = this.state.crop;
        var crops = this.state.crops;
        var zoomInput = this.refs['zoomInput'];
        var aspectInput = this.refs['aspectInput'];
        var cropInput = this.refs['cropInput'];

        crops.some((el, ij) => {
            if (el == crop) {
                if (ij - 1 < 0)
                    var newValue = crops.length - 1;
                else
                    var newValue = ij - 1;

                PlayerActions.settingChange({
                    crop: crops[newValue],
                    aspectRatio: 'Default',
                    zoom: 1
                });

                cropInput.setValue(crops[newValue]);
                zoomInput.setValue('Default');
                aspectInput.setValue('Default');
                _.defer(() => {
                    PlayerStore.getState().events.emit('resizeNow');
                });

                return true;
            } else return false;
        });
    },

    _handleZoomUp(event) {

        var zoom = this.state.zoom;
        var zooms = this.state.zooms;
        var zoomInput = this.refs['zoomInput'];
        var aspectInput = this.refs['aspectInput'];
        var cropInput = this.refs['cropInput'];

        zooms.some((el, ij) => {
            if (el[1] == zoom) {
                if (zooms.length == ij+1)
                    var newValue = 0;
                else
                    var newValue = ij + 1;

                PlayerActions.settingChange({
                    zoom: zooms[newValue][1],
                    crop: 'Default',
                    aspectRatio: 'Default'
                });

                zoomInput.setValue(zooms[newValue][0]);
                cropInput.setValue('Default');
                aspectInput.setValue('Default');
                _.defer(() => {
                    PlayerStore.getState().events.emit('resizeNow');
                });
                
                return true;
            } else return false;
        });
    },

    _handleZoomDown(event) {

        var zoom = this.state.zoom;
        var zooms = this.state.zooms;
        var zoomInput = this.refs['zoomInput'];
        var aspectInput = this.refs['aspectInput'];
        var cropInput = this.refs['cropInput'];

        zooms.some((el, ij) => {
            if (el[1] == zoom) {
                if (ij - 1 < 0)
                    var newValue = zooms.length - 1;
                else
                    var newValue = ij - 1;

                PlayerActions.settingChange({
                    zoom: zooms[newValue][1],
                    crop: 'Default',
                    aspectRatio: 'Default'
                });

                zoomInput.setValue(zooms[newValue][0]);
                cropInput.setValue('Default');
                aspectInput.setValue('Default');
                _.defer(() => {
                    PlayerStore.getState().events.emit('resizeNow');
                });

                return true;
            } else return false;
        });
    },

    render() {

        return (
            <div className={this.state.uiHidden ? 'playlist-container' : this.state.open ? 'playlist-container show' : 'playlist-container'}>
                <div className="playlist-controls" / >
                <div className="playlist-holder settings-holder" style={{marginLeft: '0', height: '100%'}}>
                    <Tabs style={{width: '70vw', maxWidth: '700px', marginTop: '11%', marginLeft: 'auto', marginRight: 'auto', height: '100%'}}>

                        <Tab label="General" style={{height: '100%'}}>
                            <div className="playlist-inner" style={{maxWidth: '700px', maxHeight: 'calc(100% - 130px)'}}>
                                <div className="setting-header">
                                    Interface
                                </div>
                                <Toggle
                                    name="always-on-top"
                                    onToggle={this.handleAlwaysOnTop}
                                    defaultToggled={this.state.alwaysOnTop}
                                    label="Always on top:"
                                    style={{marginBottom: '7px'}}/>

                                <Toggle
                                    name="click-to-pause"
                                    onToggle={this.handleClickPause}
                                    defaultToggled={this.state.clickPause}
                                    label="Click to Pause:"
                                    style={{marginBottom: '7px'}}/>

                                <Toggle
                                    name="player-ripple-effects"
                                    onToggle={this.handlePlayerRippleEffects}
                                    defaultToggled={this.state.playerRippleEffects}
                                    label="Player Ripple Effects:"
                                    style={{marginBottom: '7px'}}/>

                                <Toggle
                                    name="player-notifs"
                                    onToggle={this.handlePlayerNotifs}
                                    defaultToggled={this.state.playerNotifs}
                                    label="Notifications:"
                                    style={{marginBottom: '7px'}}/>

                                <div className="sub-delay-setting">
                                    <span style={{color: '#fff'}}>
                                        UI Zoom Level:
                                    </span>
                                    <IconButton
                                        onClick={this._handleZoomLevelDown}
                                        iconClassName="material-icons"
                                        iconStyle={{color: '#0097a7', fontSize: '22px', float: 'right'}}>
                                        keyboard_arrow_down
                                    </IconButton>
                                    <IconButton
                                        onClick={this._handleZoomLevelUp}
                                        iconClassName="material-icons"
                                        iconStyle={{color: '#0097a7', fontSize: '22px', float: 'right'}}>
                                        keyboard_arrow_up
                                    </IconButton>
                                    <TextField
                                        disabled={true}
                                        ref="zoomLevelInput"
                                        defaultValue={this.state.zoomLevel + ''}
                                        style={{float: 'right', height: '32px', width: '30px', top: '-5px', marginRight: '4px'}} />
                                </div>

                                <div style={{clear: 'both'}} />

                                <div className="setting-header">
                                    Playback
                                </div>

                                <div className="sub-delay-setting">
                                    <span style={{color: '#fff'}}>
                                        Speed:
                                    </span>
                                    <IconButton
                                        onClick={this._handleSpeedDown}
                                        iconClassName="material-icons"
                                        iconStyle={{color: '#0097a7', fontSize: '22px', float: 'right'}}>
                                        keyboard_arrow_down
                                    </IconButton>
                                    <IconButton
                                        onClick={this._handleSpeedUp}
                                        iconClassName="material-icons"
                                        iconStyle={{color: '#0097a7', fontSize: '22px', float: 'right'}}>
                                        keyboard_arrow_up
                                    </IconButton>
                                    <TextField
                                        ref="speedInput"
                                        defaultValue={parseFloat(Math.round(this.state.speed * 100) / 100).toFixed(2) + 'x'}
                                        onKeyDown={this._handleSpeedKeys}
                                        onBlur={this._handleSpeedBlur}
                                        style={{float: 'right', height: '32px', width: '60px', top: '-5px', marginRight: '4px'}} />

                                </div>

                                <div style={{clear: 'both'}} />

                                <div className="sub-delay-setting">
                                    <span style={{color: '#fff'}}>
                                        Buffer Size:
                                    </span>
                                    <IconButton
                                        onClick={this._handleBufferSizeDown}
                                        iconClassName="material-icons"
                                        iconStyle={{color: '#0097a7', fontSize: '22px', float: 'right'}}>
                                        keyboard_arrow_down
                                    </IconButton>
                                    <IconButton
                                        onClick={this._handleBufferSizeUp}
                                        iconClassName="material-icons"
                                        iconStyle={{color: '#0097a7', fontSize: '22px', float: 'right'}}>
                                        keyboard_arrow_up
                                    </IconButton>
                                    <TextField
                                        ref="bufferInput"
                                        onKeyDown={this._handleBufferSizeKeys}
                                        onBlur={this._handleBufferSizeBlur}
                                        defaultValue={this.state.bufferSize+' sec'}
                                        style={{float: 'right', height: '32px', width: '60px', top: '-5px', marginRight: '4px'}} />
                                </div>

                                <div style={{clear: 'both'}} />

                                <div className="setting-header">
                                    Video
                                </div>

                                <div className="sub-delay-setting">
                                    <span style={{color: '#fff'}}>
                                        Aspect Ratio:
                                    </span>
                                    <IconButton
                                        onClick={this._handleAspectDown}
                                        iconClassName="material-icons"
                                        iconStyle={{color: '#0097a7', fontSize: '22px', float: 'right'}}>
                                        keyboard_arrow_down
                                    </IconButton>
                                    <IconButton
                                        onClick={this._handleAspectUp}
                                        iconClassName="material-icons"
                                        iconStyle={{color: '#0097a7', fontSize: '22px', float: 'right'}}>
                                        keyboard_arrow_up
                                    </IconButton>
                                    <TextField
                                        disabled={true}
                                        ref="aspectInput"
                                        defaultValue={this.state.aspectRatio}
                                        style={{float: 'right', height: '32px', width: '60px', top: '-5px', marginRight: '4px'}} />
                                </div>

                                <div style={{clear: 'both'}} />

                                <div className="sub-delay-setting">
                                    <span style={{color: '#fff'}}>
                                        Crop:
                                    </span>
                                    <IconButton
                                        onClick={this._handleCropDown}
                                        iconClassName="material-icons"
                                        iconStyle={{color: '#0097a7', fontSize: '22px', float: 'right'}}>
                                        keyboard_arrow_down
                                    </IconButton>
                                    <IconButton
                                        onClick={this._handleCropUp}
                                        iconClassName="material-icons"
                                        iconStyle={{color: '#0097a7', fontSize: '22px', float: 'right'}}>
                                        keyboard_arrow_up
                                    </IconButton>
                                    <TextField
                                        disabled={true}
                                        ref="cropInput"
                                        defaultValue={this.state.crop}
                                        style={{float: 'right', height: '32px', width: '60px', top: '-5px', marginRight: '4px'}} />
                                </div>

                                <div style={{clear: 'both'}} />

                                <div className="sub-delay-setting">
                                    <span style={{color: '#fff'}}>
                                        Zoom:
                                    </span>
                                    <IconButton
                                        onClick={this._handleZoomDown}
                                        iconClassName="material-icons"
                                        iconStyle={{color: '#0097a7', fontSize: '22px', float: 'right'}}>
                                        keyboard_arrow_down
                                    </IconButton>
                                    <IconButton
                                        onClick={this._handleZoomUp}
                                        iconClassName="material-icons"
                                        iconStyle={{color: '#0097a7', fontSize: '22px', float: 'right'}}>
                                        keyboard_arrow_up
                                    </IconButton>
                                    <TextField
                                        disabled={true}
                                        ref="zoomInput"
                                        defaultValue={'Default'}
                                        style={{float: 'right', height: '32px', width: '90px', top: '-5px', marginRight: '4px'}} />
                                </div>

                                <div style={{clear: 'both'}} />

                                <div className="setting-header">
                                    Associations
                                </div>

                                <RaisedButton style={{marginBottom: '15px', marginRight: '11px', float: 'left'}} className='long-buttons' onClick={Register.magnet} label={'Magnet Links'} />

                                <RaisedButton style={{marginBottom: '15px', marginRight: '11px', float: 'left'}} className='long-buttons' onClick={Register.videos} label={'Video Files'} />

                                <RaisedButton style={{marginBottom: '15px'}} className='long-buttons' onClick={Register.torrent} label={'Torrent Files'} />

                                <div className="setting-header">
                                    Trakt
                                </div>

                                <Toggle
                                    name="trakt-scrobble"
                                    onToggle={this.handleScrobbler}
                                    defaultToggled={this.state.traktScrobble}
                                    style={{ 'display': (this.state.trakt ? 'block' : 'none') }}
                                    label="Trakt Scrobble:"
                                    style={{marginBottom: '7px'}}/>
                                <RaisedButton className='long-buttons' onClick={this.openTraktLogin} label={ this.state.trakt ? 'Trakt Logout' : 'Trakt Login' } />

                            </div>
                        </Tab>

                        <Tab label="Audio / Subs" style={{height: '100%'}}>
                            <div className="playlist-inner" style={{maxWidth: '700px', maxHeight: 'calc(100% - 130px)'}}>
                                <div className="setting-header">
                                    Audio
                                </div>
                                <div className="sub-delay-setting">
                                    <span style={{color: '#fff'}}>
                                        Audio Channel:
                                    </span>
                                    <IconButton
                                        onClick={this._handleAudioChannelDown}
                                        iconClassName="material-icons"
                                        iconStyle={{color: '#0097a7', fontSize: '22px', float: 'right'}}>
                                        keyboard_arrow_down
                                    </IconButton>
                                    <IconButton
                                        onClick={this._handleAudioChannelUp}
                                        iconClassName="material-icons"
                                        iconStyle={{color: '#0097a7', fontSize: '22px', float: 'right'}}>
                                        keyboard_arrow_up
                                    </IconButton>
                                    <TextField
                                        disabled={true}
                                        ref="audioChannelInput"
                                        defaultValue={this.state.audioChannels[this.state.defaultAudioChannel]}
                                        style={{float: 'right', height: '32px', width: '110px', top: '-5px', marginRight: '4px'}} />
                                </div>

                                <div style={{clear: 'both'}} />

                                <div className="sub-delay-setting">
                                    <span style={{color: '#fff'}}>
                                        Audio Tracks:
                                    </span>
                                    <IconButton
                                        onClick={this._handleAudioTracksDown}
                                        iconClassName="material-icons"
                                        iconStyle={{color: '#0097a7', fontSize: '22px', float: 'right'}}>
                                        keyboard_arrow_down
                                    </IconButton>
                                    <IconButton
                                        onClick={this._handleAudioTracksUp}
                                        iconClassName="material-icons"
                                        iconStyle={{color: '#0097a7', fontSize: '22px', float: 'right'}}>
                                        keyboard_arrow_up
                                    </IconButton>
                                    <TextField
                                        disabled={true}
                                        ref="audioTrackInput"
                                        defaultValue={'Track 1'}
                                        style={{float: 'right', height: '32px', width: '110px', top: '-5px', marginRight: '4px'}} />
                                </div>

                                <div style={{clear: 'both'}} />

                                <div className="sub-delay-setting">
                                    <span style={{color: '#fff'}}>
                                        Audio Delay:
                                    </span>
                                    <IconButton
                                        onClick={this._handleAudioDelayDown}
                                        iconClassName="material-icons"
                                        iconStyle={{color: '#0097a7', fontSize: '22px', float: 'right'}}>
                                        keyboard_arrow_down
                                    </IconButton>
                                    <IconButton
                                        onClick={this._handleAudioDelayUp}
                                        iconClassName="material-icons"
                                        iconStyle={{color: '#0097a7', fontSize: '22px', float: 'right'}}>
                                        keyboard_arrow_up
                                    </IconButton>
                                    <TextField
                                        ref="audioDelayInput"
                                        defaultValue={this.state.defaultAudioDelay+' ms'}
                                        onKeyDown={this._handleAudioDelayKeys}
                                        onBlur={this._handleAudioDelayBlur}
                                        style={{float: 'right', height: '32px', width: '86px', top: '-5px', marginRight: '4px'}} />
                                </div>
                                
                                <div style={{clear: 'both'}} />

                                <div className="setting-header">
                                    Subtitles
                                </div>

                                <Toggle
                                    name="find-subs"
                                    onToggle={this.handleFindSubs}
                                    defaultToggled={this.state.findSubs}
                                    label="Find Subtitles:"
                                    style={{marginBottom: '7px'}}/>

                                <Toggle
                                    name="auto-select-subs"
                                    onToggle={this.handleAutoSub}
                                    defaultToggled={this.state.autoSub}
                                    label="Auto-select Subtitle:"
                                    style={{marginBottom: '7px'}}/>

                                <Toggle
                                    name="menu-flags"
                                    onToggle={this.handleMenuFlags}
                                    defaultToggled={this.state.menuFlags}
                                    label="Flags in Menu:"
                                    style={{marginBottom: '7px'}}/>

                                <div className="sub-delay-setting">
                                    <span style={{color: '#fff'}}>
                                        Subtitle Size:
                                    </span>
                                    <IconButton
                                        onClick={this._handleSubSizeDown}
                                        iconClassName="material-icons"
                                        iconStyle={{color: '#0097a7', fontSize: '22px', float: 'right'}}>
                                        keyboard_arrow_down
                                    </IconButton>
                                    <IconButton
                                        onClick={this._handleSubSizeUp}
                                        iconClassName="material-icons"
                                        iconStyle={{color: '#0097a7', fontSize: '22px', float: 'right'}}>
                                        keyboard_arrow_up
                                    </IconButton>
                                    <TextField
                                        ref="subSizeInput"
                                        defaultValue={this.state.customSubSize+'%'}
                                        onKeyDown={this._handleSubSizeKeys}
                                        onBlur={this._handleSubSizeBlur}
                                        style={{float: 'right', height: '32px', width: '50px', top: '-5px', marginRight: '4px'}} />
                                </div>

                                <div style={{clear: 'both'}} />

                                <div className="sub-delay-setting">
                                    <span style={{color: '#fff'}}>
                                        Subtitle Delay:
                                    </span>
                                    <IconButton
                                        onClick={this._handleSubDelayDown}
                                        iconClassName="material-icons"
                                        iconStyle={{color: '#0097a7', fontSize: '22px', float: 'right'}}>
                                        keyboard_arrow_down
                                    </IconButton>
                                    <IconButton
                                        onClick={this._handleSubDelayUp}
                                        iconClassName="material-icons"
                                        iconStyle={{color: '#0097a7', fontSize: '22px', float: 'right'}}>
                                        keyboard_arrow_up
                                    </IconButton>
                                    <TextField
                                        ref="subDelayInput"
                                        defaultValue={this.state.defaultSubDelay+' ms'}
                                        onKeyDown={this._handleSubDelayKeys}
                                        onBlur={this._handleSubDelayBlur}
                                        style={{float: 'right', height: '32px', width: '86px', top: '-5px', marginRight: '4px'}} />
                                </div>

                                <div style={{clear: 'both'}} />

                                <div className="sub-delay-setting">
                                    <span style={{color: '#fff'}}>
                                        Subtitle Color:
                                    </span>
                                    <IconButton
                                        onClick={this._handleSubColorDown}
                                        iconClassName="material-icons"
                                        iconStyle={{color: '#0097a7', fontSize: '22px', float: 'right'}}>
                                        keyboard_arrow_down
                                    </IconButton>
                                    <IconButton
                                        onClick={this._handleSubColorUp}
                                        iconClassName="material-icons"
                                        iconStyle={{color: '#0097a7', fontSize: '22px', float: 'right'}}>
                                        keyboard_arrow_up
                                    </IconButton>
                                    <TextField
                                        disabled={true}
                                        ref="subColorInput"
                                        defaultValue={this.state.subColors[this.state.subColor]}
                                        style={{float: 'right', height: '32px', width: '60px', top: '-5px', marginRight: '4px'}} />
                                </div>

                                <div style={{clear: 'both'}} />

                                <div className="sub-delay-setting">
                                    <span style={{color: '#fff'}}>
                                        Encoding:
                                    </span>
                                    <IconButton
                                        onClick={this._handleSubEncodingDown}
                                        iconClassName="material-icons"
                                        iconStyle={{color: '#0097a7', fontSize: '22px', float: 'right'}}>
                                        keyboard_arrow_down
                                    </IconButton>
                                    <IconButton
                                        onClick={this._handleSubEncodingUp}
                                        iconClassName="material-icons"
                                        iconStyle={{color: '#0097a7', fontSize: '22px', float: 'right'}}>
                                        keyboard_arrow_up
                                    </IconButton>
                                    <TextField
                                        disabled={true}
                                        ref="subEncodingInput"
                                        defaultValue={this.state.subEncodings[this.state.encoding][0]}
                                        style={{float: 'right', height: '32px', width: '280px', top: '-5px', marginRight: '4px'}} />
                                </div>
                            </div>
                        </Tab>

                        <Tab label="Torrents" style={{height: '100%'}}>
                            <div className="playlist-inner" style={{maxWidth: '700px', maxHeight: 'calc(100% - 130px)'}}>

                                <div className="setting-header">
                                    Connections
                                </div>

                                <div className="sub-delay-setting">
                                    <span style={{color: '#fff'}}>
                                        Maximum Peers:
                                    </span>
                                    <IconButton
                                        onClick={this._handlePeersDown}
                                        iconClassName="material-icons"
                                        iconStyle={{color: '#0097a7', fontSize: '22px', float: 'right'}}>
                                        keyboard_arrow_down
                                    </IconButton>
                                    <IconButton
                                        onClick={this._handlePeersUp}
                                        iconClassName="material-icons"
                                        iconStyle={{color: '#0097a7', fontSize: '22px', float: 'right'}}>
                                        keyboard_arrow_up
                                    </IconButton>
                                    <TextField
                                        ref="peerInput"
                                        defaultValue={this.state.defaultPeers+''}
                                        onKeyDown={this._handlePeersKeys}
                                        onBlur={this._handlePeersBlur}
                                        style={{float: 'right', height: '32px', width: '86px', top: '-5px', marginRight: '4px'}} />
                                </div>
                                
                                <div style={{clear: 'both'}}/>
                                
                                <div className="sub-delay-setting">
                                    <span style={{color: '#fff'}}>
                                        Peer Port:
                                    </span>
                                    <IconButton
                                        onClick={this._handlePortDown}
                                        iconClassName="material-icons"
                                        iconStyle={{color: '#0097a7', fontSize: '22px', float: 'right'}}>
                                        keyboard_arrow_down
                                    </IconButton>
                                    <IconButton
                                        onClick={this._handlePortUp}
                                        iconClassName="material-icons"
                                        iconStyle={{color: '#0097a7', fontSize: '22px', float: 'right'}}>
                                        keyboard_arrow_up
                                    </IconButton>
                                    <TextField
                                        ref="portInput"
                                        defaultValue={this.state.defaultPort+''}
                                        onKeyDown={this._handlePortKeys}
                                        onBlur={this._handlePortBlur}
                                        style={{float: 'right', height: '32px', width: '86px', top: '-5px', marginRight: '4px'}} />
                                </div>

                                <div style={{clear: 'both'}} />

                                <div className="setting-header">
                                    Downloading
                                </div>

                                <div className="sub-delay-setting">
                                    <span style={{color: '#fff'}}>
                                        Download Folder:
                                    </span>
                                    <IconButton
                                        className={'clear-button'}
                                        onClick={this._handleClearDownload}
                                        iconClassName="material-icons"
                                        iconStyle={{color: '#0097a7', fontSize: '18px', float: 'right'}}>
                                        clear
                                    </IconButton>
                                    <TextField
                                        ref="downloadInput"
                                        defaultValue={this.state.downloadFolder}
                                        onFocus={this._handleDownloadFocus}
                                        style={{float: 'right', height: '32px', width: '280px', top: '-5px', marginRight: '4px'}}
                                        inputStyle={{cursor: 'pointer'}} />
                                </div>
                                
                                <div style={{clear: 'both'}} />

                                <div className="sub-delay-setting">
                                    <span style={{color: '#fff'}}>
                                        Speed Pulsing:
                                    </span>
                                    <IconButton
                                        onClick={this._handlePulsingToggle}
                                        iconClassName="material-icons"
                                        iconStyle={{color: '#0097a7', fontSize: '22px', float: 'right'}}>
                                        keyboard_arrow_down
                                    </IconButton>
                                    <IconButton
                                        onClick={this._handlePulsingToggle}
                                        iconClassName="material-icons"
                                        iconStyle={{color: '#0097a7', fontSize: '22px', float: 'right'}}>
                                        keyboard_arrow_up
                                    </IconButton>
                                    <TextField
                                        disabled={true}
                                        ref="pulseInput"
                                        defaultValue={this.state.speedPulsing}
                                        style={{float: 'right', height: '32px', width: '110px', top: '-5px', marginRight: '4px'}} />
                                </div>

                            </div>
                        </Tab>

                    </Tabs>
                </div> 
            </div>
        );
    }

    
});