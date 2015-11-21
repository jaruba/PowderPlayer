import React from 'react';
import {
    IconButton
}
from 'material-ui';


import PlayerStore from '../store';
import PlayerActions from '../actions';

export
default React.createClass({
    getInitialState() {
        return {
            playing: PlayerStore.getState().playing,
            fullscreen: PlayerStore.getState().fullscreen,
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
        this.setState({
            playing: PlayerStore.getState().playing,
            fullscreen: PlayerStore.getState().fullscreen,
            uiShown: PlayerStore.getState().uiShown
        });
    },
    handlePausePlay() {
        this.state.playing ? PlayerActions.pause() : PlayerActions.play();
    },
    handleFullscreen() {
        PlayerActions.toggleFullscreen(!this.state.fullscreen);
    },
    render() {
        return (
            <div className={this.state.uiShown ? 'control-bar show' : 'control-bar'}>
                <div className="scrobbler">    
                    <div className="buffer"/>
                    <div className="time"/>
                    <div className="handle"/>
                </div>
                <IconButton onClick={this.handlePausePlay} iconClassName="material-icons" iconStyle={{color: 'white', fontSize: '35px', top: '-5px', left: '-1px'}} className="play-toggle">{this.state.playing ? 'pause' : 'play_arrow'}</IconButton>

                <IconButton onClick={this.handleFullscreen} iconClassName="material-icons" iconStyle={{color: 'white', fontSize: '30px', top: '-5px', left: '-1px'}} className="fullscreen-toggle">{this.state.fullscreen ? 'fullscreen_exit' : 'fullscreen'}</IconButton>
                <IconButton iconClassName="material-icons" iconStyle={{color: 'white', fontSize: '27px', top: '-5px', left: '-1px'}} className="subtitles-toggle">closed_caption</IconButton>

            </div>
        );
    }
});