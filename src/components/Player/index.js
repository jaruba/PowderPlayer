import React from 'react';
import PlayerHeader from './components/Header.react';
import PlayerControls from './components/Controls.react';
import PlayerRender from './components/Renderer.react';

import PlayerStore from './store';
import PlayerActions from './actions';

export
default React.createClass({
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
        this.setState({
            uri: PlayerStore.getState().uri,

            position: PlayerStore.getState().position,
            buffering: PlayerStore.getState().buffering,
            uiShown: PlayerStore.getState().uiShown
        });
    },
    hover() {
        this.hoverTimeout && clearTimeout(this.hoverTimeout);

        this.state.uiShown || PlayerActions.uiShown(true);
        this.hoverTimeout = setTimeout(() => {
            PlayerActions.uiShown(false);
        }, 1000);
    },
    render() {
        var playerContent = this.state.uri ? <PlayerRender /> : '';
        var cursorStyle = {
            cursor: this.state.uiShown ? 'pointer' : 'none'
        };
        return (
            <div onMouseMove={this.hover} className="wcjs-player" style={cursorStyle}>
                <PlayerHeader />
                {playerContent}
                <PlayerControls />
            </div>
        );
    }
});