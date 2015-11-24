import React from 'react';
import _ from 'lodash';
import PureRenderMixin from 'react-addons-pure-render-mixin';
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

    mixins: [PureRenderMixin],

    getInitialState() {
        return {
            open: false,
            items: [{
                image: 'https://walter.trakt.us/images/episodes/001/987/912/screenshots/original/c9596bfbc7.jpg',
                title: 'Always Accountable 1',
                id: 1
            }, {
                image: 'https://walter.trakt.us/images/episodes/001/987/912/screenshots/original/c9596bfbc7.jpg',
                title: 'Always Accountables 2',
                id: 2
            }, {
                image: 'https://walter.trakt.us/images/episodes/001/987/912/screenshots/original/c9596bfbc7.jpg',
                title: 'Always Accountables 3',
                id: 3
            }, {
                image: 'https://walter.trakt.us/images/episodes/001/987/912/screenshots/original/c9596bfbc7.jpg',
                title: 'Always Accountables 4',
                id: 4
            }]
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
                open: PlayerStore.getState().playlistOpen,
            });
        }
    },

    close() {
        PlayerActions.openPlaylist(false);
    },

    handleOpenPlaylist() {


    },
    render() {
        console.log(this.state)
        return (
            <div className={this.state.open ? 'playlist-container show' : 'playlist-container'}>
                <div className="playlist-controls">

                </div>
                
                <div className="playlist-inner">
                    {
                        this.state.items.map(function(item, idx) {
                            return <PlaylistItem key={idx} image={item.image} title={item.title} />;
                        }, this)
                    }
                </div>
            
            </div>
        );
    }
});