import alt from '../../alt'
import _ from 'lodash';
import ipc from 'ipc';
import HistoryStore from '../../stores/historyStore';
import torrentUtil from '../../utils/stream/torrentUtil';
import player from './utils/player';
import ls from 'local-storage';

class PlayerActions {

    announcement(obj) {
        var announcer = {};
        if (typeof obj === 'string') obj = {
            text: obj
        };
        announcer.text = obj.text;
        if (!obj.delay) obj.delay = 2000;

        clearTimeout(player.announceTimer);
        player.announceTimer = setTimeout(() => {
            if (!player.announceEffect) {
                player.events.emit('announce', {
                    effect: !player.announceEffect
                });
            }
        }, obj.delay);

        if (player.announceEffect)
            obj.effect = !player.announceEffect;

        if (Object.keys(announcer).length)
            player.events.emit('announce', obj);
    }

    setDesc(obj) {
        var playerState = this.alt.stores.playerStore.getState();
        var wcjs = player.wcjs;
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
        var wcjs = player.wcjs;

        if (!wcjs) {
            if (data.length)
                player.set({
                    pendingFiles: data,
                    files: player.files.concat(data)
                });

            this.actions.togglePowerSave(true);

        } else {

            player.set({
                files: player.files.concat(data)
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

        var progressState = this.alt.stores.ProgressStore.getState();
        var wcjs = player.wcjs;

        var newX = newObj.x;
        var newMRL = newObj.mrl;

        player.set({
            files: player.files.concat([newMRL])
        });

        wcjs.playlist.add(newMRL.uri);
        if (newMRL.title)
            wcjs.playlist.items[wcjs.playlist.items.count - 1].title = newMRL.title;

        var newDifference = wcjs.playlist.items.count - 1;
        var swapDifference = wcjs.playlist.items.count - newX - 1;

        if (newX == wcjs.playlist.currentItem && [3, 4].indexOf(wcjs.state) > -1) {
            var playerPos = progressState.position;
            wcjs.stop();
            wcjs.playlist.advanceItem(newDifference, swapDifference * (-1));
            wcjs.playlist.playItem(newX);
            wcjs.position = playerPos;

        } else wcjs.playlist.advanceItem(newDifference, swapDifference * (-1));

        wcjs.playlist.items[newX].setting = wcjs.playlist.items[newX + 1].setting;
        wcjs.playlist.removeItem(newX + 1);
    }

    pulse() {
        var wcjs = player.wcjs;

        if (wcjs) {
            var length = wcjs.length;
            var itemDesc = player.itemDesc();
            if (length && itemDesc.setting && itemDesc.setting.torrentHash && itemDesc.setting.byteSize) {
                var newPulse = Math.round(itemDesc.setting.byteSize / (length / 1000) * 2);
                torrentUtil.setPulse(itemDesc.setting.torrentHash, newPulse);
            }
        }
    }

    flood() {
        var wcjs = player.wcjs;

        if (wcjs) {
            var itemDesc = player.itemDesc();
            if (itemDesc.setting && itemDesc.setting.torrentHash)
                torrentUtil.flood(itemDesc.setting.torrentHash);
        }
    }

    updateImage(image) {
        if (document.getElementById('canvasEffect')) {
            var wcjs = player.wcjs;
            if (wcjs.playlist.items[wcjs.playlist.currentItem].mrl.indexOf('soundcloud.com') > -1 && image) {
                var image = image.replace('large', 't500x500');
                document.getElementById('canvasEffect').parentNode.style.cssText = "background-color: transparent !important";
                document.getElementById('playerCanvas').style.display = "none";
                document.getElementsByClassName('wcjs-player')[0].style.background = "url('" + image + "') 50% 50% / contain no-repeat black";
            } else {
                document.getElementById('canvasEffect').parentNode.style.cssText = "background-color: #000 !important";
                document.getElementById('playerCanvas').style.display = "block";
                document.getElementsByClassName('wcjs-player')[0].style.background = "black";
            }
        }
    }

    toggleAlwaysOnTop(state = true) {
        ipc.send('app:alwaysOnTop', state);
    }

    togglePowerSave(state = true) {
        ipc.send('app:powerSaveBlocker', state);
    }

}


export
default alt.createActions(PlayerActions);
