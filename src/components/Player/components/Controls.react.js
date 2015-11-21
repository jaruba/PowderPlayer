import React from 'react';
import moment from 'moment';
import _ from 'lodash';
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
            fullscreen: PlayerStore.getState().fullscreen,
            uiShown: PlayerStore.getState().uiShown,

            scrobbling: false,
            playing: PlayerStore.getState().playing,
            position: PlayerStore.getState().position,
            buffering: PlayerStore.getState().buffering,
            time: PlayerStore.getState().time,
            length: PlayerStore.getState().length
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
                fullscreen: PlayerStore.getState().fullscreen,
                uiShown: PlayerStore.getState().uiShown,

                playing: PlayerStore.getState().playing,
                position: PlayerStore.getState().position,
                buffering: PlayerStore.getState().buffering,
                seekable: PlayerStore.getState().seekable,
                time: PlayerStore.getState().time,
                length: PlayerStore.getState().length
            });
        }
    },
    handlePausePlay() {
        if (!this.state.buffering)
            this.state.playing ? PlayerActions.pause() : PlayerActions.play();
    },
    handleFullscreen() {
        PlayerActions.toggleFullscreen(!this.state.fullscreen);
    },
    handleScrobblerHover(event) {

        var total_time = this.state.length;

        var percent_done = event.pageX / document.body.clientWidth;

        var newTime = total_time * percent_done;
        this.refs['scrobbler-handle'].style.left = (percent_done * 100) + '%';
        //console.log(total_time, percent_done + '%', newTime);

    },
    handleScrobble(event) {
        if (!this.state.length || !this.state.seekable)
            return;
        var percent_done = event.pageX / document.body.clientWidth;
        PlayerActions.scrobble(this.state.length * percent_done);
    },
    handleDragStart() {

        this.setState({
            scrobbling: true
        });

        _.delay((still) => {
            if (still)
                this.refs['scrobbler-handle'].style.opacity = 1;
        }, 100, this.state.scrobbling)
    },
    handleDragEnd() {
        this.setState({
            scrobbling: false
        });
        this.refs['scrobbler-handle'].style.opacity = 0;
    },
    render() {
        var scrobblerStyles = {
            time: {
                width: this.state.position * 100 + '%'
            }
        };
        return (
            <div className={this.state.uiShown ? 'control-bar show' : 'control-bar'}>
                <div onMouseUp={this.handleScrobble} onMouseDown={this.handleDragStart} onMouseOut={this.handleDragEnd} onMouseMove={this.handleScrobblerHover} className="scrobbler">    
                    <div className="buffer"/>
                    <div style={scrobblerStyles.time} className="time"/>
                    <div ref="scrobbler-handle" className="handle"/>
                </div>
                <IconButton onClick={this.handlePausePlay} iconClassName="material-icons" iconStyle={{color: 'white', fontSize: '35px', top: '-5px', left: '-1px'}} className="play-toggle">{this.state.playing ? 'pause' : 'play_arrow'}</IconButton>

                <IconButton onClick={this.handleFullscreen} iconClassName="material-icons" iconStyle={{color: 'white', fontSize: '30px', top: '-5px', left: '-1px'}} className="fullscreen-toggle">{this.state.fullscreen ? 'fullscreen_exit' : 'fullscreen'}</IconButton>
                <IconButton iconClassName="material-icons" iconStyle={{color: 'white', fontSize: '27px', top: '-5px', left: '-1px'}} className="subtitles-toggle">closed_caption</IconButton>

            </div>
        );
    }
});