import React from 'react';
import _ from 'lodash';
import plugins from '../../../utils/plugins';
import async from 'async';
import MetaInspector from 'node-metainspector';
import ls from 'local-storage';
import ModalActions from '../../Modal/actions';
import player from '../../Player/utils/player';
import PlayerActions from '../../Player/actions';
import Register from '../../../utils/registerUtil';

import {
    dialog
} from 'remote';

var skipScroll;

export
default React.createClass({

    getInitialState() {
        return {
            open: true,
            selected: false,
            mediaQualities: ['360p', '480p', '720p', '1080p (Slow)', 'Best (Slow)'],
            ytdlQuality: ls.isSet('ytdlQuality') ? ls('ytdlQuality') : 2,
            adultContent: ls.isSet('adultContent') ? ls('adultContent') : false,
            torrentContent: ls.isSet('torrentContent') ? ls('torrentContent') : true,
            clickPause: ls.isSet('clickPause') ? ls('clickPause') : true,
            playerRippleEffects: ls.isSet('playerRippleEffects') ? ls('playerRippleEffects') : true,
            playerNotifs: ls.isSet('playerNotifs') ? ls('playerNotifs') : true,
            traktScrobble: ls.isSet('traktScrobble') ? ls('traktScrobble') : true,
            findSubs: ls.isSet('findSubs') ? ls('findSubs') : true,
            askFiles: ls.isSet('askFiles') ? ls('askFiles') : false,
            autoSub: ls.isSet('autoSub') ? ls('autoSub') : true,
            subLimit: ls('subLimit'),
            menuFlags: ls.isSet('menuFlags') ? ls('menuFlags') : true,
            customSubSize: ls('customSubSize'),
            zoomLevel: ls.isSet('zoomLevel') ? ls('zoomLevel') : 0,
            subColor: ls.isSet('subColor') ? ls('subColor') : 0,
            encoding: ls.isSet('selectedEncoding') ? ls('selectedEncoding') : 0,
            resizeOnPlaylist: ls.isSet('resizeOnPlaylist') ? ls('resizeOnPlaylist') : true,
            startFullscreen: ls.isSet('startFullscreen') ? ls.isSet('startFullscreen') : false,
            hotkeyJumpSec: ls.isSet('hotkeyJumpSec') ? ls('hotkeyJumpSec') : 20,
            cacheFolder: ls('cacheFolder') ? ls('cacheFolder') : 'Temp',
            dlnaFinder: ls('dlnaFinder'),
            dlnaFinders: ['ssdp-js', 'node-ssdp', 'renderer-finder'],
            port: ls('peerPort'),
            peers: ls('maxPeers'),
            downloadFolder: ls('downloadFolder') ? ls('downloadFolder') : 'Temp',
            bufferSize: parseInt(ls('bufferSize') / 1000).toFixed(1),
            speedPulsing: ls('speedPulsing') ? ls('speedPulsing') : 'disabled',
            speedLimit: ls('speedLimit') ? ls('speedLimit') : 0,
            renderHidden: ls('renderHidden'),
            renderFreq: ls('renderFreq'),
            removeLogic: ls('removeLogic') == 0 ? 'Always Ask' : ls('removeLogic') == 1 ? 'Always Remove' : 'Always Keep',
            downloadAll: ls.isSet('downloadAll') ? ls('downloadAll') : false,
            forceDownload: ls.isSet('forceDownload') ? ls('forceDownload') : false,
            downloadType: ls('downloadType') == 0 ? 'Player' : 'Dashboard',
            playerType: ls('playerType'),
            playerCmdArgs: ls('playerCmdArgs'),
            torrentTrackers: ls.isSet('torrentTrackers') ? ls('torrentTrackers') : [],
            peerID: ls('peerID'),
            fastResume: ls.isSet('fastResume') ? ls('fastResume') : true,

            aspectRatios: ['Default','1:1','4:3','16:9','16:10','2.21:1','2.35:1','2.39:1','5:4'],
            crops: ['Default','16:10','16:9','1.85:1','2.21:1','2.35:1','2.39:1','5:3','4:3','5:4','1:1'],
            zooms: [['Default',1],['2x Double',2],['0.25x Quarter',0.25],['0.5x Half',0.5]],
            subColors: ['White', 'Yellow', 'Green', 'Cyan', 'Blue'],
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
            doHistory: ls('doHistory')
        }
    },
    
    decideUpdate(results) {
        if (results) {
            this.setSearch(results);
        } else if (this.state.selected && this.state.selected.label == 'Installed') {
            skipScroll = true;
            this.setSelected(this.state.selected);
        }
    },
    
    componentWillMount() {
        plugins.events.on('pluginListUpdate', this.decideUpdate);
    },

    componentWillUnmount() {
        plugins.events.removeListener('pluginListUpdate', this.decideUpdate);
    },
    componentDidUpdate() {
        if (!skipScroll) {
            var pluginListEl = document.querySelector('.plugin-list');
            if (pluginListEl) pluginListEl.scrollTop = 0;
        } else skipScroll = false;
    },
    componentDidMount() {
        // add event listeners for togglers
        var that = this;
        [].forEach.call(document.querySelectorAll('.mainTogglers'), el => {
            el.addEventListener("change", (event) => {
                var id = event.path[0].id;
                var funcName = document.querySelector('#' + id).getAttribute('funcName');
                var toggled = document.querySelector('#' + id).checked;
                that['_handle' + funcName](event, toggled, id);
            });
        });
    },
    
    update() {
        if (this.isMounted()) {
            this.setState({
                clickPause: ls.isSet('clickPause') ? ls('clickPause') : true,
                playerRippleEffects: ls.isSet('playerRippleEffects') ? ls('playerRippleEffects') : true,
                customSubSize: ls('customSubSize'),
                zoomLevel: ls.isSet('zoomLevel') ? ls('zoomLevel') : 0,
                bufferSize: parseInt(ls('bufferSize') / 1000).toFixed(1),
                subColor: ls.isSet('subColor') ? ls('subColor') : 0,
                encoding: ls.isSet('selectedEncoding') ? ls('selectedEncoding') : 0,
                findSubs: ls.isSet('findSubs') ? ls('findSubs') : true,
                askFiles: ls.isSet('askFiles') ? ls('askFiles') : false,
                autoSub: ls.isSet('autoSub') ? ls('autoSub') : true,
                subLimit: ls('subLimit'),
                menuFlags: ls.isSet('menuFlags') ? ls('menuFlags') : true,
                removeLogic: ls('removeLogic') == 0 ? 'Always Ask' : ls('removeLogic') == 1 ? 'Always Remove' : 'Always Keep',
                downloadType: ls('downloadType') == 0 ? 'Player' : 'Dashboard',
                resizeOnPlaylist: ls.isSet('resizeOnPlaylist') ? ls('resizeOnPlaylist') : true,
                startFullscreen: ls.isSet('startFullscreen') ? ls.isSet('startFullscreen') : false,
                playerType: ls('playerType'),
                playerCmdArgs: ls('playerCmdArgs'),
                peerID: ls('peerID'),
                fastResume: ls.isSet('fastResume') ? ls('fastResume') : true,
            });
        }
    },

    blank() {},

    _handleToggler(event, toggled, type) {
        ls(type, toggled);
    },

    _handleClickPause(event, toggled, type) {
        ls(type, toggled);
    },

    _handleFastResume(event, toggled, type) {
        ls(type, toggled);
    },

    _handleRippleEffects(event, toggled, type) {
        ls(type, toggled);
    },

    _handleDlnaFinder(event, direction) {

        var newValue = this.state.dlnaFinders.indexOf(this.refs['dlnaFinderInput'].value);

        if (direction < 0)
            newValue--;
        else
            newValue++;

        if (newValue < 0)
            newValue = 0;
            
        if (newValue > 2)
            newValue = 2;

        ls('dlnaFinder', newValue);
        this.refs['dlnaFinderInput'].value = this.state.dlnaFinders[newValue];
    },
    
    _handleSubSize(event, direction) {
        var newValue = parseInt(this.refs['subSizeInput'].value) + (direction * 5);
        if (newValue < 5)
            newValue = 5;
        else if (newValue > 400)
            newValue = 400;
        this.refs['subSizeInput'].value = newValue + '%';
        if (event) {
            ls('customSubSize', newValue);
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
            this.refs['subSizeInput'].$.input.blur();
        }
    },
    
    _handleSubSizeBlur(event) {
        var newValue = parseInt(this.refs['subSizeInput'].value);
        if (isNaN(newValue))
            newValue = 5;
            
        if (newValue < 5)
            newValue = 5;
        else if (newValue > 400)
            newValue = 400;

        this.refs['subSizeInput'].value = newValue + '%';
        
        if (event) {
            ls('customSubSize', newValue);
            player.events.emit('subtitleUpdate');
        }
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
        this.refs['subColorInput'].value = this.state.subColors[newColor];
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
        
        this.refs['subEncodingInput'].value = this.state.subEncodings[newEncoding][0];
    },

    _handleSubLimit(event, direction) {
        if (direction == -1) {
            if (ls('subLimit') == 0) ls('subLimit', ls('subLimits').length -1)
            else ls('subLimit', ls('subLimit') -1)
        } else {
            if (ls('subLimit') == ls('subLimits').length -1) ls('subLimit', 0)
            else ls('subLimit', ls('subLimit') +1)
        }

        this.refs['subLimitInput'].value = ls('subLimits')[ls('subLimit')]
    },

    _handlePort(event, direction) {
        var newValue = parseInt(this.refs['portInput'].value) + direction;
        if (newValue < 0)
            newValue = 0;
        if (newValue > 65535)
            newValue = 65535;
        
        this.refs['portInput'].value = newValue;
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
            this.refs['portInput'].$.input.blur();
        }
    },
    
    _handlePortBlur(event) {
        var newValue = parseInt(this.refs['portInput'].value);
        if (isNaN(newValue) || newValue < 0)
            newValue = 0;
        if (newValue > 65535)
            newValue = 65535;

        this.refs['portInput'].value = newValue;
        ls('peerPort', newValue);
    },
    
    _handlePeers(event, direction) {
        var newValue = parseInt(this.refs['peersInput'].value) + direction;
        if (newValue < 1)
            newValue = 1;
        if (newValue > 100000)
            newValue = 100000;
        this.refs['peersInput'].value = newValue;
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
            this.refs['peersInput'].$.input.blur();
        }
    },
    
    _handlePeersBlur(event) {
        var newValue = parseInt(this.refs['peersInput'].value);
        if (isNaN(newValue) || newValue < 1)
            newValue = 1;
        if (newValue > 100000)
            newValue = 100000;

        this.refs['peersInput'].value = newValue;
        ls('maxPeers', newValue);
    },

    _handleBufferSize(event, direction) {
        var newValue = (parseFloat(this.refs['bufferSizeInput'].value) * 1000) + (direction * 500);
        if (newValue < 0)
            newValue = 0;
        if (newValue > 60000)
            newValue = 60000;
        this.refs['bufferSizeInput'].value = (newValue/1000).toFixed(1) + ' sec';
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
            this.refs['bufferSizeInput'].$.input.blur();
        }
    },

    _handleBufferSizeBlur(event) {
        var newValue = parseFloat(this.refs['bufferSizeInput'].value) * 1000;
        if (isNaN(newValue) || newValue < 0)
            newValue = 0;
        if (newValue > 60000)
            newValue = 60000;

        this.refs['bufferSizeInput'].value = (newValue/1000).toFixed(1) + ' sec';
        ls('bufferSize', newValue);
    },


    _handleClearCacheFolder(event) {
        ls.remove('cacheFolder');
        this.refs['cacheFolderInput'].value = 'Temp';
    },
    
    _handleClearPlayerType(event) {
        ls.remove('playerType');
        this.refs['playerTypeInput'].value = 'Choose Player';
    },

    _handleCacheFolderFocus(event) {
        event.preventDefault();
        this.refs['cacheFolderInput'].$.input.blur();
        dialog.showOpenDialog({
            title: 'Select folder',
            properties: ['openDirectory', 'createDirectory']
        }, (folder) => {
            if (folder && folder.length) {
                ls('cacheFolder', folder[0]);
                this.refs['cacheFolderInput'].value = folder[0];
            }
        });
    },

    _handlePlayerTypeFocus(event) {
        event.preventDefault();
        this.refs['playerTypeInput'].$.input.blur();
        dialog.showOpenDialog({
            title: 'Select player',
            properties: ['openFile']
        }, (file) => {
            if (file && file.length) {
                ls('playerType', file[0]);
                this.refs['playerTypeInput'].value = file[0];
            }
        });
    },

    _handleClearDownload(event) {
        ls.remove('downloadFolder');
        this.refs['downloadInput'].value = 'Temp';
    },

    _handleDownloadFocus(event) {
        event.preventDefault();
        this.refs['downloadInput'].$.input.blur();
        dialog.showOpenDialog({
            title: 'Select folder',
            properties: ['openDirectory', 'createDirectory']
        }, (folder) => {
            if (folder && folder.length) {
                ls('downloadFolder', folder[0]);
                this.refs['downloadInput'].value = folder[0];
            }
        });
    },

    _handleClearTorrentTrackers(event) {
        ls.remove('torrentTrackers');
        this.refs['torrentTrackersInput'].value = '';
    },

    _handleTorrentTrackersBlur(event) {
        this.refs['torrentTrackersInput'].value = this.refs['torrentTrackersInput'].value.split(';').map(function(el) { return el.trim() }).join(';')
        ls('torrentTrackers', this.refs['torrentTrackersInput'].value.split(';'))
    },

    _handleTorrentTrackersKeys(event) {
        if ([13, 27].indexOf(event.keyCode) > -1) {
            event.preventDefault();
            this.refs['torrentTrackersInput'].$.input.blur();
        }
    },

    _handleClearPeerID(event) {
        ls('peerID', 'PP0110');
        this.refs['peerIDInput'].value = ls('peerID');
    },

    _handlePeerIDBlur(event) {
        var letters = this.refs['peerIDInput'].value.replace(/[^a-zA-Z]+/g, '')
        var numbers = this.refs['peerIDInput'].value.replace(/[^0-9]+/g, '')
        if (letters.length < 2) {
            if (letters.length == 1) letters += 'A'
            else letters = 'AA'
        }
        if (numbers.length < 4) {
            if (numbers.length == 3) numbers += '0'
            else if (numbers.length == 2) numbers += '00'
            else if (numbers.length == 1) numbers += '000'
            else numbers = '0000'
        }
        this.refs['peerIDInput'].value = letters.substring(0,2).toUpperCase() + numbers.substring(0,4)
        ls('peerID', this.refs['peerIDInput'].value)
    },

    _handlePeerIDKeys(event) {
        if ([13, 27].indexOf(event.keyCode) > -1) {
            event.preventDefault();
            this.refs['peerIDInput'].$.input.blur();
        } else if ((event.keyCode > 8 && event.keyCode < 37) || (event.keyCode > 40 && event.keyCode < 48) || (event.keyCode > 90 && event.keyCode < 96) || event.keyCode > 105) {
            // block everything except letters, numbers and arrow keys
            event.preventDefault()
        }
    },

    _handleClearPlayerCmdArgs(event) {
        ls.remove('playerCmdArgs');
        this.refs['playerCmdArgsInput'].value = '';
    },

    _handlePlayerCmdArgsBlur(event) {
        this.refs['playerCmdArgsInput'].value = this.refs['playerCmdArgsInput'].value.trim()
        ls('playerCmdArgs', this.refs['playerCmdArgsInput'].value.split(';'))
    },

    _handlePlayerCmdArgsKeys(event) {
        if ([13, 27].indexOf(event.keyCode) > -1) {
            event.preventDefault();
            this.refs['playerCmdArgsInput'].$.input.blur();
        }
    },

    _handlePulsingToggle(event, toggled) {
        if (toggled) {
            PlayerActions.pulse();
            if (ls('forceDownload')) {
                this._handleForceDownloadToggle({}, false)
                this.refs['forceDownloadToggle'].checked = false
            }
        } else {
            PlayerActions.flood();
            if (ls('speedLimit')) {
                ls('speedLimit', 0)
                _.defer(() => {
                    this.setState({ speedLimit: 0 })
                    this.refs['speedLimitInput'].value = 'auto';
                })
            }
        }
        ls('speedPulsing', toggled ? 'enabled' : 'disabled');
    },
    
    _handleForceDownloadToggle(event, toggled) {
        if (toggled) {
            PlayerActions.startForceDownload();
            if (ls('speedPulsing') == 'enabled') {
                this._handlePulsingToggle({}, false)
                this.refs['speedPulsingToggle'].checked = false
                if (ls('speedLimit')) {
                    ls('speedLimit', 0)
                    _.defer(() => {
                        this.setState({ speedLimit: 0 })
                        this.refs['speedLimitInput'].value = 'auto';
                    })
                }
            }
        } else {
            PlayerActions.stopForceDownload();
        }
        ls('forceDownload', toggled);
    },
    
    _videoField(field, value) {
        this.refs[field + 'Input'].value = value;
        var obj = {
            aspect: true,
            crop: true,
            zoom: true
        };
        obj[field] = false;
        _.each(obj, (el, ij) => {
            if (el)
                this.refs[ij + 'Input'].value = 'Default';
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
    
    _handleRemoveLogic(event, direction) {
        var newLogic = ls('removeLogic');

        if (direction < 0) {
            if (newLogic == 0) newLogic = 2;
            else newLogic--;
        } else {
            if (newLogic == 2) newLogic = 0;
            else newLogic++;
        }
        
        ls('removeLogic', newLogic);
        if (newLogic == 0) {
            var newLabel = 'Always Ask';
        } else if (newLogic == 1) {
            var newLabel = 'Always Remove';
        } else if (newLogic == 2) {
            var newLabel = 'Always Keep';
        }
        
        this.refs['removeLogicInput'].value = newLabel;
    },
     
    _handleDownloadType(event, direction) {
        var newLogic = ls('downloadType');

        if (newLogic == 0) newLogic = 1;
        else newLogic--;
        
        ls('downloadType', newLogic);
        
        if (newLogic == 0) {
            var newLabel = 'Player';
        } else if (newLogic == 1) {
            var newLabel = 'Dashboard';
        }
        
        this.refs['downloadTypeInput'].value = newLabel;
    },

    _handleHotkeyJumpSec(event, direction) {
        var newJump = parseInt(this.refs['hotkeyJumpSecInput'].value);

        if (direction < 0)
            newJump = newJump - 1;
        else
            newJump = newJump + 1;

        if (newJump < 0) newJump = 0;
        
        ls('hotkeyJumpSec', newJump);
        this.refs['hotkeyJumpSecInput'].value = newJump + ' sec';
    },
    
    _handleHotkeyJumpSecKeys(event) {
        if (event.keyCode == 38) {
            event.preventDefault();
            this._handlehotkeyJumpSec(event, 1);
        } else if (event.keyCode == 40) {
            event.preventDefault();
            this._handlehotkeyJumpSec(event, -1);
        } else if ([13, 27].indexOf(event.keyCode) > -1) {
            event.preventDefault();
            this.refs['hotkeyJumpSecInput'].$.input.blur();
        }
    },
    
    _handleHotkeyJumpSecBlur(event) {
        var newValue = parseInt(this.refs['hotkeyJumpSecInput'].value);
        if (newValue < 0)
            newValue = 0;

        ls('hotkeyJumpSec', newValue);
        this.refs['hotkeyJumpSecInput'].value = newValue + ' sec';
    },
   
    _handleRenderFreq(event, direction) {
        var newFreq = parseInt(this.refs['renderFreqInput'].value);

        if (direction < 0)
            newFreq = newFreq - 50;
        else
            newFreq = newFreq + 50;

        if (newFreq < 0) newFreq = 0;
        
        ls('renderFreq', newFreq);
        this.refs['renderFreqInput'].value = newFreq + 'ms';
    },
    
    _handleRenderFreqKeys(event) {
        if (event.keyCode == 38) {
            event.preventDefault();
            this._handleRenderFreq(event, 1);
        } else if (event.keyCode == 40) {
            event.preventDefault();
            this._handleRenderFreq(event, -1);
        } else if ([13, 27].indexOf(event.keyCode) > -1) {
            event.preventDefault();
            this.refs['renderFreqInput'].$.input.blur();
        }
    },
    
    _handleRenderFreqBlur(event) {
        var newValue = parseInt(this.refs['renderFreqInput'].value);
        if (newValue < 0)
            newValue = 0;

        ls('renderFreq', newValue);
        this.refs['renderFreqInput'].value = newValue + 'ms';
    },

    _handleSpeedLimit(event, direction) {
        var newLimit = !parseInt(this.refs['speedLimitInput'].value) ? 0 : parseInt(this.refs['speedLimitInput'].value);

        if (direction < 0)
            newLimit = newLimit - 100;
        else
            newLimit = newLimit + 100;

        if (newLimit < 0) newLimit = 0;
        
        if (newLimit > 0 && (!ls('speedPulsing') || ls('speedPulsing') == 'disabled')) {
            this._handlePulsingToggle({}, true)
            this.refs['speedPulsingToggle'].checked = true
        }
        
        ls('speedLimit', newLimit);
        if (!newLimit)
            this.refs['speedLimitInput'].value = 'auto';
        else
            this.refs['speedLimitInput'].value = newLimit + ' kb';
    },
    
    _handleSpeedLimitKeys(event) {
        if (event.keyCode == 38) {
            event.preventDefault();
            this._handleSpeedLimit(event, 1);
        } else if (event.keyCode == 40) {
            event.preventDefault();
            this._handleSpeedLimit(event, -1);
        } else if ([13, 27].indexOf(event.keyCode) > -1) {
            event.preventDefault();
            this.refs['speedLimitInput'].$.input.blur();
        }
    },
    
    _handleSpeedLimitBlur(event) {
        if (!parseInt(this.refs['speedLimitInput'].value)) {
            ls('speedLimit', 0);
            this.refs['speedLimitInput'].value = 'auto';
        } else {
            var newValue = Math.round(parseInt(this.refs['speedLimitInput'].value) / 100) * 100;
            if (newValue < 0)
                newValue = 0;

            if (newValue > 0 && (!ls('speedPulsing') || ls('speedPulsing') == 'disabled')) {
                this._handlePulsingToggle({}, true)
                _.defer(() => {
                    this.setState({ speedPulsing: 'disabled' });
                    _.defer(() => { this.setState({ speedPulsing: 'enabled' }) })
                })
            }
    
            ls('speedLimit', newValue);
            this.refs['speedLimitInput'].value = newValue + ' kb';
        }
    },
    
    _handleYtdlQuality(event, direction) {
        var newVal = ls('ytdlQuality');

        if (direction < 0)
            newVal = newVal - 1;
        else
            newVal = newVal + 1;

        if (newVal < 0) newVal = 0;
        if (newVal > 4) newVal = 4;
        
        ls('ytdlQuality', newVal);
        this.refs['ytdlQualityInput'].value = this.state.mediaQualities[newVal];
    },
    
    _handleYtdlQualityKeys(event) {
        if (event.keyCode == 38) {
            event.preventDefault();
            this._handleYtdlQuality(event, 1);
        } else if (event.keyCode == 40) {
            event.preventDefault();
            this._handleYtdlQuality(event, -1);
        } else if ([13, 27].indexOf(event.keyCode) > -1) {
            event.preventDefault();
            this.refs['ytdlQualityInput'].$.input.blur();
        }
    },
    
    _handleYtdlQualityBlur(event) {
        var newVal = ls('ytdlQuality');
        if (newVal < 0)
            newVal = 0;

        ls('ytdlQuality', newVal);
        this.refs['ytdlQualityInput'].value = this.state.mediaQualities[newVal];
    },

    render() {
        var renderObj = [
            {
                type: 'header',
                label: 'Plugins'
            }, {
                type: 'select',
                title: 'Preferred Quality',
                tag: 'ytdlQuality',
                width: '90px',
                disabled: true,
                default: this.state.mediaQualities[this.state.ytdlQuality]
            }, {
                type: 'toggle',
                title: 'Adult Content',
                tag: 'adultContent'
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
                label: 'Player'
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
                title: 'Player Notifications',
                tag: 'playerNotifs'
            }, {
                type: 'toggle',
                title: 'Resize on Playlist',
                tag: 'resizeOnPlaylist'
            }, {
                type: 'toggle',
                title: 'Start in Fullscreen',
                tag: 'startFullscreen'
            }, {
                type: 'toggle',
                title: 'Save History',
                tag: 'doHistory'
            }, {
                type: 'select',
                title: 'Arrow Hotkeys Jump',
                tag: 'hotkeyJumpSec',
                default: this.state.hotkeyJumpSec + ' sec',
                width: '80px'
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
                type: 'select',
                title: 'Buffer Size',
                tag: 'bufferSize',
                default: this.state.bufferSize+' sec',
                width: '60px'
            }, {
                type: 'header',
                label: 'Subtitles'
            }, {
                type: 'toggle',
                title: 'Find Subtitles',
                tag: 'findSubs'
            }, {
                type: 'select',
                title: 'Find Subtitles Limit',
                tag: 'subLimit',
                width: '50px',
                disabled: true,
                height: '24px',
                default: ls('subLimits')[ls('subLimit')]
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
            }, {
                type: 'header',
                label: 'Torrents'
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
                type: 'selectFolder',
                title: 'Download Folder',
                tag: 'download',
                default: this.state.downloadFolder,
                width: '280px'
            }, {
                type: 'toggle',
                title: 'Forced Download',
                func: 'ForceDownloadToggle',
                tag: 'forcedDownload'
            }, {
                type: 'toggle',
                title: 'Fast Resume',
                tag: 'fastResume',
                func: 'FastResume'
            }, {
                type: 'toggle',
                title: 'Speed Pulsing',
                func: 'PulsingToggle',
                tag: 'speedPulsing'
            }, {
                type: 'select',
                title: 'Speed Limit',
                tag: 'speedLimit',
                default: !this.state.speedLimit ? 'auto' : (this.state.speedLimit + ' kb'),
                width: '80px'
            }, {
                type: 'writable',
                title: 'Default Trackers (separate by ";")',
                tag: 'torrentTrackers',
                default: this.state.torrentTrackers.join(';'),
                width: '200px'
            }, {
                type: 'header',
                label: 'File Handling'
            }, {
                type: 'toggle',
                title: 'File Selector',
                tag: 'askFiles'
            }, {
                type: 'toggle',
                title: 'Download All Files',
                tag: 'downloadAll'
            }, {
                type: 'select',
                title: 'Remove Files',
                tag: 'removeLogic',
                default: this.state.removeLogic,
                width: '120px',
                disabled: true
            }, {
                type: 'header',
                label: 'Media Handling'
            }, {
                type: 'select',
                title: 'Start Media Torrents with',
                tag: 'downloadType',
                default: this.state.downloadType,
                width: '120px',
                disabled: true
            }, {
                type: 'selectFile',
                title: 'Use External Player',
                default: this.state.playerType || 'Choose Player',
                tag: 'playerType'
            }, {
                type: 'writable',
                title: 'External Player Options',
                tag: 'playerCmdArgs',
                default: this.state.playerCmdArgs,
                width: '200px'
            }, {
                type: 'header',
                label: 'Identity'
            }, {
                type: 'writable',
                title: 'Peer ID (2 letters + 4 digits)',
                tag: 'peerID',
                default: this.state.peerID,
                width: '200px'
            }, {
                type: 'header',
                label: 'Casting'
            }, {
                type: 'select',
                title: 'DLNA Finder',
                tag: 'dlnaFinder',
                default: this.state.dlnaFinders[this.state.dlnaFinder],
                width: '110px',
                disabled: true
            }, {
                type: 'selectFolder',
                title: 'Cache Folder',
                tag: 'cacheFolder',
                default: this.state.cacheFolder,
                width: '280px'
            }
        ];
        
        var indents = [];
        
        var klm = 0;

        renderObj.forEach(el => {
            
            klm++;
            
            if (el.type == 'header') {
        
                indents.push(
                    <div className="setting-header" key={klm}>
                        {el.label}
                    </div>
                );

            } else if (el.type == 'toggle') {

                if (!el.func) el.func = 'Toggler';

                indents.push(
                    <paper-toggle-button
                        ref={el.tag + 'Toggle'}
                        key={klm}
                        id={el.tag}
                        className="mainTogglers"
                        funcName={el.func}
                        checked={this.state[el.tag]}
                        style={{display: 'block', height: '25px'}} >
                    {el.title + ":"}
                    </paper-toggle-button>
                );

            } else if (el.type == 'select') {

                if (!el.func) el.func = el.tag.charAt(0).toUpperCase() + el.tag.slice(1);

                if (el.disabled) {

                    var style = { float: 'right', height: '32px', width: el.width, top: '-5px', marginRight: '4px', textAlign: 'right' }

                    if (el.height) style.height = el.height

                    var newTextField = (
                        <paper-input
                            ref={el.tag + 'Input'}
                            value={el.default}
                            style={style}
                            no-label-float
                            disabled={true}
                            className="dark-input" />
                    );

                } else

                    var newTextField = (
                        <paper-input
                            onKeyDown={this['_handle' + el.func + 'Keys']}
                            onBlur={this['_handle' + el.func + 'Blur']}
                            ref={el.tag + 'Input'}
                            value={el.default}
                            style={{float: 'right', width: el.width, top: '-5px', marginRight: '4px', textAlign: 'right', marginTop: '-2px', marginBottom: '12px'}}
                            no-label-float
                            className="dark-input" />
                    );

                indents.push(
                    <div key={klm} style={{height: '23px', overflow: 'hidden', width: '100%'}}>
                        <div className="sub-delay-setting">
                            <span style={{color: '#212121'}}>
                                {el.title + ':'}
                            </span>
                            <div style={{marginTop: '-1px', display: 'inline-block', float: 'right', width: '18px', overflow: 'hidden', marginRight: '2px'}}>
                                <paper-icon-button
                                    icon="hardware:keyboard-arrow-up"
                                    onClick={(event) => this['_handle' + el.func](event, 1)}
                                    alt="Increase"
                                    noink={true}
                                    style={{color: '#4283A9', width: '22px', height: '22px', right: '2px', padding: '0', marginLeft: '0'}} />
                            </div>
                            <div style={{marginTop: '-1px', display: 'inline-block', float: 'right', width: '18px', overflow: 'hidden', marginLeft: '4px'}}>
                                <paper-icon-button 
                                    icon="hardware:keyboard-arrow-down"
                                    onClick={(event) => this['_handle' + el.func](event, -1)}
                                    alt="Decrease"
                                    noink={true}
                                    style={{color: '#4283A9', width: '22px', height: '22px', right: '2px', padding: '0', marginLeft: '0'}} />
                            </div>
                            {newTextField}
                        </div>
                        <div style={{clear: 'both'}} />
                    </div>
                );

            } else if (['selectFolder','writable'].indexOf(el.type) > -1) {

                if (!el.func) el.func = el.tag.charAt(0).toUpperCase() + el.tag.slice(1);

                indents.push(
                    <div key={klm}>
                        <div className="sub-delay-setting">
                            <span style={{color: '#212121'}}>
                                {el.title + ':'}
                            </span>
                            <paper-icon-button
                                icon="clear"
                                onClick={this['_handleClear' + el.func]}
                                alt="Clear"
                                noink={true}
                                style={{color: '#4283A9', width: '22px', height: '22px', right: '2px', padding: '2px', float: 'right', marginTop: '-1px'}} />
                            <paper-input
                                onClick={el.type == 'selectFolder' ? this['_handle' + el.func + 'Focus'] : this.blank}
                                onBlur={el.type == 'writable' ? this['_handle' + el.func + 'Blur'] : this.blank}
                                onKeyDown={el.type == 'writable' ? this['_handle' + el.func + 'Keys'] : this.blank}
                                ref={el.tag + 'Input'}
                                value={el.default}
                                style={{float: 'right', width: el.width, top: '-5px', marginRight: '4px', textAlign: 'right', marginTop: '-4px', marginBottom: '4px'}}
                                no-label-float
                                className="dark-input dl-input" />
                        </div>
                        <div style={{clear: 'both'}} />
                    </div>
                );

            } else if (['selectFile'].indexOf(el.type) > -1) {

                if (!el.func) el.func = el.tag.charAt(0).toUpperCase() + el.tag.slice(1);

                indents.push(
                    <div key={klm}>
                        <div className="sub-delay-setting">
                            <span style={{color: '#212121'}}>
                                {el.title + ':'}
                            </span>
                            <paper-icon-button
                                icon="clear"
                                onClick={this['_handleClear' + el.func]}
                                alt="Clear"
                                noink={true}
                                style={{color: '#4283A9', width: '22px', height: '22px', right: '2px', padding: '2px', float: 'right', marginTop: '-1px'}} />
                            <paper-input
                                onClick={el.type == 'selectFile' ? this['_handle' + el.func + 'Focus'] : this.blank}
                                ref={el.tag + 'Input'}
                                value={el.default}
                                style={{float: 'right', width: el.width, top: '-5px', marginRight: '4px', textAlign: 'right', marginTop: '-4px', marginBottom: '4px'}}
                                no-label-float
                                className="dark-input dl-input" />
                        </div>
                        <div style={{clear: 'both'}} />
                    </div>
                );

            } else if (el.type == 'button') {
                
                indents.push(
                    <paper-button
                        raised
                        key={klm}
                        onClick={el.func}
                        className='playerButtons' >
                    {el.title}
                    </paper-button>
                );

            } else if (el.type == 'clear') {
                
                indents.push(<div key={klm} style={{clear: 'both'}} />);
                
            }
        })

        return (
            <div className="settings-container" style={{textAlign: 'center'}}>
                <span style={{paddingTop: '64px', display: 'inline-block', fontSize: '21px', color: '#e87272' , marginBottom: '0'}}>General Settings</span>
                <br />
                <div className="settings-list" style={{marginTop: '4%'}}>
                    {indents}
                </div>
            </div>
        );
    }
});

