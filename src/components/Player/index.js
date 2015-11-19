import React from 'react';
import PlayerHeader from './components/Header.react';
import PlayerControls from './components/Controls.react';
import PlayerRender from './components/Renderer.react';

import PlayerStore from './store';
import PlayerActions from './actions';

var If = React.createClass({
    render() {
        return this.props.test ? this.props.children : false;
    }
});

export
default React.createClass({
    getInitialState() {
        return {
            data: PlayerStore.getState().data,
            uri: PlayerStore.getState().uri,

            playing: PlayerStore.getState().playing,
            paused: PlayerStore.getState().paused,
            position: PlayerStore.getState().position,
            buffering: PlayerStore.getState().buffering,
            time: PlayerStore.getState().time,
            fullscreen: PlayerStore.getState().fullscreen,
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
            data: PlayerStore.getState().data,
            type: PlayerStore.getState().type,

            playing: PlayerStore.getState().playing,
            paused: PlayerStore.getState().paused,
            position: PlayerStore.getState().position,
            buffering: PlayerStore.getState().buffering,
            time: PlayerStore.getState().time,
            fullscreen: PlayerStore.getState().fullscreen,
            uiShown: PlayerStore.getState().uiShown
        });
    },
    hover() {
        this.hoverTimeout && clearTimeout(this.hoverTimeout);
        this.state.uiShown || this.setState({
            uiShown: true
        });
        this.hoverTimeout = setTimeout(() => {
            this.setState({
                uiShown: false
            })
        }, 1000);
    },
    render() {
        var playerContent = this.state.uri ? (<PlayerRender uri={this.state.uri}/>) : '';
        var cursorStyle = {
            cursor: this.state.uiShown ? 'pointer' : 'none'
        };
        return (
            <div onMouseMove={this.hover} className="wcjs-player" style={cursorStyle}> >
                <PlayerHeader show={this.state.uiShown} title="PlaceHolder Title"/>
                {playerContent}
                <PlayerControls show={this.state.uiShown} />
            </div>
        );
    }
});