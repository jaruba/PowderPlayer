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
            type: PlayerStore.getState().type,
            uri: PlayerStore.getState().uri
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
            uri: PlayerStore.getState().uri
        });
    },
    render() {
        var playerContent = this.state.uri ? (<PlayerRender uri={this.state.uri}/>) : '';
        return (
            <div className="wcjs-player" >
                <PlayerHeader title="PlaceHolder Title"/>
                {playerContent}
                <PlayerControls />
            </div>
        );
    }
});