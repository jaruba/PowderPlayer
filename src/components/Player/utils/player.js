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
        var wcjs_path = (process.env.NODE_ENV === 'development') ? require('path').join(__dirname, '../../../../../bin/wcjs/', 'WebChimera.js.node') : require('path').join(require('remote').require('app').getAppPath(), '../bin/', 'WebChimera.js.node');
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
