import _ from 'lodash';
import ipc from 'ipc';
import ls from 'local-storage';
import {handleTime} from './utils/time';
import alt from '../../alt';
import playerActions from './actions';
import ControlActions from './components/Controls/actions';
import SubtitleActions from './components/SubtitleText/actions';
import needle from 'needle';
import traktUtil from './utils/trakt';
import LinkSupport from './utils/supportedLinks';
import events from 'events';
import ui from './utils/ui';

class playerStore {

    constructor() {
        this.bindActions(playerActions);

        this.uri = false;
        this.title = '';
        this.wcjs = false;

        this.playing = false;
        this.paused = false;

        this.alwaysOnTop = false;
        this.clickPause = ls.isSet('clickPause') ? ls('clickPause') : false;
        this.rippleEffects = ls.isSet('playerRippleEffects') ? ls('playerRippleEffects') : true;

        this.buffering = false;
        this.seekable = false;

        this.pendingFiles = [];
        this.files = [];
        this.playlist = {};

        this.fullscreen = false;
        this.uiShown = true;
        this.uiHidden = false;
        this.playlistOpen = false;
        this.subtitlesOpen = false;
        this.settingsOpen = false;

        this.itemDesc = i => {
            return false
        };

        this.firstPlay = false;

        this.foundTrakt = false;

        this.fontSize = 21.3;

        this.foundSubs = false;

        this.audioDelay = 0;
        this.audioTrack = 1;

        this.notifier = false;

        this.announce = '';
        this.announceEffect = '';

        this.speed = 1;

        this.aspectRatio = 'Default';
        this.crop = 'Default';
        this.zoom = 1;

        this.events = new events.EventEmitter();
    }

    onSettingChange(setting) {
        this.setState(setting);
    }

    onWcjsInit(wcjs) {
        this.setState({
            wcjs: wcjs,
            itemDesc: i => {
                if (typeof i === 'undefined') i = wcjs.playlist.currentItem;
                if (typeof i === 'number') {
                    if (i > -1 && i < wcjs.playlist.items.count) {
                        var wjsDesc = Object.assign({}, wcjs.playlist.items[i]);
                        if (!wjsDesc.setting) wjsDesc.setting = "{}";
                        wjsDesc.setting = JSON.parse(wjsDesc.setting);
                        return wjsDesc;
                    }
                }
                return false;
            }
        });
    }
    
    onToggleMenu(menu) {
        var obj = {
            playlistOpen: false,
            settingsOpen: false,
            subtitlesOpen: false
        };
        obj[menu + 'Open'] = !this[menu + 'Open'];
        this.setState(obj);
    }

    onUiShown(toggle) {
        this.setState({
            uiShown: toggle
        });
    }

    onFullscreen(state) {
        this.setState({
            fullscreen: state
        });
    }

    onSeekable(state) {
        this.setState({
            seekable: state
        });
    }

    onBuffering(perc) {
        var itemDesc = this.itemDesc();
        var isLocal = (itemDesc.mrl && itemDesc.mrl.indexOf('file://') == 0);
        if (!isLocal) {
            var announcer = {};
            announcer.announce = 'Buffering ' + perc + '%';
            clearTimeout(this.announceTimer);

            if (perc === 100) {
                announcer.buffering = false;
                if (!this.announceEffect)
                    announcer.announceEffect = true;
            } else {
                announcer.buffering = perc;
                if (this.announceEffect)
                    announcer.announceEffect = false;
            }

            if (Object.keys(announcer).length)
                this.setState(announcer);
        }

    }

    onAnnouncement(obj) {

        var announcer = {};
        if (typeof obj === 'string') obj = {
            text: obj
        };
        announcer.announce = obj.text;
        if (!obj.delay) obj.delay = 2000;

        clearTimeout(this.announceTimer);
        var playerState = this;
        announcer.announceTimer = setTimeout(() => {
            if (!playerState.announceEffect)
                playerState.setState({
                    announceEffect: !playerState.announceEffect
                });
        }, obj.delay);

        if (this.announceEffect)
            announcer.announceEffect = false;

        if (Object.keys(announcer).length)
            this.setState(announcer);
    }

    onOpening() {

        if (this.wcjs.playlist.currentItem != this.lastItem) {
            if (this.wcjs.playlist.items[this.wcjs.playlist.currentItem].artworkURL) {
                var image = this.wcjs.playlist.items[this.wcjs.playlist.currentItem].artworkURL;
            } else {
                try {
                    var image = JSON.parse(this.wcjs.playlist.items[this.wcjs.playlist.currentItem].setting).image;
                } catch (e) {}
            }

            _.delay(() => {
                playerActions.updateImage(image);
            });

            this.setState({
                title: this.wcjs.playlist.items[this.wcjs.playlist.currentItem].title,
                lastItem: this.wcjs.playlist.currentItem,
                position: 0,
                pendingFiles: []
            });
        }

    }

    onStopped() {
        console.log('Player stopped');

        _.defer(() => {
            SubtitleActions.settingChange({
                text: ''
            });
        });

        this.setState({
            buffering: false,
            playing: false,
            paused: false,
            foundTrakt: false
        });
    }

    onPlaying() {
        if (!this.firstPlay) {
            // catch first play event
            this.wcjs.subtitles.track = 0;
            if (this.wcjs.volume != ls('volume'))
                this.wcjs.volume = ls('volume');
            var newObj = {
                title: this.wcjs.playlist.items[this.wcjs.playlist.currentItem].title,
                firstPlay: true,
                buffering: false,
                playing: true,
                paused: false
            };
            var itemDesc = this.itemDesc();
            if (itemDesc.setting && itemDesc.setting.trakt && !this.foundTrakt) {
                newObj.foundTrakt = true;
                var shouldScrobble = traktUtil.loggedIn ? ls.isSet('traktScrobble') ? ls('traktScrobble') : true : false;
                if (shouldScrobble) {
                    traktUtil.handleScrobble('start', itemDesc, this.wcjs.position);
                    if (!ls.isSet('playerNotifs') || ls('playerNotifs'))
                        this.notifier.info('Scrobbling', '', 4000);
                }
            }
            this.setState(newObj);

            var itemDesc = itemDesc.setting;

            if (itemDesc.subtitles) {
                this.setState({
                    foundSubs: true
                });
            } else if (itemDesc.path && (!ls.isSet('findSubs') || ls('findSubs'))) {
                SubtitleActions.findSubs(itemDesc);
            }

        } else {
            traktUtil.handleScrobble('start', this.itemDesc(), this.wcjs.position);
        }
        this.audioTrackField.refs['input'].defaultValue = this.wcjs.audio[1];
    }

    onPaused() {
        traktUtil.handleScrobble('pause', this.itemDesc(), this.wcjs.position);
    }

    onMediaChanged() {
        _.defer(() => {
            ControlActions.settingChange({
                position: 0,
                totalTime: '00:00'
            });
        });

        _.defer(() => {
            SubtitleActions.settingChange({
                subtitle: [],
                selectedSub: 1,
                trackSub: -1,
                text: ''
            });
        });

        this.setState({
            firstPlay: false,
            foundSubs: false,
            subtitlesOpen: false,
            audioChannel: 1,
            audioTrack: 1,
            aspectRatio: 'Default',
            crop: 'Default',
            zoom: 1
        });

        ui.defaultSettings();
    }

    onPlay() {
        this.setState({
            buffering: false,
            playing: true,
            paused: false
        })
        this.wcjs.play();
    }

    onPlayItem(idx) {
        this.setState({
            buffering: false,
            foundTrakt: false
        })

        traktUtil.handleScrobble('stop', this.itemDesc(), this.wcjs.position);

        this.wcjs.playlist.playItem(idx[0]);
    }

    onPause() {
        this.setState({
            buffering: false,
            playing: false,
            paused: true
        })
        this.wcjs.pause();

        traktUtil.handleScrobble('pause', this.itemDesc(), this.wcjs.position);
    }

    onPrev() {
        if (this.wcjs.playlist.currentItem > 0) {
            _.defer(() => {
                ControlActions.settingChange({
                    position: 0
                });
            });
            this.setState({
                lastItem: -1,
                foundTrakt: false
            });

            traktUtil.handleScrobble('stop', this.itemDesc(), this.wcjs.position);

            this.wcjs.playlist.prev();
        }
    }

    onNext() {
        if (this.wcjs.playlist.currentItem + 1 < this.wcjs.playlist.items.count) {
            _.defer(() => {
                ControlActions.settingChange({
                    position: 0
                });
            });
            this.setState({
                lastItem: -1,
                foundTrakt: false
            });

            traktUtil.handleScrobble('stop', this.itemDesc(), this.wcjs.position);

            this.wcjs.playlist.next();
        }
    }

    onError() {

        console.log('Player encountered an error.');

        var itemDesc = this.itemDesc();

        traktUtil.handleScrobble('stop', itemDesc, this.wcjs.position);

        if (itemDesc.mrl.startsWith('https://player.vimeo.com/')) {

            // fix vimeo links on vlc 2.2.1
            
            var Linky = new LinkSupport;
            
            Linky.fixVimeo(this.wcjs, this.lastItem, itemDesc);

        }

    }

    onSetAudioDelay(newDelay) {
        this.wcjs.audio.delay = newDelay;
        this.setState({
            audioDelay: newDelay
        });
    }

    onSetRate(newRate) {
        this.wcjs.input.rate = newRate;
        this.setState({
            rate: newRate
        });
    }

    onEnded() {
        console.log('Playback ended');

        this.setState({
            foundTrakt: false
        });

        var position = ControlStore.getState().position;

        traktUtil.handleScrobble('stop', this.itemDesc(), position);
        
        if (this.wcjs.time > 0) {
            if (typeof this.lastItem !== 'undefined' && position && position < 0.95) {

                console.log('Playback Ended Prematurely');
                console.log('Last Known Position: ', position);
                console.log('Last Known Item: ', this.lastItem);
                console.log('Reconnecting ...');

                this.wcjs.playlist.currentItem = this.lastItem;
                this.wcjs.playlist.play();
                this.wcjs.position = position;
            }
        }
    }

    onClose() {
        _.defer(() => {
            ControlActions.settingChange({
                length: 0,
                position: 0,
                volume: 100,
                currentTime: '00:00',
                totalTime: '00:00',
            });
        });
        
        _.defer(() => {
            SubtitleActions.settingChange({
                subtitle: [],
                trackSub: -1,
                selectedSub: 1,
                text: ''
            });
        });

        this.setState({
            playing: false,
            paused: false,
            buffering: false,

            title: '',
            fullscreen: false,
            uiShown: true,
            uri: false,

            lastItem: -1,

            pendingFiles: [],

            foundSubs: false,

            audioChannel: 1,
            audioTrack: 1,

            playlistOpen: false,
            subtitlesOpen: false,
            settingsOpen: false,

            aspectRatio: 'Default',
            crop: 'Default',
            zoom: 1
        });

        ui.defaultSettings();

        if (this.wcjs) {

            traktUtil.handleScrobble('stop', this.itemDesc(), this.wcjs.position);

            this.wcjs.stop();
            this.wcjs.playlist.clear();
        }
        playerActions.togglePowerSave(false);
    }

}

export
default alt.createStore(playerStore);