import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import PlayerHeader from './components/Header.react';
import PlayerControls from './components/Controls.react';
import PlayerRender from './components/Renderer.react';
import Playlist from './components/Playlist.react';

import PlayerStore from './store';
import PlayerActions from './actions';


export
default React.createClass({
    mixins: [PureRenderMixin],

    getInitialState() {
        var playerState = PlayerStore.getState();
        return {
            uri: playerState.uri,

            volume: playerState.volume,
            position: playerState.position,
            buffering: playerState.buffering,
            uiShown: playerState.uiShown,
            
            fontSize: playerState.fontSize,
            
            rippleEffects: playerState.rippleEffects
        }
    },
    componentWillMount() {
        PlayerStore.listen(this.update);
    },
    componentWillUnmount() {
        PlayerStore.unlisten(this.update);
    },
    componentDidMount() {
        var announcer = document.getElementsByClassName('wcjs-announce')[0];
        if (['', '0'].indexOf(announcer.style.opacity) > -1) {
            PlayerActions.buffering(0);
        }
    },
    update() {
        if (this.isMounted()) {
            var playerState = PlayerStore.getState();
            this.setState({
                uri: playerState.uri,

                volume: playerState.volume,
                position: playerState.position,
                buffering: playerState.buffering,
                uiShown: playerState.uiShown,
                
                fontSize: playerState.fontSize,
                
                rippleEffects: playerState.rippleEffects
            });
        }
    },
    hideUI() {
        if (!PlayerStore.getState().scrobbling) {
            PlayerActions.uiShown(false);
        } else {
            this.hoverTimeout = setTimeout(this.hideUI, 3000);
        }
    },
    hover(event) {
        this.hoverTimeout && clearTimeout(this.hoverTimeout);
        this.state.uiShown || PlayerActions.uiShown(true);
        this.hoverTimeout = setTimeout(this.hideUI, 3000);
    },
    render() {
        var cursorStyle = {
            cursor: this.state.uiShown ? 'pointer' : 'none'
        };
        var announceStyle = {
            fontSize: this.state.fontSize
        };
        return (
            <div onMouseMove={this.hover} className="wcjs-player" style={cursorStyle}>
                <PlayerHeader />
                <PlayerRender />
                <span className='wcjs-announce' style={announceStyle}></span>
                <PlayerControls />
                <Playlist />
            </div>
        );
    }
});