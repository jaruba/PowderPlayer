import React from 'react';
import _ from 'lodash';
import {
    ItemMixin, ListMixin
}
from '../utils/playlistGrid';
import {
    IconButton, Paper
}
from 'material-ui';
import PlayerStore from '../store';
import PlayerActions from '../actions';


const PlaylistItem = React.createClass({
    mixins: [ItemMixin],
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
    mixins: [ListMixin],
    getInitialState() {
        return {
            open: false,
        }
    },
    componentWillMount() {
        PlayerStore.listen(this.update);
    },
    componentDidMount() {
        this.setState({
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
        });
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
    handleSort(reorder) {
        this.setState({
            items: reorder.map(function(idx) {
                return this.state.items[idx];
            }.bind(this))
        });
    },
    render() {
        console.log(this.state)
        return (
            <div className={this.state.open ? 'playlist-container show' : 'playlist-container'}>
                <div className="playlist-inner">
                    {
                        this.state.items.map(function(item, idx) {
                            return <PlaylistItem key={idx} index={item.id} {...this.movableProps} image={item.image} title={item.title} />;
                        }, this)
                    }
                </div>
            
            </div>
        );
    }
});