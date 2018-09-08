import _ from 'lodash';
import events from 'events';
import traktUtil from './trakt';
import wcjsRenderer from './wcjs-renderer';
import ls from 'local-storage';
import engineStore from '../../../stores/engineStore';

var player = {
    aspect: 'Default',
    crop: 'Default',
    zoom: 1,
    speed: 1,
    audioChannel: 1,
    audioTrack: 1,
    audioDelay: 0,
    subDelay: 0,
    alwaysOnTop: false,
    fields: {},
    foundTrakt: false,
    notifier: false,
    wcjs: false,
    pendingFiles: [],
    files: [],
    firstPlay: false,
    lastItem: -1,
    saveState: {}
};

player.events = new events.EventEmitter();

player.loadHistory = (obj) => {
    ls('savedHistory', obj);
    player.events.emit('dropObj', obj);
}

player.saveHistory = () => {

    if (player.wcjs.playlist.currentItem > -1) {

        if (!ls('doHistory')) return
        
        var savedPlaylist = [];
        
        var history = ls('history')
        
        history.some((el, ij) => {
            if (el[0] && el[el[0].currentItem].title == player.itemDesc().title) {
                history.splice(ij, 1);
                return true;
            }
        })
        
        var objGenerator = function(il) {
            var engineState = engineStore.getState();

            var itemDesc = player.itemDesc(il);
            var itemSetting = itemDesc.setting;
            return {
                idx: il,
                title: itemDesc.title,
                mrl: itemDesc.mrl,
                duration: itemDesc.duration,
                position: player.wcjs.playlist.currentItem == il ? player.wcjs.position : 0,
                torrentHash: itemSetting && itemSetting.torrentHash ? itemSetting.torrentHash : null,
                streamID: itemSetting && itemSetting.streamID ? itemSetting.streamID : null,
                currentItem: player.wcjs.playlist.currentItem,
                currentTime: player.wcjs.time,
                currentHash: engineState.torrents && engineState.infoHash ? engineState.infoHash : null,
                originalURL: itemSetting && itemSetting.originalURL ? itemSetting.originalURL : null,
                torFilePath: itemSetting && itemSetting.path ? itemSetting.path : null,
                byteSize: itemSetting && itemSetting.byteSize ? itemSetting.byteSize : null,
                announce: itemSetting && itemSetting.announce ? itemSetting.announce : null
            }
        }

        for (var ik = 0; ik < player.wcjs.playlist.itemCount; ik++) {
            savedPlaylist.push(objGenerator(ik));
        }

        history.push(savedPlaylist);

        if (history.length > ls('historyLimit')) {
            history.shift();
        }

        ls('history', history);
    }
}

window.saveHistory = player.saveHistory

player.loadState = () => {

    if (typeof player.saveState.idx != 'undefined') {

        // resume player state

        player.set({
            lastItem: -1,
            firstPlay: false,
            foundTrakt: false
        });

        player.events.emit('foundTrakt', false);

        player.wcjs.playlist.playItem(player.saveState.idx);

        if (player.saveState.position)
            player.wcjs.position = player.saveState.position;

        player.saveState = {};

    }
};

player.set = newObj =>  _.each(newObj, (el, ij) => {
    player[ij] = el;
});

player.wcjsInit = (canvas, wcjs) => {
    if (!canvas) {
        canvas = document.querySelector('#fake-canvas');
    }
    if (!wcjs) {
        if (process.platform == 'darwin') {
            var wcjs_path = (process.env.NODE_ENV === 'development') ? require('path').join(__dirname, '../../../../bin/', 'WebChimera.js.node') : require('path').join(require('remote').require('app').getAppPath(), '../bin/', 'WebChimera.js.node');
        } else {
            var wcjs_path = (process.env.NODE_ENV === 'development') ? require('path').join(__dirname, '../../../../../bin/', 'WebChimera.js.node') : require('path').join(require('remote').require('app').getAppPath(), '../bin/', 'WebChimera.js.node');
        }
        wcjs = require(wcjs_path);
    }
    
    player.wcjs = wcjsRenderer.init(canvas, [
        "--network-caching=" + ls('bufferSize'),
        "--no-sub-autodetect-file"
    ], {
        fallbackRenderer: false,
        preserveDrawingBuffer: true
    }, wcjs);
}

player.itemDesc = i => {
    if (!player.wcjs) return false;
    if (typeof i === 'undefined') i = player.wcjs.playlist.currentItem;
    if (typeof i === 'number') {
        if (i > -1 && i < player.wcjs.playlist.items.count) {
            var wjsDesc = Object.assign({}, player.wcjs.playlist.items[i]);
            if (!wjsDesc.setting) wjsDesc.setting = "{}";
            wjsDesc.setting = JSON.parse(wjsDesc.setting);
            return wjsDesc;
        }
    }
    return false;
}

player.prev = () => {
    if (player.wcjs.playlist.currentItem > 0) {
        player.set({
            lastItem: -1,
            firstPlay: false,
            foundTrakt: false
        });

        player.events.emit('foundTrakt', false);
        traktUtil.handleScrobble('stop', player.itemDesc(), player.wcjs.position);

        player.wcjs.playlist.prev();
    }
};

player.next = () => {
    if (player.wcjs.playlist.currentItem + 1 < player.wcjs.playlist.items.count) {
        player.set({
            lastItem: -1,
            firstPlay: false,
            foundTrakt: false
        });

        player.events.emit('foundTrakt', false);
        traktUtil.handleScrobble('stop', player.itemDesc(), player.wcjs.position);

        player.wcjs.playlist.next();
    }
};

player.playItem = (idx, force) => {
    if (idx != player.wcjs.playlist.currentItem || force) {
        player.foundTrakt = false;
        player.events.emit('foundTrakt', false);

        traktUtil.handleScrobble('stop', player.itemDesc(), player.wcjs.position);

        player.wcjs.playlist.playItem(idx);
    }
}

module.exports = player;
