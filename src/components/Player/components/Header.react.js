import React from 'react';
import {
    FontIcon
}
from 'material-ui';

import PlayerStore from '../store';
import PlayerActions from '../actions';


export
default React.createClass({
    getInitialState() {
        return {
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
            uiShown: PlayerStore.getState().uiShown
        });
    },

    render() {
        return (
            <div className={this.state.uiShown ? 'header show' : 'header'}>
               <FontIcon color="white" className="material-icons player-close">arrow_back</FontIcon>
            </div>
        );
    }
});