import React from 'react';
import PlayerHeader from './Header.react';
import PlayerControls from './Controls.react';
import PlayerRender from './Renderer.react';

import PlayerStore from './store';
import PlayerActions from './actions';


export
default React.createClass({
    getInitialState() {
        return {
            streamURI: PlayerStore.getState().uri,
        }
    },
    componentDidMount() {
        PlayerStore.listen(this.update);
    },
    componentWillUnmount() {
        PlayerStore.unlisten(this.update);
    },
    update() {
        this.setState({
            streamURI: PlayerStore.getState().uri,
            data: PlayerStore.getState().data
        });
    },
    render() {
        return (
            <div className="wcjs-player" >
                <PlayerHeader title="PlaceHolder Title"/>
                <PlayerRender uri=""/>
                <PlayerControls />
            </div>
        );
    }
});