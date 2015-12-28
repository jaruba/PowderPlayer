import React from 'react';
import PlayerStore from '../store';

export
default React.createClass({

    getInitialState() {
        var playerState = PlayerStore.getState();
        return {
            text: playerState.subText,
            size: (playerState.subSize * (parseInt(localStorage.customSubSize) / 100)),
            visibility: !(playerState.playlistOpen || playerState.settingsOpen),
            color: localStorage.subColor ? parseInt(localStorage.subColor) : 0,
            hex: ['#fff', '#ebcb00', '#00e78f', '#00ffff', '#00b6ea']
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
                visibility: !(playerState.playlistOpen || playerState.settingsOpen),
                color: localStorage.subColor ? parseInt(localStorage.subColor) : 0
            });
        }
    },

    render() {
        var style = {
            fontSize: this.state.size,
            zIndex: this.state.visibility ? '10' : '1',
            color: this.state.hex[this.state.color]
        };
        return (
            <span className='wcjs-subtitle-text' style={style} dangerouslySetInnerHTML={{__html: this.state.text}} />
        );
    }

    
});