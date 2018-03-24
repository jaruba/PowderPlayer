import _ from 'lodash';
import ls from 'local-storage';

import player from './player';
import traktUtil from './trakt';
import ui from './ui';
import linkSupport from './supportedLinks';
import prebuffering from './prebuffering';
import path from 'path';

import PlayerActions from '../actions';
import ProgressStore from '../components/Controls/components/ProgressBar/store';
import ControlStore from '../components/Controls/store';
import ControlActions from '../components/Controls/actions';
import TimeActions from '../components/Controls/components/HumanTime/actions';
import ProgressActions from '../components/Controls/components/ProgressBar/actions';
import VisibilityActions from '../components/Visibility/actions';
import SubtitleActions from '../components/SubtitleText/actions';
import engineStore from '../../../stores/engineStore';
import torrentUtil from '../../../utils/stream/torrentUtil';
import torrentActions from '../../../actions/torrentActions';
import sources from './sources';

var events = {};

var immuneToEvents = false
var immuneToFix = false

events.buffering = (perc) => {

    var itemDesc = player.itemDesc();
    if (player.secondPlay && perc == 100) {
        player.secondPlay = false;
        _.delay(() => {
            // i don't like it, but if a delay is not set it sometimes bugs
            PlayerActions.updateImage(player.itemDesc().setting.image);
        }, 500);
    }
    var isLocal = (itemDesc.mrl && itemDesc.mrl.indexOf('file://') == 0);
    if (!isLocal) {
        var announcer = {};

        var engineState = engineStore.getState();

        var isTorrent = (engineState.torrents && engineState.infoHash && engineState.torrents[engineState.infoHash] && engineState.torrents[engineState.infoHash].torrent);

        if (isTorrent && !engineState.torrents[engineState.infoHash].torrent.pieces.bank.get().downloaded && perc == 0) {
            announcer.text = 'Prebuffering 0%';
        } else {
            announcer.text = 'Buffering ' + perc + '%';
        }

        var current = player.wcjs.playlist.currentItem;

        if (isTorrent && current > -1 && itemDesc && itemDesc.mrl.startsWith('http://') && typeof itemDesc.setting.streamID !== 'undefined') {
            // check if the file has been completely downloaded
            var engineInstance = engineState.torrents[engineState.infoHash]
            var file = engineInstance.files[itemDesc.setting.streamID]

            if (file) {
                var fileProgress = engineInstance.torrent.pieces.bank.filePercent(file.offset, file.length)

                // if we get freezes on video loading, it may be because we need to stop using
                // this fix when player.wcjs.position == 0

//                if (fileProgress >= 1 && player.wcjs.position) {

                // ^ this was a bug that matched the cache of a different file
                // (unless proven otherwise)

                if (fileProgress >= 1 && !immuneToFix) {
                    // file is completely downloaded, so it shouldn't need to buffer
                    // this is a VLC bug and we'll solve it by switching to the local
                    // file instead of the streaming link
                    console.log('Fixing Excess Buffering Issue')

                    var progressElem = document.querySelector('.wcjs-player .time');
                    progressElem.className = progressElem.className.split(' smooth-progress').join('');

                    immuneToEvents = true
                    _.delay(() => {
                        progressElem.className = progressElem.className + ' smooth-progress';
                        immuneToEvents = false
                    },1000);

                    var progressState = ProgressStore.getState()

                    PlayerActions.replaceMRL({
                        autoplay: true,
                        x: current,
                        mrl: {
                            title: itemDesc.setting.title || itemDesc.title,
                            thumbnail: itemDesc.setting.image,
                            uri: 'file:///' + itemDesc.setting.path,
                            byteSize: itemDesc.setting.byteSize,
                            streamID: itemDesc.setting.streamID,
                            path: itemDesc.setting.path,
                            torrentHash: itemDesc.setting.torrentHash,
                            announce: itemDesc.setting.announce || null
                        }
                    })

                    if (itemDesc.setting && itemDesc.setting.trakt) {
                        var shouldScrobble = traktUtil.loggedIn ? ls.isSet('traktScrobble') ? ls('traktScrobble') : true : false;
                        if (shouldScrobble)
                            traktUtil.handleScrobble('start', itemDesc, progressState.position);
                    }

                    var noAnnounce = true

                }
            }
        }
        clearTimeout(player.announceTimer);

        if (perc === 100) {
            if (!player.announceEffect) {
                announcer.effect = true;
            }
        } else if (player.announceEffect)
            announcer.effect = false;

        if (Object.keys(announcer).length && !noAnnounce)
            player.events.emit('announce', announcer);
    }

}

events.opening = () => {
    
    if (immuneToEvents) return

    PlayerActions.togglePowerSave(true);
    var itemDesc = player.itemDesc();
    var isTorrent = (itemDesc && itemDesc.setting.torrentHash && itemDesc.setting.torrentHash != engineStore.getState().infoHash);
    var isYoutubeDl = (itemDesc.setting.youtubeDL && itemDesc.setting.timestamp < timestamp -1000);
    var isLocal = !isTorrent ? (itemDesc.mrl && itemDesc.mrl.indexOf('file://') == 0) : false;
     

    if (itemDesc.artworkURL && !itemDesc.setting.image) {
        PlayerActions.setDesc({
            image: itemDesc.artworkURL
        })
    }

    var historyStarter = 0;
    if (historyStartAt && historyStartIdx == player.wcjs.playlist.currentItem) {
        if (!isLocal && isYoutubeDl) {
            historyStarter = historyStartAt;
            historyStartAt = 0;
            historyStartIdx = 0;
        } else if (!isLocal) {
            player.wcjs.time = historyStartAt
            // do not reset historyStartAt here, torrent triggers `opening` 2 times
        }
    }

    if (!isLocal) {

        var timestamp = new Date().getTime();

        if (isYoutubeDl) {
            // this is a youtube-dl supported link, let's refresh it to make sure the link didn't expire
            
            var currentItem = player.wcjs.playlist.currentItem;
            window.currentItem = currentItem;
            player.events.emit('playlistUpdate');

            player.wcjs.stop();

            player.wcjs.playlist.mode = 0;

            sources.youtubeDL(itemDesc.setting.originalURL, info => {
                if (window.currentItem == currentItem) {
                    delete window.currentItem;
                    _.defer(() => {
                        PlayerActions.replaceMRL({
                            autoplay: true,
                            autoplayAt: historyStarter,
                            x: currentItem,
                            mrl: {
                                title: info.fulltitle ? info.fulltitle : null,
                                thumbnail: info.thumbnail ? info.thumbnail : null,
                                uri: info.url ? info.url : null,
                                youtubeDL: true
                            }
                        });
                    });
                }
            });

            return;
            
        } else if (isTorrent) {

            window.nextHash = itemDesc.setting.torrentHash;
            
            if (itemDesc.setting.announce)
                window.nextAnnounce = itemDesc.setting.announce;

            if (itemDesc.setting.title)
                window.nextTitle = itemDesc.setting.title;

            window.currentItem = player.wcjs.playlist.currentItem;

            player.wcjs.playlist.mode = 0;

            player.events.emit('playlistUpdate');

            player.wcjs.stop();
            
            var generateMagnet = () => {
                if (window.nextHash) {
                    var mag = 'magnet:?xt=urn:btih:' + window.nextHash
                    if (window.nextTitle)
                        mag += '&dn=' + encodeURIComponent(window.nextTitle.replace(new RegExp(' ', 'g'),'.'))
                    if (window.nextAnnounce && window.nextAnnounce.length)
                        window.nextAnnounce.forEach((el) => {
                            mag += '&tr=' + encodeURIComponent(el)
                        })
                    delete window.nextAnnounce;
                    delete window.nextTitle;
                    return mag
                } else return false
            }

            var callback = () => {
                torrentActions.clear();
                torrentUtil.init(generateMagnet()).then( instance => {
                    var listener = () => {
                        
                        if (instance.infoHash == engineStore.getState().infoHash) {
                            // just soft kill this case to remove duplicates
                            instance.softKill();
                        } else if (instance.infoHash !== window.nextHash) {
                            if (ls('removeLogic') == 2) {
                                instance.kill();
                            } else {
                                instance.softKill();
                            }
                        } else {
                            torrentActions.add(instance);
                            
                            var verified = (downloaded, pieceInfo) => {

                                for (var i = 0; i < player.wcjs.playlist.itemCount; i++) {
                                    var pItemDesc = player.itemDesc(i);
                                    if (pItemDesc.setting && pItemDesc.setting.torrentHash && pItemDesc.setting.torrentHash == window.nextHash) {
                                        if (window.currentItem == i) {
                                            var wNextHash = window.nextHash
                                            var wCurItem = window.currentItem
                                            window.resetPrebufMap = () => {
                                                prebuffering.resetMap(wNextHash, wCurItem)
                                            }
                                        }

                                        if (downloaded) {
                                            var uriToPlay = 'file:///' + pItemDesc.setting.path
                                        } else {

                                            var file = instance.files[pItemDesc.setting.streamID];

                                            var fileProgress = instance.torrent.pieces.bank.filePercent(file.offset, file.length)
                                            if (fileProgress >= 1)
                                                var uriToPlay = 'file:///' + pItemDesc.setting.path
                                            else {
                                                var uriToPlay = 'http://127.0.0.1:' + instance.server.port + '/' + (pItemDesc.setting.streamID || 0)
                                                
                                                if (window.currentItem == i) {
                                                    // this case should never happen, but we set it as a precaution
                                                    // if we get 2 replaceMRL() on the same item in a short time
                                                    // the app freezes
                                                    immuneToFix = true
                                                    _.delay(() => {
                                                        immuneToFix = false
                                                    }, 2000)
                                                }
                                            }
                                        }
    
                                        PlayerActions.replaceMRL({
                                            autoplay: (window.currentItem == i),
                                            x: i,
                                            mrl: {
                                                title: pItemDesc.setting.title,
                                                thumbnail: pItemDesc.setting.image,
                                                uri: uriToPlay,
                                                announce: pItemDesc.setting.announce || null,
                                                byteSize: pItemDesc.setting.byteSize || null,
                                                torrentHash: pItemDesc.setting.torrentHash || null,
                                                streamID: pItemDesc.setting.streamID || null,
                                                path: pItemDesc.setting.path || null
                                            }
                                        })
    
                                    }
                                }
                                delete window.currentItem;
                                delete window.nextHash;
                            }
                            
                            var initVerified = _.once(verified);

                            var engineState = engineStore.getState()

                            var pieceInfo = engineState.torrents[engineState.infoHash].torrent.pieces.bank.get();

                            pieceInfo.ev.on('completed', () => { initVerified(true) })

                            _.delay(() => { initVerified(false, pieceInfo) }, 1000) 
                        }
                    };

                    if (instance.server && instance.server.port) listener();
                    else instance.on('listening', listener);
                })
            }

            var init = _.once(callback);

            var engineState = engineStore.getState();

            if (engineState.torrents[engineState.infoHash]) {
                if (ls('removeLogic') == 2) {
                    engineState.torrents[engineState.infoHash].kill(init);
                } else {
                    engineState.torrents[engineState.infoHash].softKill(init);
                }
                _.delay( init, 1000);
            } else init();

            return;

        }

        var announcer = {};
    
        announcer.text = 'Opening Media';
        clearTimeout(player.announceTimer);
    
        if (player.announceEffect)
            announcer.effect = false;
    
        if (Object.keys(announcer).length)
            player.events.emit('announce', announcer);
            
    }


    if (player.wcjs.playlist.currentItem != player.lastItem) {
        if (player.wcjs.volume != ls('volume'))
            player.wcjs.volume = ls('volume');

        if (player.wcjs.playlist.items[player.wcjs.playlist.currentItem].artworkURL) {
            var image = player.wcjs.playlist.items[player.wcjs.playlist.currentItem].artworkURL;
        } else {
            try {
                var image = JSON.parse(player.wcjs.playlist.items[player.wcjs.playlist.currentItem].setting).image;
            } catch (e) {}
        }

        _.defer(() => {
            PlayerActions.updateImage(image);
        });
        _.delay(() => {
            PlayerActions.updateImage(image);
        }, 1000)

        ProgressActions.settingChange({
            position: 0
        });
        player.events.emit('setTitle', player.wcjs.playlist.items[player.wcjs.playlist.currentItem].title);

        player.set({
            lastItem: player.wcjs.playlist.currentItem,
            pendingFiles: []
        });

    }

}

events.stopped = () => {
    
    if (immuneToEvents) return

    console.log('Player stopped');

    SubtitleActions.settingChange({
        text: ''
    });
    player.events.emit('foundTrakt', false);
    PlayerActions.togglePowerSave(false);
}

var historyStartAt = 0;
var historyStartIdx = 0;

var processingHist = false

window.processHistory = () => {
    var savedHistory = ls('savedHistory');

    if (savedHistory && savedHistory.length) {
        processingHist = false
        if (player.wcjs && player.wcjs.playlist && (savedHistory.length == player.wcjs.playlist.itemCount || savedHistory[0].currentHash)) {
           
            player.events.emit('announce', { text: '', effect: false })

            var currentItem = savedHistory[0].currentItem
            var match1 = false
            var match2 = false
            var saved = savedHistory[currentItem]
            var itemDesc = player.itemDesc(currentItem)

            if (saved.title == itemDesc.title) match1 = true
            if (saved.mrl == itemDesc.mrl || saved.originalURL == itemDesc.mrl) match2 = true
            if (!match1 && !match2) {
                for (var jk = 0; ((jk < player.wcjs.playlist.itemCount) && !match1 && !match2); jk++) {
                    var itemDesc = player.itemDesc(jk)
                    if (saved.title == itemDesc.title) match1 = true
                    if (saved.mrl == itemDesc.mrl || saved.originalURL == itemDesc.mrl) match2 = true
                    if (match1 || match2) currentItem = jk
                }
            }

            player.wcjs.playlist.playItem(currentItem);
            player.wcjs.time = savedHistory[0].currentTime;
            historyStartAt = savedHistory[0].currentTime;
            historyStartIdx = currentItem
            ls('savedHistory', null);
        } else {
            if (player.wcjs && player.wcjs.input && player.wcjs.input.state != 5) player.wcjs.stop()
            if (player.wcjs && player.wcjs.playlist)
                player.events.emit('announce', { text: 'Loading History ' + Math.round((player.wcjs.playlist.itemCount / savedHistory.length) * 100) + '%', effect: false })
            processingHist = setTimeout(window.processHistory, 500);
        }
    }
}

window.stopProcessHistory = function() {
    if (processingHist) {
        clearTimeout(processingHist)
        processingHist = false
    }
    ls('savedHistory', null)
}

events.playing = () => {

    if (historyStartAt || historyStartIdx) {
        historyStartAt = 0
        historyStartIdx = 0
    }

    setTimeout(function() { player.events.emit('fixAnnouncer', {}) }, 700)

    if (processingHist) stopProcessHistory()
    
    if (immuneToEvents) {

        PlayerActions.togglePowerSave(true);
    
        player.wcjs.playlist.mode = 1;

        player.wcjs.subtitles.track = 0;

        player.fields.audioTrack.value = player.wcjs.audio[1];

        return
    }

    PlayerActions.togglePowerSave(true);

    player.wcjs.playlist.mode = 1;

    player.events.emit('playlistUpdate');

    if (!player.firstPlay) {

        player.secondPlay = true;

        // i hate this, but otherwise it bugs
        var itemDesc = player.itemDesc()
        if (itemDesc && itemDesc.setting && itemDesc.setting.image) {
            _.delay(() => {
                itemDesc = player.itemDesc()
                if (itemDesc && itemDesc.setting && itemDesc.setting.image)
                    PlayerActions.updateImage(player.itemDesc().setting.image);
            }, 500);
    
            _.delay(() => {
                itemDesc = player.itemDesc()
                if (itemDesc && itemDesc.setting && itemDesc.setting.image)
                    PlayerActions.updateImage(player.itemDesc().setting.image);
            }, 1000);
    
            _.delay(() => {
                itemDesc = player.itemDesc()
                if (itemDesc && itemDesc.setting && itemDesc.setting.image)
                    PlayerActions.updateImage(player.itemDesc().setting.image);
            }, 1500);
    
            // still saw this god forsaken bug on osx, adding one more
            _.delay(() => {
                itemDesc = player.itemDesc()
                if (itemDesc && itemDesc.setting && itemDesc.setting.image)
                    PlayerActions.updateImage(player.itemDesc().setting.image);
            }, 3000);
        }

        // catch first play event
        prebuffering.end();

        player.wcjs.subtitles.track = 0;
            
        player.set({
            firstPlay: true
        });
        player.events.emit('setTitle', player.wcjs.playlist.items[player.wcjs.playlist.currentItem].title);
        var itemDesc = player.itemDesc();
        if (itemDesc.setting && itemDesc.setting.trakt && !player.foundTrakt) {
            player.events.emit('foundTrakt', true);
            var shouldScrobble = traktUtil.loggedIn ? ls.isSet('traktScrobble') ? ls('traktScrobble') : true : false;
            if (shouldScrobble) {
                traktUtil.handleScrobble('start', itemDesc, player.wcjs.position);
                if (!ls.isSet('playerNotifs') || ls('playerNotifs'))
                    player.notifier.info('Scrobbling', '', 4000);
            }
        }

        var itemMrl = itemDesc.mrl

        var itemDesc = itemDesc.setting;

        if (itemDesc.subtitles) {
            ControlActions.settingChange({ foundSubs: true });
            SubtitleActions.foundSubs(itemDesc.subtitles, false);
        } else if (itemDesc.path && (!ls.isSet('findSubs') || ls('findSubs'))) {
            SubtitleActions.findSubs(itemDesc);
        } else if (itemMrl && window.getExtendedDetails && (!ls.isSet('findSubs') || ls('findSubs'))) {
            setTimeout(function() {
                itemDesc = player.itemDesc().setting
                SubtitleActions.findSubs(itemDesc);
            }, 2000) // give some time for itemDesc.parsed to finish
        }

        if (window.clSub) {
            // if subtitle command line arg set, load it
            var subs = player.itemDesc().setting.subtitles || {};
            subs[path.basename(window.clSub)] = window.clSub;
            PlayerActions.setDesc({
                subtitles: subs
            });
            player.wcjs.subtitles.track = 0;
            SubtitleActions.loadSub(window.clSub);
            SubtitleActions.settingChange({
                selectedSub: _.size(subs) + (player.wcjs.subtitles.count || 1),
            });
            player.notifier.info('Subtitle Loaded', '', 3000);

            delete window.clSub;
        }

    } else {
        var itemDesc = player.itemDesc();
        if (itemDesc.setting && itemDesc.setting.trakt) {
            var shouldScrobble = traktUtil.loggedIn ? ls.isSet('traktScrobble') ? ls('traktScrobble') : true : false;
            if (shouldScrobble)
                traktUtil.handleScrobble('start', itemDesc, player.wcjs.position);
        }
    }

    player.fields.audioTrack.value = player.wcjs.audio[1];
    player.events.emit('controlsUpdate');
}

events.paused = () => {
    player.events.emit('playlistUpdate');
    player.events.emit('controlsUpdate');
    traktUtil.handleScrobble('pause', player.itemDesc(), player.wcjs.position);
    PlayerActions.togglePowerSave(false);
}

events.resetUI = () => {

    ControlActions.settingChange({
        foundSubs: false
    });
    TimeActions.settingChange({
        currentTime: '00:00',
        totalTime: '00:00',
        length: 0
    });
    ProgressActions.settingChange({
        position: 0,
        cache: 0
    });
    SubtitleActions.settingChange({
        subtitle: [],
        selectedSub: 1,
        trackSub: -1,
        text: ''
    });
    player.events.emit('resizeNow', {
        aspect: 'Default',
        crop: 'Default',
        zoom: 1
    });
    player.events.emit('foundTrakt', false);
}

events.mediaChanged = () => {

    if (immuneToEvents) return

    prebuffering.end();
    if (window.resetPrebufMap) {
        window.resetPrebufMap()
        delete window.resetPrebufMap
    }
    prebuffering.start(player);

    events.resetUI();

    VisibilityActions.settingChange({
        subtitles: false
    });
    player.set({
        foundTrakt: false,
        firstPlay: false,
        audioChannel: 1,
        audioTrack: 1
    });

    ui.defaultSettings();

    player.events.emit('playlistUpdate');
    
    player.events.emit('setTitle', player.wcjs.playlist.items[player.wcjs.playlist.currentItem].title);

}

events.error = () => {

    console.log('Player encountered an error.');

    var itemDesc = player.itemDesc();

    traktUtil.handleScrobble('stop', itemDesc, player.wcjs.position);
    
    PlayerActions.togglePowerSave(false);

    console.log(itemDesc);

}

events.ended = () => {
    console.log('Playback ended');

    var position = ProgressStore.getState().position || player.wcjs.position;

    player.events.emit('foundTrakt', false);
    traktUtil.handleScrobble('stop', player.itemDesc(), position);
    
    if (player.wcjs.time > 0) {
        if (typeof player.lastItem !== 'undefined' && position && position < 0.95) {

            console.log('Playback Ended Prematurely');
            console.log('Last Known Position: ', position);
            console.log('Last Known Item: ', player.lastItem);
            console.log('Reconnecting ...');

            player.wcjs.playlist.currentItem = player.lastItem;
            player.wcjs.playlist.play();
            player.wcjs.position = position;
        }
    }
    PlayerActions.togglePowerSave(false);
}

events.close = () => {

    events.resetUI();

    VisibilityActions.settingChange({
        uiShown: true,
        playlist: false,
        subtitles: false,
        settings: false
    });
    player.events.emit('setTitle', '');

    if (ControlStore.getState().fullscreen)
        ControlActions.toggleFullscreen();

    player.set({
        pendingFiles: [],
        files: [],
        audioChannel: 1,
        audioTrack: 1,
        lastItem: -1
    });

    ui.defaultSettings();
    if (player.wcjs) {
        traktUtil.handleScrobble('stop', player.itemDesc(), player.wcjs.position);
        player.wcjs.stop();
        player.wcjs.playlist.clear();
    }
    PlayerActions.togglePowerSave(false);

}

module.exports = events;