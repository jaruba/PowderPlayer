import React from 'react';
import {
    IconButton
}
from 'material-ui';

import PlayerStore from '../store';
import PlayerActions from '../actions';


export
default React.createClass({
    getInitialState() {
        return {
            open: false
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
            this.setState({});
        }
    },
    handleOpenPlaylist() {


    },
    render() {
        return (
            <div className={this.state.open ? 'playlist-container show' : 'playlist-container'}>
            
            </div>
        );
    }
});