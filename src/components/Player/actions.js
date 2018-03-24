import alt from '../../alt'
import _ from 'lodash';
import {
    ipcRenderer
}
from 'electron';
import HistoryStore from '../../stores/historyStore';
import torrentUtil from '../../utils/stream/torrentUtil';
import engineStore from '../../stores/engineStore';
import player from './utils/player';
import ls from 'local-storage';
import wcjsRenderer from './utils/wcjs-renderer';

var maxDownloadSpeed = 0
var forceDownloadInterval = false

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
        if (typeof obj.idx === 'undefined' || obj.idx == null)
            if (wcjs.playlist.currentItem > -1)
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

        if (!player.wcjs) {
            player.wcjsInit();
        }
        var selected = -1,
            noStart = false;
        if (data.selected) {
            selected = data.selected;
            data = data.files;
        }
        if (data.noStart) {
            noStart = true;
            data = data.files;
        } else if (!player.wcjs.playlist.itemCount) {
            HistoryStore.getState().history.replaceState(null, 'player');
        }

        var playerState = this.alt.stores.playerStore.getState();
        var wcjs = player.wcjs;

        if (!wcjs) {
            if (data.length) {
                player.set({
                    pendingFiles: data,
                    files: player.files.concat(data),
                    pendingSelected: selected
                });
            }
        } else {

            player.set({
                files: player.files.concat(data)
            });

            if (wcjs.playlist.items.count == 0)
                var playAfter = true;

            for (var i = 0; data[i]; i++) {
                if (typeof data[i] === 'string') {
                    wcjs.playlist.add(data[i]);
                    var lastIdx = wcjs.playlist.items.count - 1;
                    wcjs.playlist.items[lastIdx].parseAsync();
                    if (window.clTitle) {
                        this.actions.setDesc({
                            idx: lastIdx,
                            title:  window.clTitle || null
                        });
                        delete window.clTitle;
                    }
                } else if (data[i].uri) {

                    wcjs.playlist.add(data[i].uri);
                    if (data[i].title)
                        wcjs.playlist.items[wcjs.playlist.items.count - 1].title = data[i].title;

                    wcjs.playlist.items[wcjs.playlist.items.count - 1].parseAsync();

                    data[i].idx = wcjs.playlist.items.count - 1;

                    let keeper = data[i];

                    if (window.clTitle) {
                        keeper.title = window.clTitle;
                        delete window.clTitle;
                    }
                    if (data[i].torrentHash) {
                        this.actions.setDesc({
                            idx: keeper.idx,
                            byteSize: keeper.byteSize || null,
                            torrentHash: keeper.torrentHash,
                            streamID: keeper.streamID || null,
                            path: keeper.path || null,
                            title: keeper.title || null,
                            announce: keeper.announce || null
                        });
                    } else if (data[i].path) {
                        this.actions.setDesc({
                            idx: keeper.idx,
                            path: keeper.path,
                            title: keeper.title || null
                        });
                    } else if (data[i].youtubeDL) {
                        this.actions.setDesc({
                            idx: keeper.idx,
                            timestamp: 0,
                            youtubeDL: true,
                            originalURL: keeper.originalURL,
                            image: keeper.image || null,
                            title: keeper.title || null
                        });
                    }

                }
            }
    var savedHistory = ls('savedHistory');
    if (savedHistory && savedHistory.length) return
            if (!noStart) {
                if (selected > -1) {
                    wcjs.playlist.playItem(selected);
                } else if (playAfter) wcjs.playlist.playItem(0);
            }

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
        wcjs.playlist.items[wcjs.playlist.items.count - 1].parseAsync();
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

        var newData = {};
        
        newData.title = newMRL.title ? newMRL.title : null;
            
        newData.image = newMRL.thumbnail ? newMRL.thumbnail : null;
        
        if (newMRL.youtubeDL)
            newData.timestamp = new Date().getTime();
        
        if (newMRL.byteSize) newData.byteSize = newMRL.byteSize
        if (newMRL.streamID) newData.streamID = newMRL.streamID
        if (newMRL.path) newData.path = newMRL.path
        if (newMRL.torrentHash) newData.torrentHash = newMRL.torrentHash
        if (newMRL.announce) newData.announce = newMRL.announce

        if (newData.title || newData.image || newData.timestamp || newMRL.torrentHash) {
            newData.idx = newX;
            this.actions.setDesc(newData);
        }
        
        if (newObj.autoplay)
            wcjs.playlist.playItem(newObj.x);

        if (newObj.autoplayAt)
            wcjs.time = newObj.autoplayAt;

    }

    pulse() {
        var wcjs = player.wcjs;

        if (wcjs) {
            var length = wcjs.length;
            var itemDesc = player.itemDesc();
            if (length && itemDesc.setting && itemDesc.setting.torrentHash && itemDesc.setting.byteSize) {
                var newPulse = ls('speedLimit') ? (ls('speedLimit') * 1000) : Math.round(itemDesc.setting.byteSize / (length / 1000) * 2);
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
    
    startForceDownload() {
        if (forceDownloadInterval) {
            clearInterval(forceDownloadInterval)
            forceDownloadInterval = false
        }
        var engineState = engineStore.getState();
        var isTorrent = !!(engineState.infoHash && engineState.torrents[engineState.infoHash]);
        if (!isTorrent) return
        forceDownloadInterval = setInterval(() => {
            var torrent = engineState.torrents[engineState.infoHash]
            var progress = torrent.torrent.pieces.downloaded / torrent.torrent.pieces.length;
            var finished = false;
            if (progress == 1) finished = true;
            if (finished) {
                this.actions.stopForceDownload()
                return
            }
            if (maxDownloadSpeed < torrent.swarm.downloadSpeed) maxDownloadSpeed = torrent.swarm.downloadSpeed
            if (torrent.swarm.downloadSpeed < maxDownloadSpeed / 2)
                torrent.discover();
        }, 120000) // 2 minutes
    }
    
    stopForceDownload() {
        var engineState = engineStore.getState();
        var isTorrent = !!(engineState.infoHash && engineState.torrents[engineState.infoHash]);
        if (!isTorrent) return
        maxDownloadSpeed = 0
        if (forceDownloadInterval) {
            clearInterval(forceDownloadInterval)
            forceDownloadInterval = false
        }
    }

    updateImage(image) {
        if (document.getElementById('canvasEffect')) {
            var wcjs = player.wcjs;
            if (!wcjs.input.hasVout && image) {
                var image = image.replace('large', 't500x500');
                document.getElementById('canvasEffect').parentNode.style.cssText = "background-color: transparent !important";
                document.getElementById('playerCanvas').style.display = "none";
                document.getElementsByClassName('wcjs-player')[0].style.background = "url('" + image + "') 50% 50% / contain no-repeat black";
            } else {
                document.getElementById('canvasEffect').parentNode.style.cssText = "background-color: #000 !important";
                document.getElementById('playerCanvas').style.display = "block";
                document.getElementsByClassName('wcjs-player')[0].style.background = "black";
                _.defer(() => {
                    player.events.emit('resizeNow');
                });
            }
        }
    }

    toggleAlwaysOnTop(state = true) {
        ipcRenderer.send('app:alwaysOnTop', state);
    }

    togglePowerSave(state = true) {
        ipcRenderer.send('app:powerSaveBlocker', state);
    }

}


export
default alt.createActions(PlayerActions);
