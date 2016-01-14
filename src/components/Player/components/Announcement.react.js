import React from 'react';
import PlayerStore from '../store';
import VisibilityStore from './Visibility/store';

export
default React.createClass({

    getInitialState() {
        var playerState = PlayerStore.getState();
        var visibilityState = VisibilityStore.getState();
        return {
            text: '',
            size: playerState.fontSize,
            effect: playerState.announceEffect,
            visibility: !(visibilityState.playlist || visibilityState.settings)
        }
    },
    componentWillMount() {
        VisibilityStore.listen(this.update);
    },

    componentWillUnmount() {
        VisibilityStore.unlisten(this.update);
    },
    update() {
        if (this.isMounted()) {
            var playerState = PlayerStore.getState();
            var visibilityState = VisibilityStore.getState();
            this.setState({
                text: playerState.announce,
                size: playerState.fontSize,
                effect: playerState.announceEffect,
                visibility: !(visibilityState.playlist || visibilityState.settings)
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