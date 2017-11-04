import React from 'react';
import _ from 'lodash';
import PlayerStore from '../store';
import PlayerActions from '../actions';
import ControlActions from './Controls/actions';
import VisibilityStore from './Visibility/store';
import path from 'path';
import player from '../utils/player';
import Sortable from 'sortablejs';
import ModalActions from './Modal/actions';

var sortable = {};

export
default React.createClass({

    getInitialState() {
        return {
            playing: player.wcjs.playing,
            open: false,
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

    removeItem(idx) {
        player.wcjs.playlist.removeItem(idx);
    },

    handleOpenPlaylist() {


    },

    getItems() {
        let items = []
        if (!player.wcjs.playlist) return items;
        for (var idx = 0; idx < player.wcjs.playlist.items.count; idx++) {
            var item = player.itemDesc(idx);
            var noImage = 'images/video-placeholder.svg';

            !item.setting && (item.setting = {})

            item.image = item.artworkURL || item.setting.image || noImage
            
            var showControls = (typeof window.currentItem !== 'undefined') ? (idx == window.currentItem) : (idx == player.wcjs.playlist.currentItem)
            
            var miniControls = (
                <div className="miniControls" style={{ display: showControls ? 'inline-block' : 'none' }}>
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
            );

            items.push((
                <paper-material id={'item'+idx} className={'item' + (showControls ? ' playlist-selected' : '')} key={idx} elevation={1} style={{background: 'url(' + item.image + ') no-repeat, url(' + noImage + ') no-repeat', borderRadius: '2px', textAlign: 'center'}}>
                    {miniControls}
                    <p id={'itemTitle'+idx} className="title">{(path.isAbsolute(item.title)) ? path.normalize(path.parse(item.title).name) : item.title }</p>
                    <div className="playlist-back" onClick={showControls ? ControlActions.handlePausePlay : player.playItem.bind(this,idx)} />
                    <div className="playlist-close-hold" onClick={this.removeItem.bind(this,idx)} style={{display: showControls ? 'none' : 'block' }}>
                        <paper-icon-button className="playlist-close" icon={'icons:close'} noink={true} />
                    </div>
                </paper-material>
            ));
        }

        return items;
    },
    
    sortableGroupDecorator(componentBackingInstance) {
        // check if backing instance not null
        if (componentBackingInstance) {
            let options = {
                draggable: "paper-material",
                group: "playlist",
                
                onStart: evt => {
                    window.immuneToDrop = true;
                    // set a class to the playlist while dragging
                    var playlistElem = window.document.querySelector('.playlist-inner');
                    playlistElem.className += ' playlist-dragging';
                },
                
                onEnd: evt => {
                    var playlistElem = window.document.querySelector('.playlist-inner');
                    playlistElem.className = playlistElem.className.split(' playlist-dragging').join('');
                },
                
                onSort: evt => {

                    delete window.immuneToDrop;

                    var oldId = evt.oldIndex,
                        newId = evt.newIndex,
                        reArrange = sortable.toArray(),
                        oldSort = sortable.toArray();

                    if (oldId < newId) {
                        for (var i = oldId; i < newId; i++)
                            reArrange[i+1] = oldSort[i];
                    } else {
                        for (var i = newId + 1; i <= oldId; i++)
                            reArrange[i-1] = oldSort[i];
                    }

                    player.wcjs.playlist.advanceItem(oldId, newId - oldId);

                    reArrange[oldId] = oldSort[newId];
                    sortable.sort(reArrange);
                    this.update();
                },
            };
            sortable = Sortable.create(componentBackingInstance, options);
        }
    },
    
    addToPlaylist() {
        ModalActions.open({
            type: 'AddToPlaylist'
        });
    },

    render() {
        return (
            <div className={this.state.uiHidden ? 'playlist-container' : this.state.open ? 'playlist-container show' : 'playlist-container'}>
                <div className="playlist-controls" / >
                <div className="playlist-holder playlist-holder-contain">
                    <div ref="playlist-title" className="droid-sans playlist-title">Playlist</div>
                    <div ref="playlist-add-button" className="droid-sans playlist-add-button" onClick={this.addToPlaylist}>+</div>
                    <div className="playlist-inner" ref={this.sortableGroupDecorator}>
                        {this.getItems()}
                    </div>
                   </div> 
            </div>
        );
    }

    
});