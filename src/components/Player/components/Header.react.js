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
import ui from '../utils/ui';
import player from '../utils/player';
import events from '../utils/events';
import _ from 'lodash';

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
        events.close();
        this.history.replaceState(null, '');
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
    render() {
        return (
            <div className={this.state.uiHidden ? 'header' : this.state.playlistOpen ? 'header playlist-head' : this.state.settingsOpen ? 'header settings-head' : this.state.uiShown ? 'header show' : 'header'}>
                <paper-icon-button id="playerMainBack" onClick={this.handleClose} className="player-close" icon={'arrow-back'} noink={true} />
                <paper-tooltip for="playerMainBack" offset="0" id="playerBackTooltip">Main Menu</paper-tooltip>

                <p className="title" style={{width: 'calc(100% - '+(this.state.foundTrakt ? '202' : '155')+'px)'}}>{this.state.title}</p>

                <paper-icon-button id="playerPlaylistBut" onClick={ui.toggleMenu.bind(null, 'playlist')} className="player-playlist" icon={'av:playlist-add-check'} noink={true} />
                <paper-tooltip for="playerPlaylistBut" offset="0">Playlist</paper-tooltip>

                <paper-icon-button id="playerSetBut" onClick={this.handleOpenSettings} className="player-settings" icon={'image:tune'} noink={true} />
                <paper-tooltip for="playerSetBut" offset="0">Player Settings</paper-tooltip>


                <paper-icon-button id="traktBut" onClick={this.handleOpenTrakt} className="trakt-info" src="./images/trakt-logo.png" style={{ display: this.state.foundTrakt ? 'block' : 'none' }} noink={true} />
                <paper-tooltip for="traktBut" offset="0">Trakt Info</paper-tooltip>

            </div>
        );
    }
});