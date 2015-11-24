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
        return {
            uri: PlayerStore.getState().uri,

            position: PlayerStore.getState().position,
            buffering: PlayerStore.getState().buffering,
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
                uri: PlayerStore.getState().uri,

                position: PlayerStore.getState().position,
                buffering: PlayerStore.getState().buffering,
                uiShown: PlayerStore.getState().uiShown
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
        return (
            <div onMouseMove={this.hover} className="wcjs-player" style={cursorStyle}>
                <PlayerHeader />
                <PlayerRender />
                <PlayerControls />
                <Playlist />
            </div>
        );
    }
});