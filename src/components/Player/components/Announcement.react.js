import React from 'react';
import PlayerStore from '../store';
import VisibilityStore from './Visibility/store';
import player from '../utils/player';

export
default React.createClass({

    getInitialState() {
        var visibilityState = VisibilityStore.getState();
        return {
            text: '',
            size: 21.3,
            effect: '',
            visibility: !(visibilityState.playlist || visibilityState.settings)
        }
    },
    componentWillMount() {
        VisibilityStore.listen(this.update);
        player.events.on('announce', this.announcement);
    },
    componentWillUnmount() {
        VisibilityStore.unlisten(this.update);
        player.events.removeListener('announce', this.announcement);
    },
    announcement(obj) {
        if (typeof obj.effect !== 'undefined')
            player.set({
                announceEffect: obj.effect
            });
        this.setState(obj);
    },
    update() {
        if (this.isMounted()) {
            var visibilityState = VisibilityStore.getState();
            this.setState({
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