import React from 'react';
import {
    History
}
from 'react-router';


import PlayerStore from '../store';
import PlayerActions from '../actions';


export
default React.createClass({

    mixins: [History],

    getInitialState() {
        return {
            title: PlayerStore.getState().title,
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
            title: PlayerStore.getState().title,
            uiShown: PlayerStore.getState().uiShown
        });
    },
    handleClose() {
        PlayerActions.close();
        this.history.replaceState(null, '');
    },
    render() {
        return (
            <div className={this.state.uiShown ? 'header show' : 'header'}>
                <i onClick={this.handleClose} className="material-icons player-close">arrow_back</i>
                <p className="title">{this.state.title}</p> 
            </div>
        );
    }
});