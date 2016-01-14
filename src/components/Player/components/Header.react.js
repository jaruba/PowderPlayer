import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import {
    History
}
from 'react-router';
import {
    IconButton
}
from 'material-ui';

import PlayerStore from '../store';
import PlayerActions from '../actions';
import VisibilityStore from './Visibility/store';
import ModalActions from '../../Modal/dark/actions';
import ui from '../utils/ui';
import config from '../utils/config';

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
        PlayerStore.getState().events.on('foundTrakt', this.showTrakt);
        PlayerStore.getState().events.on('setTitle', this.setTitle);
    },
    componentWillUnmount() {
        VisibilityStore.unlisten(this.update);
        PlayerStore.getState().events.removeListener('foundTrakt', this.showTrakt);
        PlayerStore.getState().events.removeListener('setTitle', this.setTitle);
    },
    update() {
        if (this.isMounted()) {
            console.log('header update');
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
        config.set({
            foundTrakt: state
        });
    },
    setTitle(title) {
        this.setState({
            title: title
        });
    },
    handleClose() {
        PlayerActions.close();
        this.history.replaceState(null, '');
    },
    handleOpenSettings() {
        ModalActions.open({
            title: 'Player Settings',
            type: 'player-settings',
            theme: 'DarkRawTheme'
        });
    },
    handleOpenTrakt() {
        ModalActions.open({
            title: 'Trakt Info',
            type: 'TraktInfo',
            theme: 'DarkRawTheme'
        });
    },
    handleOpenPlaylist() {


    },
    render() {
        return (
            <div className={this.state.uiHidden ? 'header' : this.state.playlistOpen ? 'header playlist-head' : this.state.settingsOpen ? 'header settings-head' : this.state.uiShown ? 'header show' : 'header'}>
                <IconButton onClick={this.handleClose} iconClassName="material-icons" iconStyle={{color: 'white', fontSize: '40px'}} tooltipPosition="bottom-right" tooltip="Main Menu" className="player-close" >arrow_back</IconButton>
                <p className="title" style={{width: 'calc(100% - '+(this.state.foundTrakt ? '202' : '155')+'px)'}}>{this.state.title}</p> 
                <IconButton onClick={ui.toggleMenu.bind(null, 'playlist')} iconClassName="material-icons" className="player-playlist" iconStyle={{color: 'white', fontSize: '30px', right: '-2px', top: '-1px'}} tooltipPosition="bottom-center" tooltip="Playlist">playlist_add_check</IconButton>
                <IconButton onClick={ui.toggleMenu.bind(null, 'settings')} iconClassName="material-icons" iconStyle={{color: 'white', fontSize: '23px'}} tooltipPosition="bottom-center" tooltip="Player Settings" className="player-settings">tune</IconButton>
                <IconButton onClick={this.handleOpenTrakt} iconClassName="material-icons" iconStyle={{color: 'white', fontSize: '23px'}} tooltipPosition="bottom-center" tooltip="Trakt Info" className="trakt-info" style={{ display: this.state.foundTrakt ? 'block' : 'none' }}></IconButton>
            </div>
        );
    }
});