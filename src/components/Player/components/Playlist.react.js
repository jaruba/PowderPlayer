import React from 'react';
import _ from 'lodash';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import {
    IconButton, Paper
}
from 'material-ui';
import PlayerStore from '../store';
import PlayerActions from '../actions';
import path from 'path';
import ReactDOM from 'react-dom';


const PlaylistItem = React.createClass({
    render() {
        return (
            <Paper className="item" zDepth={1} style={{background: 'url('+this.props.image+') no-repeat'}}>
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
            items: []
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
            this.populatePlaylist();
        }
    },

    close() {
        PlayerActions.openPlaylist(false);
    },

    handleOpenPlaylist() {


    },
    
    populatePlaylist() {
        
        if (this.state.populated) return;
        
        this.setState({
            populated: true
        });

        var newItems = [];
        for (var i = 0; i < PlayerStore.getState().wcjs.playlist.items.count; i++) {
            console.log(PlayerStore.getState().itemDesc(i));
            newItems.push(PlayerStore.getState().itemDesc(i));
        }
        
        newItems.map(function(item, idx) {
            if (path.isAbsolute(item.title)) {
                item.title = path.normalize(path.parse(item.title).name);
            }
            if (!item.image) {
                item.image = '../images/video-placeholder.svg';
            }
            return ReactDOM.render(<PlaylistItem key={idx} image={item.image} title={item.title} />,document.querySelector('.playlist-inner'));
        }, this);
        
    },
    
    render() {
        console.log(this.state)
        return (
            <div className={this.state.open ? 'playlist-container show' : 'playlist-container'}>
                <div className="playlist-controls"/>

                <div className="playlist-holder">
                    <div ref="playlist-title" className="droid-sans playlist-title">Playlist</div>
                    <div className="playlist-inner"/>
                </div>
            </div>
        );
    }

    
});