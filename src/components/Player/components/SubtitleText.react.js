import React from 'react';
import PlayerStore from '../store';

export
default React.createClass({

    getInitialState() {
        var playerState = PlayerStore.getState();
        return {
            subText: playerState.subText,
            subSize: playerState.subSize
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
                subText: playerState.subText,
                subSize: playerState.subSize
            });
        }
    },

    setSubText() {
        PlayerActions.openPlaylist(false);
    },

    render() {
        var subStyle = {
            fontSize: this.state.subSize
        };
        return (
            <span className='wcjs-subtitle-text' style={subStyle}>{this.state.subText}</span>
        );
    }

    
});