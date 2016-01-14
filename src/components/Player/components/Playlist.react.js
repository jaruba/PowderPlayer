import React from 'react';
import _ from 'lodash';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import {
    IconButton, Paper
}
from 'material-ui';
import PlayerStore from '../store';
import PlayerActions from '../actions';
import VisibilityStore from './Visibility/store';
import path from 'path';

export
default React.createClass({

    mixins: [PureRenderMixin],

    getInitialState() {
        return {
            open: false,
            playlist: PlayerStore.getState().wcjs.playlist || false,
            uiHidden: VisibilityStore.getState().uiHidden
        }
    },
    componentWillMount() {
        VisibilityStore.listen(this.update);
    },

    componentWillUnmount() {
        VisibilityStore.unlisten(this.update);
    },
    update() {
        if (this.isMounted()) {
            var visibilityState = VisibilityStore.getState();
            this.setState({
                open: visibilityState.playlist,
                playlist: PlayerStore.getState().wcjs.playlist || false,
                uiHidden: visibilityState.uiHidden
            });
        }
    },

    close() {
        PlayerActions.openPlaylist(false);
    },

    handleOpenPlaylist() {


    },

    getItems() {
        let items = []
        if (!this.state.playlist) return items;

        for (var i = 0; i < this.state.playlist.items.count; i++) {
            items.push(PlayerStore.getState().itemDesc(i));
        }

        return items;
    },
    render() {
        return (
            <div className={this.state.uiHidden ? 'playlist-container' : this.state.open ? 'playlist-container show' : 'playlist-container'}>
                <div className="playlist-controls" / >
                <div className="playlist-holder">
                    <div ref="playlist-title" className="droid-sans playlist-title">Playlist</div>
                    <div className="playlist-inner">
                        {
                            this.getItems().map((item, idx) => {
                                if (!item.setting) item.setting = {};
                                if (item.artworkURL) {
                                    item.image = item.artworkURL;
                                } else if (item.setting.image) {
                                    item.image = item.setting.image;
                                } else {
                                    item.image = 'images/video-placeholder.svg';
                                }

                                return (
                                    <Paper onClick={PlayerActions.playItem.bind(this,idx)} id={'item'+idx} className="item" key={idx} zDepth={1} style={{background: 'url(' + item.image + ') no-repeat'}}>
                                        <p id={'itemTitle'+idx} className="title">{(path.isAbsolute(item.title)) ? path.normalize(path.parse(item.title).name) : item.title }</p>
                                    </Paper>
                                    )
                            }, this)
                        }
                    </div>
                   </div> 
            </div>
        );
    }

    
});