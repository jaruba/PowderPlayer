import alt from '../../alt'
import _ from 'lodash';
import ipc from 'ipc';
import subUtil from './utils/subtitles';
import HistoryStore from '../../stores/historyStore';
import torrentUtil from '../../utils/stream/torrentUtil';

class PlayerActions {

    constructor() {
        this.generateActions(
            'play',
            'playItem',
            'pause',
            'prev',
            'next',
            'stop',
            'stopped',
            'volume',
            'mute',

            'playing',
            'uiShown',
            'position',
            'buffering',
            'seekable',
            'time',
            'length',
            'scrobble',
            'scrobbleState',
            'opening',
            'error',
            'ended',
            'mediaChanged',

            'fullscreen',
            'settingChange',
            'metaUpdate',
            'wcjsInit',
            'close',
            'togglePlaylist',
            'toggleSubtitles',
            'toggleSettings',
            'setPlaylist',
            'setSubtitle',
            'setSubDelay',
            'setAudioDelay',

            'delayTime',
            'scrobbleKeys',

            'itemCount',
            'itemDesc',
            'setRate',

            'announcement',

            'updateImage'
        );
    }

    loadSub(subLink) {
        subUtil.loadSubtitle(subLink, parsedSub => {
            if (!parsedSub) {
                this.actions.announcement('Subtitle Loading Failed');
            } else {
                this.actions.setSubtitle(parsedSub);
                this.actions.setSubDelay(0);
            }
        });
    }
    
    setDesc(obj) {
        var playerState = this.alt.stores.playerStore.getState();
        var wcjs = playerState.wcjs;
        if (typeof obj.idx === 'undefined')
            obj.idx = wcjs.playlist.currentItem;

        if (obj && typeof obj.idx === 'number') {
            var i = obj.idx;

            if (obj.title)
                wcjs.playlist.items[i].title = obj.title;

            if (i > -1 && i < wcjs.playlist.items.count) {
                if (wcjs.playlist.items[i].setting.length)
                    var wjsDesc = JSON.parse(wcjs.playlist.items[i].setting);
                else
                    var wjsDesc = {};

                if (obj)
                    for (var key in obj)
                        if (obj.hasOwnProperty(key))
                            wjsDesc[key] = obj[key];

                wcjs.playlist.items[i].setting = JSON.stringify(wjsDesc);
            }
        }
    }
    
    addPlaylist(data) {
        HistoryStore.getState().history.replaceState(null, 'player');

        var playerState = this.alt.stores.playerStore.getState();
        var wcjs = playerState.wcjs;

        if (!wcjs) {
            if (data.length)
                this.actions.settingChange({
                    pendingFiles: data,
                    files: playerState.files.concat(data)
                });

            this.actions.togglePowerSave(true);

        } else {

            this.actions.settingChange({
                files: playerState.files.concat(data)
            });

            if (wcjs.playlist.items.count == 0)
                var playAfter = true;

            for (var i = 0; data[i]; i++) {
                if (typeof data[i] === 'string') {
                    wcjs.playlist.add(data[i]);
                } else if (data[i].uri) {
                    wcjs.playlist.add(data[i].uri);
                    if (data[i].title)
                        wcjs.playlist.items[wcjs.playlist.items.count - 1].title = data[i].title;

                    data[i].idx = wcjs.playlist.items.count - 1;

                    let keeper = data[i];

                    if (data[i].byteSize && data[i].torrentHash) {
                        this.actions.setDesc({
                            idx: keeper.idx,
                            byteSize: keeper.byteSize,
                            torrentHash: keeper.torrentHash,
                            path: keeper.path
                        });
                    } else if (data[i].path) {
                        this.actions.setDesc({
                            idx: keeper.idx,
                            path: keeper.path
                        });
                    }

                }
            }

            if (playAfter) wcjs.playlist.playItem(0);

        }
    }

    replaceMRL(newObj) {

        var playerState = this.alt.stores.playerStore.getState();
        var wcjs = playerState.wcjs;

        var newX = newObj.x;
        var newMRL = newObj.mrl;

        this.actions.settingChange({
            files: playerState.files.concat([newMRL])
        });

        wcjs.playlist.add(newMRL.uri);
        if (newMRL.title)
            wcjs.playlist.items[wcjs.playlist.items.count - 1].title = newMRL.title;

        var newDifference = wcjs.playlist.items.count - 1;
        var swapDifference = wcjs.playlist.items.count - newX - 1;

        if (newX == wcjs.playlist.currentItem && [3, 4].indexOf(wcjs.state) > -1) {
            var playerPos = playerState.position;
            wcjs.stop();
            wcjs.playlist.advanceItem(newDifference, swapDifference * (-1));
            wcjs.playlist.playItem(newX);
            wcjs.position = playerPos;

        } else wcjs.playlist.advanceItem(newDifference, swapDifference * (-1));

        wcjs.playlist.items[newX].setting = wcjs.playlist.items[newX + 1].setting;
        wcjs.playlist.removeItem(newX + 1);
    }

    pulse() {
        var playerState = this.alt.stores.playerStore.getState();
        var wcjs = playerState.wcjs;

        if (wcjs) {
            var length = wcjs.length;
            var itemDesc = playerState.itemDesc();
            if (length && itemDesc.setting && itemDesc.setting.torrentHash && itemDesc.setting.byteSize) {
                var newPulse = Math.round(itemDesc.setting.byteSize / (length / 1000) * 2);
                torrentUtil.setPulse(itemDesc.setting.torrentHash, newPulse);
            }
        }
    }

    flood() {
        var playerState = this.alt.stores.playerStore.getState();
        var wcjs = playerState.wcjs;

        if (wcjs) {
            var itemDesc = playerState.itemDesc();
            if (itemDesc.setting && itemDesc.setting.torrentHash)
                torrentUtil.flood(itemDesc.setting.torrentHash);
        }
    }

    toggleAlwaysOnTop(state = true) {
        ipc.send('app:alwaysOnTop', state);
    }

    togglePowerSave(state = true) {
        ipc.send('app:powerSaveBlocker', state);
    }

    toggleFullscreen(state) {
        this.dispatch();

        window.document.querySelector(".render-holder > div:first-of-type").style.display = 'none';
        _.delay(() => {
            window.document.querySelector(".render-holder > div:first-of-type").style.display = 'block';
        }, 1000);

        ipc.send('app:fullscreen', state);
        this.actions.fullscreen(state);
    }
}


export
default alt.createActions(PlayerActions);
