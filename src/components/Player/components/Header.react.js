import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import {
    History
}
from 'react-router';

import PlayerStore from '../store';
import PlayerActions from '../actions';
import VisibilityStore from './Visibility/store';
import ModalActions from './Modal/actions';
import {
    ipcRenderer
}
from 'electron';
import BaseModalActions from '../../Modal/actions';
import torrentActions from '../../../actions/torrentActions';
import engineStore from '../../../stores/engineStore';
import ls from 'local-storage';
import ui from '../utils/ui';
import player from '../utils/player';
import events from '../utils/events';
import _ from 'lodash';
import LinkSupport from './../utils/supportedLinks';

export
default React.createClass({

    mixins: [History, PureRenderMixin],

    getInitialState() {
        var visibilityState = VisibilityStore.getState();
        return {
            title: '',
            uiShown: visibilityState.uiShown && !visibilityState.playlist && !visibilityState.settings,
            uiHidden: visibilityState.uiHidden,
            playlistOpen: visibilityState.playlist,
            settingsOpen: visibilityState.settings,
            foundTrakt: false
        }
    },
    componentWillMount() {
        VisibilityStore.listen(this.update);
        player.events.on('foundTrakt', this.showTrakt);
        player.events.on('setTitle', this.setTitle);
    },
    componentWillUnmount() {
        VisibilityStore.unlisten(this.update);
        player.events.removeListener('foundTrakt', this.showTrakt);
        player.events.removeListener('setTitle', this.setTitle);
    },
    update() {
        if (this.isMounted()) {
//            console.log('header update');
            var visibilityState = VisibilityStore.getState();
            this.setState({
                uiShown: visibilityState.uiShown && !visibilityState.playlist && !visibilityState.settings,
                uiHidden: visibilityState.uiHidden,
                playlistOpen: visibilityState.playlist,
                settingsOpen: visibilityState.settings
            });
        }
    },
    showTrakt(state) {
        this.setState({
            foundTrakt: state
        });
        player.set({
            foundTrakt: state
        });
    },
    setTitle(title) {
        this.setState({
            title: title
        });
    },
    handleClose() {

        var Linky = new LinkSupport;
        Linky.stopParsing();
        
        var engineState = engineStore.getState();
        
        player.wcjs.stop();
        player.wcjs.playlist.clear();
        
        if (engineState.infoHash && engineState.torrents[engineState.infoHash]) {
            // it's a torrent, let's see if we should remove the files
            if (ls('removeLogic') < 1) {
                BaseModalActions.shouldExit(false);
                BaseModalActions.open({ type: 'askRemove' });
            } else {
                var torrent = engineState.torrents[engineState.infoHash];
    
                if (ls('removeLogic') == 1) {
                    torrent.kill();
                } else if (ls('removeLogic') == 2) {
                    torrent.softKill();
                }
                torrentActions.clear();
                events.close();
                this.history.replaceState(null, '');
            }
        } else {

            events.close();
            this.history.replaceState(null, '');
            
        }
    },
    handleOpenTrakt() {
        ModalActions.open({
            title: 'Trakt Info',
            type: 'TraktInfo',
            theme: 'DarkRawTheme'
        });
    },
    handleOpenSettings() {

        ui.toggleMenu('settings');
        
        // this is a hack to show the underline for the settings menu tabs
        _.defer(() => {
            Polymer.dom().querySelector('paper-tabs').notifyResize();
        });
    },
    handleOpenDashboard() {
        document.querySelector('.mini-menu').style.display = 'none';

        player.saveState = {
            idx: player.wcjs.playlist.currentItem,
            position: player.wcjs.position
        };

        player.wcjs.stop();

        this.history.replaceState(null, 'torrentDashboard');
    },
    render() {
        return (
            <div>
                <div className={this.state.uiHidden ? 'header' : this.state.playlistOpen ? 'header playlist-head' : this.state.settingsOpen ? 'header settings-head' : this.state.uiShown ? 'header show' : 'header'}>
                    <paper-icon-button id="playerMainBack" onClick={this.handleClose} className="player-close" icon={'arrow-back'} noink={true} />
                    <paper-tooltip for="playerMainBack" offset="0" id="playerBackTooltip">Main Menu</paper-tooltip>
    
                    <p className="title" style={{width: 'calc(100% - '+(this.state.foundTrakt ? '202' : '155')+'px)'}}>{this.state.title}</p>
    
                    <paper-icon-button id="playerPlaylistBut" onClick={ui.toggleMenu.bind(null, 'playlist')} className="player-playlist" icon={'av:playlist-add-check'} noink={true} />
                    <paper-tooltip for="playerPlaylistBut" offset="0">Playlist</paper-tooltip>
    
                    <paper-icon-button id="playerSetBut" className="dropdown-trigger player-settings" icon={'image:tune'} noink={true} onClick={this.handleOpenSettings} />
                    <paper-tooltip for="playerSetBut" offset="0">Settings</paper-tooltip>
    
    
                    <paper-icon-button id="traktBut" onClick={this.handleOpenTrakt} className="trakt-info" src="./images/trakt-logo.png" style={{ display: this.state.foundTrakt ? 'block' : 'none' }} noink={true} />
                    <paper-tooltip for="traktBut" offset="0">Trakt Info</paper-tooltip>
    
                </div>
            </div>
        );
    }
});