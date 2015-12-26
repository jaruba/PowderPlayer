import React from 'react';
import PlayerStore from '../store';

export
default React.createClass({

    getInitialState() {
        var playerState = PlayerStore.getState();
        return {
            text: playerState.announce,
            size: playerState.fontSize,
            effect: playerState.announceEffect,
            visibility: !(playerState.playlistOpen || playerState.settingsOpen)
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
            var playerState = PlayerStore.getState();
            this.setState({
                text: playerState.announce,
                size: playerState.fontSize,
                effect: playerState.announceEffect,
                visibility: !(playerState.playlistOpen || playerState.settingsOpen)
            });
        }
    },

    render() {
        var style = {
            fontSize: this.state.size,
            transition: this.state.effect ? 'opacity .5s ease-in-out' : 'none',
            opacity:this.state.effect ? '0' : '1',
            zIndex: this.state.visibility ? '10' : '1'
        };
        return (
            <span className='wcjs-announce' style={style}>{this.state.text}</span>
        );
    }

    
});