
import _ from 'lodash';
import SubtitleStore from '../components/SubtitleText/store';
import SubtitleActions from '../components/SubtitleText/actions';
import PlayerActions from '../actions';
import BaseModalActions from '../../Modal/actions';
import engineStore from '../../../stores/engineStore';
import HistoryStore from '../../../stores/historyStore';

import player from './player';
import ls from 'local-storage';

import {
    ipcRenderer, shell
}
from 'electron';

var sleeper = null;

var getAction = function(event, act) {
    eval(act);
    ipcRenderer.removeListener('context-action', getAction);
};

var actions = {
    torrentData() {

        player.saveState = {
            idx: player.wcjs.playlist.currentItem,
            position: player.wcjs.position
        };

        player.wcjs.stop();

        HistoryStore.getState().history.replaceState(null, 'torrentDashboard');

    },
    downloadFolder() {
        var engineState = engineStore.getState();
        
        var torrent = engineState.torrents[engineState.infoHash];
        
        if (torrent.files[0].path.indexOf('\\') > -1) {
            
            var extPath = '\\' + torrent.files[0].path.substr(0, torrent.files[0].path.indexOf('\\'));
            
        } else if (torrent.files[0].path.indexOf('/') > -1) {

            var extPath = '/' + torrent.files[0].path.substr(0, torrent.files[0].path.indexOf('/'));

        } else {

            var extPath = '';

        }
        shell.openItem(torrent.path + extPath);
    },
    downloadAll() {
        var engineState = engineStore.getState();
        var torrent = engineState.torrents[engineState.infoHash];
        torrent.files.forEach( el => {
            torrent.selectFile(parseInt(el.fileID));
        });
        PlayerActions.announcement('Downloading All Files');
    },
    downloadForce() {
        var engineState = engineStore.getState();
        engineState.torrents[engineState.infoHash].discover();
        PlayerActions.announcement('Forcing Download');
    },
    speedPulsing() {
        var toggled = !(ls('speedPulsing') == 'enabled');
         if (toggled) {
            PlayerActions.pulse();
        } else {
            PlayerActions.flood();
        }
        ls('speedPulsing', toggled ? 'enabled' : 'disabled');
    },
    audioTrack: function(i) {
        player.wcjs.audio.track = i;
        player.set({
            audioTrack: i
        });
        player.fields.audioTrack.value = player.wcjs.audio[i];
    },
    selectExternal: function(idx, item, itemId) {
        ls('lastLanguage', idx);
        player.wcjs.subtitles.track = 0;
        if (item) {
            SubtitleActions.loadSub(item);
            SubtitleActions.settingChange({
                selectedSub: itemId,
            });
        } else {
            SubtitleActions.settingChange({
                selectedSub: itemId,
                subtitle: [],
                trackSub: -1,
                text: ''
            });
        }
    },
    selectInternal(idx, item, itemId) {
        var wcjs = player.wcjs;
        if (item && (itemId - 1) < wcjs.subtitles.count) {
            wcjs.subtitles.track = idx;
            SubtitleActions.settingChange({
                selectedSub: itemId,
                subtitle: [],
                subText: ''
            });
        }
    },
    getItems() {
        var itemDesc = player.itemDesc();
        if (itemDesc && itemDesc.setting && itemDesc.setting.subtitles) {
            return itemDesc.setting.subtitles;
        } else return [];
    },
    getInternalSubs() {
        var wcjs = player.wcjs;
        var internalSubs = [];
        if (wcjs.subtitles && wcjs.subtitles.count > 0) {
            for (var i = 1; i < wcjs.subtitles.count; i++)
                internalSubs.push(wcjs.subtitles[i]);
            return internalSubs;
        } else return [];
    },
    changeAspect(ij) {
        const aspectRatios = ['Default','1:1','4:3','16:9','16:10','2.21:1','2.35:1','2.39:1','5:4'];
        
        player.fields.aspect.value = aspectRatios[ij];

        player.events.emit('resizeNow', {
            aspect: aspectRatios[ij],
            crop: 'Default',
            zoom: 1
        });
    },
    changeCrop(ij) {
        const crops = ['Default','16:10','16:9','1.85:1','2.21:1','2.35:1','2.39:1','5:3','4:3','5:4','1:1'];

        player.fields.crop.value = crops[ij];

        player.events.emit('resizeNow', {
            crop: crops[ij],
            aspect: 'Default',
            zoom: 1
        });
    },
    changeZoom(ij) {
        const zooms = [['Default',1],['2x Double',2],['0.25x Quarter',0.25],['0.5x Half',0.5]];

        player.fields.zoom.value = zooms[ij][0];

        player.events.emit('resizeNow', {
            zoom: zooms[ij][1],
            crop: 'Default',
            aspect: 'Default'
        });
    },
    alwaysOnTop() {
        var toggled = !player.alwaysOnTop;
        player.set({
            alwaysOnTop: toggled
        });
        PlayerActions.toggleAlwaysOnTop(toggled);
    },
    sleepFor(pauseIn) {
        if (sleeper) {
            clearTimeout(sleeper);
            sleeper = null;
        }
        if (pauseIn.time) {
            sleeper = setTimeout(() => {
                sleeper = null;
                player.wcjs.pause();
                PlayerActions.announcement('Sleep Timer Triggered');
            }, (pauseIn.time * 1000));
        }
        if (!pauseIn.time) {
            PlayerActions.announcement('Sleep Timer Disabled');
        } else {
            PlayerActions.announcement('Sleep Timer: ' + pauseIn.label);
        }
    },
    seeHotkeys() {
        require('electron').shell.openExternal('https://github.com/jaruba/PowderPlayer/wiki/Hotkeys');
    },
    issues() {
        require('electron').shell.openExternal('https://github.com/jaruba/PowderPlayer/issues');
    },
    about() {
        BaseModalActions.open({ type: "about" });
    }
};

var contextMenu = {
    listen: function(e) {
        e.preventDefault();

        var isPlaying = ([3, 4].indexOf(player.wcjs.state) > -1);
        
        if (isPlaying) {
            var engineState = engineStore.getState();
            var isTorrent = !!(engineState.infoHash && engineState.torrents[engineState.infoHash]);
        }

        // audio tracks
        var audioTracks = [];
        for (let i = 0; i < player.wcjs.audio.count; i++) {
            audioTracks.push({
                label: player.wcjs.audio[i],
                type: 'checkbox',
                checked: (player.wcjs.audio.track < 0 && i == 0) || (i == player.wcjs.audio.track),
                click: 'actions.audioTrack(' + i + ')'
            });
        }
        
        // subtitles
        var playlistSelected = SubtitleStore.getState().selectedSub;
        var itemId = 1;
        var internalSubs = _.map(actions.getInternalSubs(), (item, idx) => {
            itemId++;
            return {
                label: item,
                type: 'checkbox',
                checked: (playlistSelected == itemId),
                click: 'actions.selectInternal(' + (idx + 1) + ', "' + item + '", ' + itemId + ')'
            }
        })
        var externalSubs = _.map(actions.getItems(), (item, idx) => {
            itemId++;
            var lang = idx.split('[lg]');
            return {
                label: lang[0],
                type: 'checkbox',
                checked: (playlistSelected == itemId),
                click: 'actions.selectExternal("' + idx + '", "' + item + '", ' + itemId + ')'
            }
        })
        
        var subtitles = [
            {
                label: 'None',
                type: 'checkbox',
                checked: (playlistSelected == 1),
                click: 'actions.selectExternal(\'none\', \'\', 1)'
            }
        ];
        
        subtitles = subtitles.concat(internalSubs).concat(externalSubs);
        
        // aspect ratio
        const aspectRatios = ['Default','1:1','4:3','16:9','16:10','2.21:1','2.35:1','2.39:1','5:4'];
        const aspectRatio = player.aspect;
        
        var aspectMenu = [];

        aspectRatios.forEach( (el, ij) => {
            aspectMenu.push({
                label: el,
                type: 'checkbox',
                checked: (el == aspectRatio),
                click: 'actions.changeAspect(' + ij + ')'
            });
        });

        // crop
        const crops = ['Default','16:10','16:9','1.85:1','2.21:1','2.35:1','2.39:1','5:3','4:3','5:4','1:1'];
        const crop = player.crop;
        
        var cropMenu = [];

        crops.forEach( (el, ij) => {
            cropMenu.push({
                label: el,
                type: 'checkbox',
                checked: (el == crop),
                click: 'actions.changeCrop(' + ij + ')'
            });
        });
        
        const zooms = [['Default',1],['2x Double',2],['0.25x Quarter',0.25],['0.5x Half',0.5]];
        const zoom = player.zoom;
        
        var zoomMenu = [];
        
        zooms.forEach( (el, ij) => {
            zoomMenu.push({
                label: el[0],
                type: 'checkbox',
                checked: (el[1] == zoom),
                click: 'actions.changeZoom(' + ij + ')'
            });
        });
        
        // concatenate template
        var template = [
            {
                label: 'Torrent',
                enabled: (isPlaying && isTorrent),
                submenu: [
                    {
                        label: 'Torrent Data',
                        click: 'actions.torrentData()'
                    },
                    {
                        label: 'Download Folder',
                        click: 'actions.downloadFolder()'
                    },
                    {
                        label: 'Download All',
                        click: 'actions.downloadAll()'
                    },
                    {
                        label: 'Force Download',
                        click: 'actions.downloadForce()'
                    },
                    {
                        label: 'Speed Pulsing',
                        type: 'checkbox',
                        checked: !!(ls('speedPulsing') == 'enabled'),
                        click: 'actions.speedPulsing()'
                    }
                ]
            },
            {
                type: 'separator'
            },
            {
                label: 'Audio Tracks',
                enabled: isPlaying,
                submenu: audioTracks
            },
            {
                label: 'Subtitles',
                enabled: isPlaying,
                submenu: subtitles
            },
            {
                type: 'separator'
            },
            {
                label: 'Aspect Ratio',
                enabled: isPlaying,
                submenu: aspectMenu
            },
            {
                label: 'Crop',
                enabled: isPlaying,
                submenu: cropMenu
            },
            {
                label: 'Zoom',
                enabled: isPlaying,
                submenu: zoomMenu
            },
            {
                type: 'separator'
            },
            {
                label: 'Sleep Timer',
                enabled: isPlaying,
                submenu: [
                    {
                        label: 'Disable',
                        click: 'actions.sleepFor({ time: 0 })'
                    },
                    {
                        label: '15 min',
                        click: 'actions.sleepFor({ time: 900, label: "15 min" })'
                    },
                    {
                        label: '30 min',
                        click: 'actions.sleepFor({ time: 1800, label: "30 min" })'
                    },
                    {
                        label: '45 min',
                        click: 'actions.sleepFor({ time: 2700, label: "45 min" })'
                    },
                    {
                        label: '1 hour',
                        click: 'actions.sleepFor({ time: 3600, label: "1 hour" })'
                    },
                    {
                        label: '1 hour 30 min',
                        click: 'actions.sleepFor({ time: 5400, label: "1 hour 30 min" })'
                    },
                    {
                        label: '2 hours',
                        click: 'actions.sleepFor({ time: 7200, label: "2 hours" })'
                    }
                ]
            },
            {
                label: 'Help',
                submenu: [
                    {
                        label: 'Hotkeys',
                        click: 'actions.seeHotkeys()'
                    },
                    {
                        label: 'Issues',
                        click: 'actions.issues()'
                    },
                    {
                        label: 'About',
                        click: 'actions.about()'
                    }
                ]
            },
            {
                label: 'Always on Top',
                type: 'checkbox',
                checked: player.alwaysOnTop,
                click: 'actions.alwaysOnTop()'
            }
        ];
        
        ipcRenderer.removeListener('context-action', getAction);
        ipcRenderer.send('app:contextmenu', template);
        ipcRenderer.on('context-action', getAction);
    }
};

module.exports = contextMenu;



