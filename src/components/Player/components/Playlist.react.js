import React from 'react';
import _ from 'lodash';
import {
    IconButton, Paper
}
from 'material-ui';
import PlayerStore from '../store';
import PlayerActions from '../actions';




const PlaylistItem = React.createClass({
    render() {
        return (
            <Paper className="item" zDepth={1}>
                <img src={this.props.image}/>
                <p className="title">{this.props.title}</p>
            </Paper>
        );
    }
});

export
default React.createClass({
    getInitialState() {
        return {
            open: false,
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
                <div className="playlist-inner">
                    
                    <PlaylistItem
                        image="https://walter.trakt.us/images/episodes/001/987/912/screenshots/original/c9596bfbc7.jpg" 
                        title="Always Accountable" />

                </div>
            
            </div>
        );
    }
});