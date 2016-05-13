import React from 'react';
import _ from 'lodash';
import PlayerStore from '../store';
import PlayerActions from '../actions';
import ControlActions from './Controls/actions';
import VisibilityStore from './Visibility/store';
import path from 'path';
import player from '../utils/player';

export
default React.createClass({

    getInitialState() {
        return {
            playing: player.wcjs.playing,
            open: false,
            playlist: player.wcjs.playlist || false,
            uiHidden: VisibilityStore.getState().uiHidden
        }
    },
    componentWillMount() {
        VisibilityStore.listen(this.update);
        player.events.on('playlistUpdate', this.updateUI);
    },

    componentWillUnmount() {
        VisibilityStore.unlisten(this.update);
        player.events.removeListener('playlistUpdate', this.updateUI);
    },
    update() {
        if (this.isMounted()) {
            var visibilityState = VisibilityStore.getState();
            this.setState({
                playing: player.wcjs.playing,
                open: visibilityState.playlist,
                playlist: player.wcjs.playlist || false,
                uiHidden: visibilityState.uiHidden
            });
        }
    },

    close() {
        PlayerActions.openPlaylist(false);
    },

    updateUI() {
        if (!this.state.uiHidden && this.state.open) this.update();
    },

    handleOpenPlaylist() {


    },

    getItems() {
        let items = []
        if (!this.state.playlist) return items;

        for (var i = 0; i < this.state.playlist.items.count; i++) {
            items.push(player.itemDesc(i));
        }

        return items;
    },

    render() {
        return (
            <div className={this.state.uiHidden ? 'playlist-container' : this.state.open ? 'playlist-container show' : 'playlist-container'}>
                <div className="playlist-controls" / >
                <div className="playlist-holder playlist-holder-contain">
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
                                
                                var showControls = (item.setting.idx == player.wcjs.playlist.currentItem);

                                return (
                                    <paper-material onClick={showControls ? ControlActions.handlePausePlay : player.playItem.bind(this,idx)} id={'item'+idx} className={'item' + (showControls ? ' playlist-selected' : '')} key={idx} elevation={1} style={{background: 'url(' + item.image + ') no-repeat, url(../images/video-placeholder.svg) no-repeat', borderRadius: '2px', textAlign: 'center'}}>
                                        <div className="miniControls" style={{'display': (showControls ? 'inline-block' : 'none')}}>
                                            <div className="playlist-center-holder">
                                               <div className="playlist-center">
                                                    <div className="playlist-play-holder">
                                                        <div className="playlist-play-dummy" />
                                                        <paper-icon-button className={'play-toggle playlist-play'} icon={'av:' + (this.state.playing ? 'pause' : 'play-arrow')} noink={true} />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="playlist-progress" style={{ width: (player.wcjs.position * 100) + '%' }} />
                                        </div>
                                        <p id={'itemTitle'+idx} className="title">{(path.isAbsolute(item.title)) ? path.normalize(path.parse(item.title).name) : item.title }</p>
                                    </paper-material>
                                    )
                            }, this)
                        }
                    </div>
                   </div> 
            </div>
        );
    }

    
});