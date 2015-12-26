import React from 'react';
import PlayerStore from '../store';

export
default React.createClass({

    getInitialState() {
        var playerState = PlayerStore.getState();
        return {
            text: playerState.subText,
            size: (playerState.subSize * (parseInt(localStorage.customSubSize) / 100)),
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
                text: playerState.subText,
                size: (playerState.subSize * (parseInt(localStorage.customSubSize) / 100)),
                visibility: !(playerState.playlistOpen || playerState.settingsOpen)
            });
        }
    },

    render() {
        var style = {
            fontSize: this.state.size,
            zIndex: this.state.visibility ? '10' : '1'
        };
        return (
            <span className='wcjs-subtitle-text' style={style} dangerouslySetInnerHTML={{__html: this.state.text}} />
        );
    }

    
});