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
import ModalActions from '../../Modal/actions';


export
default React.createClass({

    mixins: [History, PureRenderMixin],

    getInitialState() {
        return {
            title: PlayerStore.getState().title,
            uiShown: PlayerStore.getState().uiShown && !PlayerStore.getState().playlistOpen
        }
    },
    componentWillMount() {
        PlayerStore.listen(this.update);
    },
    componentWillUnmount() {
        PlayerStore.unlisten(this.update);
    },
    update() {
        if (this.isMounted()) {
            this.setState({
                title: PlayerStore.getState().title,
                uiShown: PlayerStore.getState().uiShown && !PlayerStore.getState().playlistOpen
            });
        }
    },
    handleClose() {
        PlayerActions.close();
        this.history.replaceState(null, '');
    },
    handleOpenSettings() {
        ModalActions.open({
            title: 'Player Settings',
            type: 'player-settings'
        });
    },
    handleOpenPlaylist() {


    },
    render() {
        return (
            <div className={this.state.uiShown ? 'header show' : 'header'}>
                <IconButton onClick={this.handleClose} iconClassName="material-icons" iconStyle={{color: 'white', fontSize: '40px'}} tooltipPosition="bottom-right" tooltip="Main Menu" className="player-close" >arrow_back</IconButton>
                <p className="title">{this.state.title}</p> 
                <IconButton onClick={PlayerActions.openPlaylist} iconClassName="material-icons" className="player-playlist" iconStyle={{color: 'white', fontSize: '30px', right: '-2px', top: '-1px'}} tooltipPosition="bottom-center" tooltip="Playlist">playlist_add_check</IconButton>
                <IconButton onClick={this.handleOpenSettings} iconClassName="material-icons" iconStyle={{color: 'white', fontSize: '23px'}} tooltipPosition="bottom-center" tooltip="Player Settings" className="player-settings">tune</IconButton>
            </div>
        );
    }
});