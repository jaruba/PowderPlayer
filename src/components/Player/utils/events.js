import _ from 'lodash';
import ls from 'local-storage';

import player from './player';
import traktUtil from './trakt';
import ui from './ui';
import linkSupport from './supportedLinks';

import PlayerActions from '../actions';
import ProgressStore from '../components/Controls/components/ProgressBar/store';
import ControlStore from '../components/Controls/store';
import ControlActions from '../components/Controls/actions';
import TimeActions from '../components/Controls/components/HumanTime/actions';
import ProgressActions from '../components/Controls/components/ProgressBar/actions';
import VisibilityActions from '../components/Visibility/actions';
import SubtitleActions from '../components/SubtitleText/actions';

var events = {};

events.buffering = (perc) => {
    var itemDesc = player.itemDesc();
    var isLocal = (itemDesc.mrl && itemDesc.mrl.indexOf('file://') == 0);
    if (!isLocal) {
        var announcer = {};
        announcer.text = 'Buffering ' + perc + '%';
        clearTimeout(player.announceTimer);

        if (perc === 100) {
            if (!player.announceEffect) {
                announcer.effect = true;
            }
        } else if (player.announceEffect)
            announcer.effect = false;

        if (Object.keys(announcer).length)
            player.events.emit('announce', announcer);
    }

}

events.opening = () => {

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

//        _.defer(() => {
            PlayerActions.updateImage(image);
            ControlActions.settingChange({
                position: 0
            });
            player.events.emit('setTitle', player.wcjs.playlist.items[player.wcjs.playlist.currentItem].title);
//        });

        player.set({
            lastItem: player.wcjs.playlist.currentItem,
            pendingFiles: []
        });

    }

}

events.stopped = () => {
    console.log('Player stopped');

    SubtitleActions.settingChange({
        text: ''
    });
    player.events.emit('foundTrakt', false);
}

events.playing = () => {
//    console.log(3);
    if (!player.firstPlay) {
//    console.log(4);
        // catch first play event
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

        var itemDesc = itemDesc.setting;

        if (itemDesc.subtitles) {
            ControlActions.settingChange({ foundSubs: true });
            SubtitleActions.foundSubs(itemDesc.subtitles, false);
        } else if (itemDesc.path && (!ls.isSet('findSubs') || ls('findSubs')))
            SubtitleActions.findSubs(itemDesc);

    } else {
        var itemDesc = player.itemDesc();
        if (itemDesc.setting && itemDesc.setting.trakt) {
            var shouldScrobble = traktUtil.loggedIn ? ls.isSet('traktScrobble') ? ls('traktScrobble') : true : false;
            if (shouldScrobble)
                traktUtil.handleScrobble('start', itemDesc, player.wcjs.position);
        }
    }

    player.fields.audioTrack.refs['input'].value = player.wcjs.audio[1];
    player.events.emit('controlsUpdate');
}

events.paused = () => {
    player.events.emit('controlsUpdate');
    traktUtil.handleScrobble('pause', player.itemDesc(), player.wcjs.position);
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
        position: 0
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
}

events.error = () => {

    console.log('Player encountered an error.');

    var itemDesc = player.itemDesc();

    traktUtil.handleScrobble('stop', itemDesc, player.wcjs.position);

    if (itemDesc.mrl.startsWith('https://player.vimeo.com/')) {

        // fix vimeo links on vlc 2.2.1
        
        var Linky = new LinkSupport;
        
        Linky.fixVimeo(player.wcjs, player.lastItem, itemDesc);

    }

}

events.ended = () => {
    console.log('Playback ended');

    var position = ProgressStore.getState().position;

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