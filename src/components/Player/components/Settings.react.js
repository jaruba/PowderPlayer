import React from 'react';
import _ from 'lodash';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import MUI from 'material-ui';

const {
    RaisedButton, Toggle, Tabs, Tab, TextField, IconButton
} = MUI;
import PlayerStore from '../store';
import PlayerActions from '../actions';

import SubtitleStore from './SubtitleText/store';
import SubtitleActions from './SubtitleText/actions';
import traktUtil from '../utils/trakt';
import ModalActions from './Modal/actions';
import Register from '../../../utils/registerUtil';
import player from '../utils/player';
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
        return {
            alwaysOnTop: player.alwaysOnTop,
            clickPause: ls.isSet('clickPause') ? ls('clickPause') : true,
            playerRippleEffects: ls.isSet('playerRippleEffects') ? ls('playerRippleEffects') : true,
            playerNotifs: ls.isSet('playerNotifs') ? ls('playerNotifs') : true,
            trakt: traktUtil.loggedIn ? true : false,
            traktScrobble: ls.isSet('traktScrobble') ? ls('traktScrobble') : true,
            findSubs: ls.isSet('findSubs') ? ls('findSubs') : true,
            autoSub: ls.isSet('autoSub') ? ls('autoSub') : true,
            menuFlags: ls.isSet('menuFlags') ? ls('menuFlags') : true,
            subDelay: player.subDelay,
            speed: player.speed,
            audioChannel: player.audioChannel,
            audioTrack: player.audioTrack,
            audioDelay: player.audioDelay,
            customSubSize: ls('customSubSize'),
            zoomLevel: ls.isSet('zoomLevel') ? ls('zoomLevel') : 0,
            subColor: ls.isSet('subColor') ? ls('subColor') : 0,
            encoding: ls.isSet('selectedEncoding') ? ls('selectedEncoding') : 0,
            port: ls('peerPort'),
            peers: ls('maxPeers'),
            downloadFolder: ls('downloadFolder') ? ls('downloadFolder') : 'Temp',
            bufferSize: parseInt(ls('bufferSize') / 1000).toFixed(1),
            speedPulsing: ls('speedPulsing') ? ls('speedPulsing') : 'disabled',
            renderHidden: ls('renderHidden'),
            renderFreq: ls('renderFreq'),

            aspectRatios: ['Default','1:1','4:3','16:9','16:10','2.21:1','2.35:1','2.39:1','5:4'],
            crops: ['Default','16:10','16:9','1.85:1','2.21:1','2.35:1','2.39:1','5:3','4:3','5:4','1:1'],
            zooms: [['Default',1],['2x Double',2],['0.25x Quarter',0.25],['0.5x Half',0.5]],
            subColors: ['White', 'Yellow', 'Green', 'Cyan', 'Blue'],
            audioChannels: ['Error', 'Stereo', 'Reverse Stereo', 'Left', 'Right', 'Dolby'],
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
        }
    },
    componentWillMount() {

    },

    componentWillUnmount() {
        player.events.removeListener('settingsUpdate', this.update);
    },
    
    componentDidMount() {
        player.set({
            fields: {
                subDelay: this.refs['subDelayInput'],
                audioDelay: this.refs['audioDelayInput'],
                audioChannel: this.refs['audioChannelInput'],
                speed: this.refs['speedInput'],
                audioTrack: this.refs['audioTrackInput'],
                subSize: this.refs['subSizeInput'],
                aspect: this.refs['aspectInput'],
                crop: this.refs['cropInput'],
                zoom: this.refs['zoomInput']
            }
        });
        player.events.on('settingsUpdate', this.update);
    },

    update() {
//        console.log('settings update');
        if (this.isMounted()) {
            this.setState({
                alwaysOnTop: player.alwaysOnTop,
                clickPause: ls.isSet('clickPause') ? ls('clickPause') : true,
                playerRippleEffects: ls.isSet('playerRippleEffects') ? ls('playerRippleEffects') : true,
                trakt: traktUtil.loggedIn ? true : false,
                audioDelay: player.audioDelay,
                subDelay: player.subDelay,
                speed: player.speed,
                customSubSize: ls('customSubSize'),
                zoomLevel: ls.isSet('zoomLevel') ? ls('zoomLevel') : 0,
                bufferSize: parseInt(ls('bufferSize') / 1000).toFixed(1),
                audioChannel: player.audioChannel,
                subColor: ls.isSet('subColor') ? ls('subColor') : 0,
                audioTrack: player.audioTrack,
                encoding: ls.isSet('selectedEncoding') ? ls('selectedEncoding') : 0,
                findSubs: ls.isSet('findSubs') ? ls('findSubs') : true,
                autoSub: ls.isSet('autoSub') ? ls('autoSub') : true,
                menuFlags: ls.isSet('menuFlags') ? ls('menuFlags') : true
            });
        }
    },

    close() {
        PlayerActions.openSettings(false);
    },
    
    _openTraktLogin(event) {
        if (traktUtil.loggedIn) {
            traktUtil.logOut();
            player.notifier.info('Logout Successful', '', 4000);
            this.update();
        } else {
            ModalActions.open({
                title: 'Login to Trakt',
                type: 'TraktCode',
                theme: 'DarkRawTheme'
            });
        }
    },

    _handleAlwaysOnTop(event, toggled) {
        player.set({
            alwaysOnTop: toggled
        });
        PlayerActions.toggleAlwaysOnTop(toggled);
    },
    
    _handleToggler(event, toggled, type) {
        ls(type, toggled);
    },

    _handleClickPause(event, toggled, type) {
        ls(type, toggled);
        player.events.emit('rendererUpdate');
    },

    _handleRippleEffects(event, toggled, type) {
        ls(type, toggled);
        var playerEvents = player.events;
        playerEvents.emit('rendererUpdate');
        playerEvents.emit('controlsUpdate');
    },

    _handleSubDelay(event, direction) {
       var newValue = parseInt(this.refs['subDelayInput'].getValue()) + (direction * 50);
       this.refs['subDelayInput'].refs['input'].value = newValue + ' ms';
       if (event) {
            player.wcjs.subtitles.delay = newValue;
            player.set({
                subDelay: newValue
            });
       }
    },
    
    _handleSubDelayKeys(event) {
        if (event.keyCode == 38) {
            event.preventDefault();
            this._handleSubDelay(null, 1);
        } else if (event.keyCode == 40) {
            event.preventDefault();
            this._handleSubDelay(null, -1);
        } else if ([13, 27].indexOf(event.keyCode) > -1) {
            event.preventDefault();
            this.refs['subDelayInput'].blur();
        }
    },
    
    _handleSubDelayBlur(event) {
        var newValue = parseInt(this.refs['subDelayInput'].getValue());
        if (isNaN(newValue))
            newValue = 0;

        this.refs['subDelayInput'].refs['input'].value = newValue + ' ms';
        player.wcjs.subtitles.delay = newValue;
        player.set({
            subDelay: newValue
        });
    },

    _handleAudioDelay(event, direction) {
        var newValue = parseInt(this.refs['audioDelayInput'].getValue()) + (direction * 50);
        this.refs['audioDelayInput'].refs['input'].value = newValue + ' ms';
        player.set({
            audioDelay: newValue
        });
        player.wcjs.audio.delay = newValue;
    },
    
    _handleAudioDelayKeys(event) {
        if (event.keyCode == 38) {
            event.preventDefault();
            this._handleAudioDelay(null, 1);
        } else if (event.keyCode == 40) {
            event.preventDefault();
            this._handleAudioDelay(null, -1);
        } else if ([13, 27].indexOf(event.keyCode) > -1) {
            event.preventDefault();
            this.refs['audioDelayInput'].blur();
        }
    },
    
    _handleAudioDelayBlur(event) {
        var newValue = parseInt(this.refs['audioDelayInput'].getValue());
        if (isNaN(newValue))
            newValue = 0;

        this.refs['audioDelayInput'].refs['input'].value = newValue + ' ms';
        player.set({
            audioDelay: newValue
        });
        player.wcjs.audio.delay = newValue;
    },
    
    _handleSpeed(event, direction) {

        var newRate = 0,
            wcjs = player.wcjs,
            curRate = parseFloat(wcjs.input.rate);
        
        if (direction < 0) {
            if (curRate >= 0.25 && curRate <= 0.5) newRate = 0.125;
            else if (curRate > 0.5 && curRate <= 1) newRate = 0.25;
            else if (curRate > 1 && curRate <= 2) newRate = 0.5;
            else if (curRate > 2 && curRate <= 4) newRate = 1;
            else if (curRate > 4) newRate = curRate /2;
    
            var logic = ((curRate + newRate) >= 0.125);
        } else {
            if (curRate < 0.25) newRate = 0.125;
            else if (curRate >= 0.25 && curRate < 0.5) newRate = 0.125;
            else if (curRate >= 0.5 && curRate < 1) newRate = 0.25;
            else if (curRate >= 1 && curRate < 2) newRate = 0.5;
            else if (curRate >= 2 && curRate < 4) newRate = 1;
            else if (curRate >= 4) newRate = curRate;
            var logic = ((curRate + newRate) < 100);
        }

        if (logic) {
            var newValue = curRate + (newRate * direction);
            wcjs.input.rate = newValue;
            player.set({
                speed: newValue
            });
            newValue = parseFloat(Math.round(newValue * 100) / 100).toFixed(2);
            this.refs['speedInput'].refs['input'].value = newValue + 'x';
        }
    },
    
    _handleSpeedKeys(event) {
        if (event.keyCode == 38) {
            event.preventDefault();
            this._handleSpeed(null, 1);
        } else if (event.keyCode == 40) {
            event.preventDefault();
            this._handleSpeed(null, -1);
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

        this.refs['speedInput'].refs['input'].value = newValue + 'x';
        player.wcjs.input.rate = newValue;
    },
    
    _handleSubSize(event, direction) {
        var newValue = parseInt(this.refs['subSizeInput'].getValue()) + (direction * 5);
        if (newValue < 5)
            newValue = 5;
        else if (newValue > 400)
            newValue = 400;
        this.refs['subSizeInput'].refs['input'].value = newValue + '%';
        if (event) {
            ls('customSubSize', newValue);
            player.events.emit('subtitleUpdate');
        }
    },
    
    _handleSubSizeKeys(event) {
        if (event.keyCode == 38) {
            event.preventDefault();
            this._handleSubSize(null, 1);
        } else if (event.keyCode == 40) {
            event.preventDefault();
            this._handleSubSize(null, -1);
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

        this.refs['subSizeInput'].refs['input'].value = newValue + '%';
        
        if (event) {
            ls('customSubSize', newValue);
            player.events.emit('subtitleUpdate');
        }
    },

    _handleZoomLevel(event, direction) {
        var newValue = parseFloat(this.refs['zoomLevelInput'].getValue()) + (direction / 2);
        this.refs['zoomLevelInput'].refs['input'].value = newValue;
        ls('zoomLevel', newValue);
        webFrame.setZoomLevel(newValue);
    },
    
    _handleAudioChannel(event, direction) {
        var newChannel = parseInt(player.audioChannel) + direction;
        if (newChannel == 0)
            newChannel = this.state.audioChannels.length - 1;
        if (newChannel == this.state.audioChannels.length)
            newChannel = 1;
        player.wcjs.audio.channel = newChannel;
        player.set({
            audioChannel: newChannel
        });
        this.refs['audioChannelInput'].refs['input'].value = this.state.audioChannels[newChannel];
    },
    
    _handleSubColor(event, direction) {
        if (!ls.isSet('subColor')) ls('subColor', 0);
        var newColor = ls('subColor') + direction;

        if (newColor == -1)
            newColor = this.state.subColors.length -1;

        if (newColor == this.state.subColors.length)
            newColor = 0;

        ls('subColor', newColor);
        player.events.emit('subtitleUpdate');
        this.refs['subColorInput'].refs['input'].value = this.state.subColors[newColor];
    },
    
    _handleAudioTrack(event, direction) {
        var newTrack = parseInt(player.audioTrack) + direction;
        var wcjs = player.wcjs;
        
        if (newTrack == -1)
            newTrack = wcjs.audio.count -1;

        if (newTrack == wcjs.audio.count)
            newTrack = 0;

        wcjs.audio.track = newTrack;
        
        player.set({
            audioTrack: newTrack
        });
        this.refs['audioTrackInput'].refs['input'].value = wcjs.audio[newTrack];
    },
    
    _handleSubEncoding(event, direction) {
        if (!ls.isSet('selectedEncoding')) ls('selectedEncoding', 0);
        var newEncoding = ls('selectedEncoding') + direction;

        if (newEncoding == -1)
            newEncoding = this.state.subEncodings.length -1;
        if (newEncoding == this.state.subEncodings.length)
            newEncoding = 0;

        ls('selectedEncoding', newEncoding);
        ls('subEncoding', this.state.subEncodings[newEncoding][1]);
        
        this.refs['subEncodingInput'].refs['input'].value = this.state.subEncodings[newEncoding][0];
    },
    
    _handlePort(event, direction) {
        var newValue = parseInt(this.refs['portInput'].getValue()) + direction;
        if (newValue < 1)
            newValue = 1;
        if (newValue > 65535)
            newValue = 65535;
        
        this.refs['portInput'].refs['input'].value = newValue;
        if (event)
            ls('peerPort', newValue);
    },
    
    _handlePortKeys(event) {
        if (event.keyCode == 38) {
            event.preventDefault();
            this._handlePort(null, 1);
        } else if (event.keyCode == 40) {
            event.preventDefault();
            this._handlePort(null, -1);
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

        this.refs['portInput'].refs['input'].value = newValue;
        ls('peerPort', newValue);
    },
    
    _handlePeers(event, direction) {
        var newValue = parseInt(this.refs['peersInput'].getValue()) + direction;
        if (newValue < 1)
            newValue = 1;
        if (newValue > 100000)
            newValue = 100000;
        this.refs['peersInput'].refs['input'].value = newValue;
        if (event)
            ls('maxPeers', newValue);
    },
    
    _handlePeersKeys(event) {
        if (event.keyCode == 38) {
            event.preventDefault();
            this._handlePeers(null, 1);
        } else if (event.keyCode == 40) {
            event.preventDefault();
            this._handlePeers(null, -1);
        } else if ([13, 27].indexOf(event.keyCode) > -1) {
            event.preventDefault();
            this.refs['peersInput'].blur();
        }
    },
    
    _handlePeersBlur(event) {
        var newValue = parseInt(this.refs['peersInput'].getValue());
        if (isNaN(newValue) || newValue < 1)
            newValue = 1;
        if (newValue > 100000)
            newValue = 100000;

        this.refs['peersInput'].refs['input'].value = newValue;
        ls('maxPeers', newValue);
    },

    _handleBufferSize(event, direction) {
        var newValue = (parseFloat(this.refs['bufferSizeInput'].getValue()) * 1000) + (direction * 500);
        if (newValue < 0)
            newValue = 0;
        if (newValue > 60000)
            newValue = 60000;
        this.refs['bufferSizeInput'].refs['input'].value = (newValue/1000).toFixed(1) + ' sec';
        if (event)
            ls('bufferSize', newValue);
    },

    _handleBufferSizeKeys(event) {
        if (event.keyCode == 38) {
            event.preventDefault();
            this._handleBufferSize(null, 1);
        } else if (event.keyCode == 40) {
            event.preventDefault();
            this._handleBufferSize(null, -1);
        } else if ([13, 27].indexOf(event.keyCode) > -1) {
            event.preventDefault();
            this.refs['bufferSizeInput'].blur();
        }
    },

    _handleBufferSizeBlur(event) {
        var newValue = parseFloat(this.refs['bufferSizeInput'].getValue()) * 1000;
        if (isNaN(newValue) || newValue < 0)
            newValue = 0;
        if (newValue > 60000)
            newValue = 60000;

        this.refs['bufferSizeInput'].refs['input'].value = (newValue/1000).toFixed(1) + ' sec';
        ls('bufferSize', newValue);
    },

    _handleClearDownload(event) {
        ls.remove('downloadFolder');
        this.refs['downloadInput'].refs['input'].value = 'Temp';
    },

    _handleDownloadFocus(event) {
        this.refs['downloadInput'].blur();
        dialog.showOpenDialog({
            title: 'Select folder',
            properties: ['openDirectory', 'createDirectory']
        }, (folder) => {
            if (folder && folder.length) {
                ls('downloadFolder', folder[0]);
                this.refs['downloadInput'].refs['input'].value = folder[0];
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
        this.refs['pulseInput'].refs['input'].value = newValue;
    },
    
    _videoField(field, value) {
        this.refs[field + 'Input'].refs['input'].value = value;
        var obj = {
            aspect: true,
            crop: true,
            zoom: true
        };
        obj[field] = false;
        _.each(obj, (el, ij) => {
            if (el)
                this.refs[ij + 'Input'].refs['input'].value = 'Default';
        });
    },

    _handleAspect(event, direction) {

        var aspectRatio = player.aspect;
        var aspectRatios = this.state.aspectRatios;

        aspectRatios.some((el, ij) => {
            if (el == aspectRatio) {
                
                var newValue;
                
                if (direction < 0)
                    newValue = ij - 1 < 0 ? aspectRatios.length - 1 : ij - 1;
                else
                    newValue = aspectRatios.length == ij + 1 ? 0 : ij + 1;

                this._videoField('aspect', aspectRatios[newValue]);

                player.events.emit('resizeNow', {
                    aspect: aspectRatios[newValue],
                    crop: 'Default',
                    zoom: 1
                });

                return true;
            } else return false;
        });
    },

    _handleCrop(event, direction) {

        var crop = player.crop;
        var crops = this.state.crops;

        crops.some((el, ij) => {
            if (el == crop) {

                var newValue;

                if (direction < 0)
                    newValue = ij - 1 < 0 ? crops.length - 1 : ij - 1;
                else
                    newValue = crops.length == ij + 1 ? 0 : ij + 1;

                this._videoField('crop', crops[newValue]);

                player.events.emit('resizeNow', {
                    crop: crops[newValue],
                    aspect: 'Default',
                    zoom: 1
                });

                return true;
            } else return false;
        });
    },

    _handleZoom(event, direction) {

        var zoom = player.zoom;
        var zooms = this.state.zooms;

        zooms.some((el, ij) => {
            if (el[1] == zoom) {

                if (direction < 0)
                    var newValue = ij - 1 < 0 ? zooms.length - 1 : ij - 1;
                else
                    var newValue = zooms.length == ij + 1 ? 0 : ij + 1;

                this._videoField('zoom', zooms[newValue][0]);
                player.events.emit('resizeNow', {
                    zoom: zooms[newValue][1],
                    crop: 'Default',
                    aspect: 'Default'
                });

                return true;
            } else return false;

        });
    },

    _handleRenderFreq(direction) {
        var newFreq = parseInt(this.refs['renderFreqInput'].refs['input'].value);

        if (direction < 0)
            newFreq = newFreq - 50;
        else
            newFreq = newFreq + 50;

        if (newFreq < 0) newFreq = 0;
        
        ls('renderFreq', newFreq);
        this.refs['renderFreqInput'].refs['input'].value = newFreq + 'ms';
    },
    
    _handleRenderFreqKeys(event) {
        if (event.keyCode == 38) {
            event.preventDefault();
            this._handleRenderFreq(1);
        } else if (event.keyCode == 40) {
            event.preventDefault();
            this._handleRenderFreq(-1);
        } else if ([13, 27].indexOf(event.keyCode) > -1) {
            event.preventDefault();
            this.refs['renderFreqInput'].blur();
        }
    },
    
    _handleRenderFreqBlur(event) {
        var newValue = parseInt(this.refs['renderFreqInput'].getValue());
        if (newValue < 0)
            newValue = 0;

        ls('renderFreq', newValue);
        this.refs['renderFreqInput'].refs['input'].value = newValue + 'ms';
    },
    
    render() {

        var renderObj = {

            'General': [{
                type: 'header',
                label: 'Interface'
            }, {
                type: 'toggle',
                title: 'Always on Top',
                tag: 'alwaysOnTop',
                func: 'AlwaysOnTop'
            }, {
                type: 'toggle',
                title: 'Click to Pause',
                tag: 'clickPause',
                func: 'ClickPause'
            }, {
                type: 'toggle',
                title: 'Player Ripple Effects',
                tag: 'playerRippleEffects',
                func: 'RippleEffects'
            }, {
                type: 'toggle',
                title: 'Notifications',
                tag: 'playerNotifs'
            }, {
                type: 'select',
                title: 'Zoom Level',
                tag: 'zoomLevel',
                default: this.state.zoomLevel + '',
                disabled: true,
                width: '30px'
            }, {
                type: 'header',
                label: 'Performance'
            }, {
                type: 'toggle',
                title: 'Render when UI Hidden',
                tag: 'renderHidden'
            }, {
                type: 'select',
                title: 'Render Frequency',
                tag: 'renderFreq',
                default: this.state.renderFreq + 'ms',
                width: '80px'
            }, {
                type: 'header',
                label: 'Playback'
            }, {
                type: 'select',
                title: 'Speed',
                tag: 'speed',
                default: parseFloat(Math.round(this.state.speed * 100) / 100).toFixed(2) + 'x',
                width: '60px'
            }, {
                type: 'select',
                title: 'Buffer Size',
                tag: 'bufferSize',
                default: this.state.bufferSize+' sec',
                width: '60px'
            }, {
                type: 'header',
                label: 'Video'
            }, {
                type: 'select',
                title: 'Aspect Ratio',
                tag: 'aspect',
                default: player.aspect,
                width: '60px',
                disabled: true
            }, {
                type: 'select',
                title: 'Crop',
                tag: 'crop',
                default: player.crop,
                width: '60px',
                disabled: true
            }, {
                type: 'select',
                title: 'Zoom',
                tag: 'zoom',
                default: 'Default',
                width: '90px',
                disabled: true
            }, {
                type: 'header',
                label: 'Associations'
            }, {
                type: 'button',
                title: 'Magnet Links',
                func: Register.magnet
            }, {
                type: 'button',
                title: 'Video Files',
                func: Register.videos
            }, {
                type: 'button',
                title: 'Torrent Files',
                func: Register.torrent
            }, {
                type: 'clear'
            }, {
                type: 'header',
                label: 'Trakt'
            }, {
                type: 'traktSettings'
            }],


            'Audio / Subs': [{
                type: 'header',
                label: 'Audio'
            }, {
                type: 'select',
                title: 'Audio Channel',
                tag: 'audioChannel',
                disabled: true,
                width: '110px',
                default: this.state.audioChannels[this.state.audioChannel]
            }, {
                type: 'select',
                title: 'Audio Tracks',
                tag: 'audioTrack',
                disabled: true,
                width: '160px',
                default: 'Track 1'
            }, {
                type: 'select',
                title: 'Audio Delay',
                tag: 'audioDelay',
                width: '86px',
                default: this.state.audioDelay + ' ms'
            }, {
                type: 'header',
                label: 'Subtitles'
            }, {
                type: 'toggle',
                title: 'Find Subtitles',
                tag: 'findSubs'
            }, {
                type: 'toggle',
                title: 'Auto-select Subtitle',
                tag: 'autoSub'
            }, {
                type: 'toggle',
                title: 'Flags in Menu',
                tag: 'menuFlags'
            }, {
                type: 'select',
                title: 'Subtitle Size',
                tag: 'subSize',
                width: '50px',
                default: this.state.customSubSize + '%'
            }, {
                type: 'select',
                title: 'Subtitle Delay',
                tag: 'subDelay',
                width: '86px',
                default: this.state.subDelay + ' ms'
            }, {
                type: 'select',
                title: 'Subtitle Color',
                tag: 'subColor',
                width: '60px',
                disabled: true,
                default: this.state.subColors[this.state.subColor]
            }, {
                type: 'select',
                title: 'Encoding',
                tag: 'subEncoding',
                width: '280px',
                disabled: true,
                default: this.state.subEncodings[this.state.encoding][0]
            }],


            'Torrents': [{
                type: 'header',
                label: 'Connections'
            }, {
                type: 'select',
                title: 'Maximum Peers',
                tag: 'peers',
                width: '86px',
                default: this.state.peers+''
            }, {
                type: 'select',
                title: 'Peer Port',
                tag: 'port',
                width: '86px',
                default: this.state.port
            }, {
                type: 'header',
                label: 'Downloading'
            }, {
                type: 'selectFolder',
                title: 'Download Folder',
                tag: 'download',
                default: this.state.downloadFolder,
                width: '280px'
            }, {
                type: 'select',
                title: 'Speed Pulsing',
                func: 'PulsingToggle',
                tag: 'pulse',
                width: '110px',
                default: this.state.speedPulsing,
                disabled: true
            }]
        };
        
        var indents = {
            'General': [],
            'Audio / Subs': [],
            'Torrents': []
        };
        
        var klm = 1000;
        var renderSettings = [];
        
        _.each(indents, (el, ij) => {
            renderObj[ij].forEach(el => {
                
                klm++;
                
                if (el.type == 'header') {
            
                    indents[ij].push(
                        <div className="setting-header" key={klm}>
                            {el.label}
                        </div>
                    );

                } else if (el.type == 'toggle') {

                    if (!el.func) el.func = 'Toggler';

                    indents[ij].push(
                        <Toggle
                            key={klm}
                            name={el.tag}
                            onToggle={(event, toggled) => this['_handle' + el.func](event, toggled, el.tag)}
                            defaultToggled={this.state[el.tag]}
                            label={el.title + ":"}
                            style={{marginBottom: '7px'}} />
                    );

                } else if (el.type == 'select') {

                    if (!el.func) el.func = el.tag.charAt(0).toUpperCase() + el.tag.slice(1);

                    if (el.disabled)

                        var newTextField = (
                            <TextField
                                disabled={true}
                                ref={el.tag + 'Input'}
                                defaultValue={el.default}
                                style={{float: 'right', height: '32px', width: el.width, top: '-5px', marginRight: '4px'}} />
                        );

                    else

                        var newTextField = (
                            <TextField
                                onKeyDown={this['_handle' + el.func + 'Keys']}
                                onBlur={this['_handle' + el.func + 'Blur']}
                                ref={el.tag + 'Input'}
                                defaultValue={el.default}
                                onChange={this.onChangeFunction}
                                style={{float: 'right', height: '32px', width: el.width, top: '-5px', marginRight: '4px'}} />
                        );

                    indents[ij].push(
                        <div key={klm}>
                            <div className="sub-delay-setting">
                                <span style={{color: '#fff'}}>
                                    {el.title + ':'}
                                </span>
                                <IconButton
                                    onClick={(event) => this['_handle' + el.func](event, -1)}
                                    iconClassName="material-icons"
                                    iconStyle={{color: '#0097a7', fontSize: '22px', float: 'right'}}>
                                    keyboard_arrow_down
                                </IconButton>
                                <IconButton
                                    onClick={(event) => this['_handle' + el.func](event, 1)}
                                    iconClassName="material-icons"
                                    iconStyle={{color: '#0097a7', fontSize: '22px', float: 'right'}}>
                                    keyboard_arrow_up
                                </IconButton>
                                {newTextField}
                            </div>
                            <div style={{clear: 'both'}} />
                        </div>
                    );

                } else if (el.type == 'selectFolder') {

                    if (!el.func) el.func = el.tag.charAt(0).toUpperCase() + el.tag.slice(1);

                    indents[ij].push(
                        <div key={klm}>
                            <div className="sub-delay-setting">
                                <span style={{color: '#fff'}}>
                                    {el.title + ':'}
                                </span>
                                <IconButton
                                    className={'clear-button'}
                                    onClick={this['_handleClear' + el.func]}
                                    iconClassName="material-icons"
                                    iconStyle={{color: '#0097a7', fontSize: '18px', float: 'right'}}>
                                    clear
                                </IconButton>
                                <TextField
                                    ref={el.tag + 'Input'}
                                    defaultValue={el.default}
                                    onFocus={this['_handle' + el.func + 'Focus']}
                                    style={{float: 'right', height: '32px', width: el.width, top: '-5px', marginRight: '4px'}}
                                    inputStyle={{cursor: 'pointer'}} />
                            </div>
                            <div style={{clear: 'both'}} />
                        </div>
                    );

                } else if (el.type == 'button') {
                    
                    indents[ij].push(
                        <RaisedButton
                            key={klm}
                            style={{marginBottom: '15px', marginRight: '11px', float: 'left'}}
                            className='long-buttons'
                            onClick={el.func}
                            label={el.title} />
                    );

                } else if (el.type == 'clear') {
                    
                    indents[ij].push(<div key={klm} style={{clear: 'both'}} />);
                    
                } else if (el.type == 'traktSettings') {

                    indents[ij].push(
                        <div key={klm}>
                            <Toggle
                                name="trakt-scrobble"
                                onToggle={(event, toggled) => ls('traktScrobble', toggled)}
                                defaultToggled={this.state.traktScrobble}
                                style={{ 'display': (this.state.trakt ? 'block' : 'none') }}
                                label="Trakt Scrobble:"
                                style={{marginBottom: '7px'}} />
                            <RaisedButton className='long-buttons' onClick={this._openTraktLogin} label={ this.state.trakt ? 'Trakt Logout' : 'Trakt Login' } />
                        </div>
                    );

                }
            })
            
            renderSettings.push(
                <Tab key={klm + 1000} label={ij} style={{height: '100%'}}>
                    <div className="playlist-inner" style={{maxWidth: '700px', maxHeight: 'calc(100% - 130px)'}}>
                        {indents[ij]}
                    </div>
                </Tab>
            );
        })

        return (
            <Tabs style={{width: '70vw', maxWidth: '700px', marginTop: '11%', marginLeft: 'auto', marginRight: 'auto', height: '100%'}}>
                {renderSettings}
            </Tabs>
        );
    }

});
