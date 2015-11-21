import React from 'react';
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


export
default React.createClass({

    mixins: [History],

    getInitialState() {
        return {
            title: PlayerStore.getState().title,
            uiShown: PlayerStore.getState().uiShown
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
                uiShown: PlayerStore.getState().uiShown
            });
        }
    },
    handleClose() {
        PlayerActions.close();
        this.history.replaceState(null, '');
    },
    handleOpenPlaylist() {


    },
    render() {
        return (
            <div className={this.state.uiShown ? 'header show' : 'header'}>
                <IconButton onClick={this.handleClose} iconClassName="material-icons" iconStyle={{color: 'white', fontSize: '40px'}} className="player-close" >arrow_back</IconButton>
                <p className="title">{this.state.title}</p> 
                <IconButton onClick={this.handleOpenPlaylist} iconClassName="material-icons" className="player-playlist" iconStyle={{color: 'white', fontSize: '30px', right: '-2px', top: '-1px'}} tooltipPosition="bottom-center" tooltip="Playlist">playlist_add_check</IconButton>
                <IconButton iconClassName="material-icons" iconStyle={{color: 'white', fontSize: '23px'}} tooltipPosition="bottom-center" tooltip="Player Settings" className="player-settings">tune</IconButton>
            </div>
        );
    }
});