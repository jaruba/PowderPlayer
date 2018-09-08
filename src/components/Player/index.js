import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import PlayerHeader from './components/Header.react';
import PlayerControls from './components/Controls';
import PlayerRender from './components/Renderer.react';
import Playlist from './components/Playlist.react';
import Settings from './components/MenuHolders/Settings';
import SubtitleList from './components/Subtitles.react';
import CastingMenu from './components/CastingMenu.react';
import SubtitleText from './components/SubtitleText';
import SubtitleActions from './components/SubtitleText/actions';
import Announcement from './components/Announcement.react';
import PlayerActions from './actions';
import path from 'path';
import _ from 'lodash';
import metaParser from './utils/metaParser';
import parser from './utils/parser';
import sorter from './utils/sort';
import fs from 'fs';
import supported from '../../utils/isSupported';

import torrentActions from '../../actions/torrentActions';

import {
    webFrame
} from 'electron';
import remote from 'remote';
import ls from 'local-storage';
import player from './utils/player';
import cacheUtil from './utils/cache';
import hotkeys from './utils/hotkeys';
import contextMenu from './utils/contextMenu';

import ControlStore from './components/Controls/store';
import ControlActions from './components/Controls/actions';
import VisibilityStore from './components/Visibility/store';
import VisibilityActions from './components/Visibility/actions';
import torrentStream from 'torrent-stream';
import torrentUtil from '../../utils/stream/torrentUtil';
import linkUtil from '../../utils/linkUtil';
import readTorrent from 'read-torrent';
import hat from 'hat';

import ReactNotify from 'react-notify';

import {mouseTrap} from 'react-mousetrap';

var lastPos = false;

const Player = React.createClass({
    mixins: [PureRenderMixin],

    getInitialState() {
        var visibilityState = VisibilityStore.getState();
        return {
            uiShown: visibilityState.uiShown
        }
    },
    componentWillMount() {
        if (!ls.isSet('customSubSize'))
            ls('customSubSize', 100);
        VisibilityStore.listen(this.update);
        remote.getCurrentWindow().setMinimumSize(392, 228);
        webFrame.setZoomLevel(ls.isSet('zoomLevel') ? ls('zoomLevel') : 0);
        hotkeys.attach(this.props);

        if (ls('resizeOnPlaylist'))
            window.firstResize = true;
        
        // fix window resize on top side    
        if (document.querySelector('header'))
            document.querySelector('header').style.WebkitAppRegion = "no-drag"
    },
    componentWillUnmount() {
        VisibilityStore.unlisten(this.update);
        hotkeys.detach(this.props);
        cacheUtil.stop();
        window.removeEventListener('contextmenu', contextMenu.listen);
        window.removeEventListener('mousemove', this.hover);
        var handler = document.getElementsByClassName("wcjs-player")[0];

        handler.removeEventListener('dragenter', this.dragEnter)
        handler.removeEventListener('dragover', this.nullEvent);
        handler.removeEventListener('dragleave', this.nullEvent);
        handler.removeEventListener('dragend', this.nullEvent);
        handler.removeEventListener('drop', this.fileDrop);

        // fix window resize on top side
        if (document.querySelector('header'))
            document.querySelector('header').style.WebkitAppRegion = "drag"
    },
    componentDidMount() {
        window.playerDrop = this.fileDrop
        var announcer = document.getElementsByClassName('wcjs-announce')[0];
//        if (['', '0'].indexOf(announcer.style.opacity) > -1) {
//            events.buffering(0);
//        }
        player.set({
            notifier: this.refs.notificator
        });
        cacheUtil.start(player);
        player.loadState();
        window.addEventListener('contextmenu', contextMenu.listen, false);
        window.addEventListener('mousemove', this.hover, false);

        var handler = document.getElementsByClassName("wcjs-player")[0];

        handler.ondragover = handler.ondragleave = handler.ondragend = this.nullEvent;
        handler.ondragenter = this.dragEnter;
        handler.ondrop = this.fileDrop;

        if (window.clFullscreen) {
            delete window.clFullscreen;
            ControlActions.toggleFullscreen();
        }

    },
    update() {
//        console.log('player update');
        if (this.isMounted()) {
            var visibilityState = VisibilityStore.getState();
            this.setState({
                uiShown: visibilityState.uiShown
            });
        }
    },
    dragEnter(e) {
        var data = e && e.dataTransfer && e.dataTransfer.items ? e.dataTransfer.items : [];
        if (process.platform == 'darwin' && data && data.length && data[0].kind != 'file') {

            var dropDummy = document.querySelector('.dropDummy');
            dropDummy.style.display = "block";

            var dropMiddleware = (e) => {
                setTimeout(() => {
                    if (dropDummy.value) {
                        this.fileDrop({
                            preventDefault: function() {},
                            dataTransfer: {
                                files: [],
                                getData: function() { return dropDummy.value }
                            }
                        })
                    } else {
                        this.fileDrop(e)
                    }
                    dropDummy.style.display = "none";
                    dropDummy.value = "";
                }, 100)
                dropDummy.removeEventListener('dragleave', leaveMiddleware)
                dropDummy.removeEventListener('drop', dropMiddleware)
            }

            var leaveMiddleware = (e) => {
                setTimeout(() => {
                    dropDummy.style.display = "none";
                    dropDummy.value = "";
                    dropDummy.removeEventListener('dragleave', leaveMiddleware)
                    dropDummy.removeEventListener('drop', dropMiddleware)
                }, 150)
            }

            dropDummy.addEventListener('dragleave', leaveMiddleware)
            dropDummy.addEventListener('drop', dropMiddleware)
        }
    },
    nullEvent() {
        return false;
    },
    
    droppedTorrent(torrentLink) {

        // works with torrent file paths and magnet links

        var torrentMeta = (torFile) => {
            player.notifier.info('Parsing Torrent', '', 3000);
            readTorrent(torFile, (err, parsedTorrent) => {
                if (err) {
                    player.notifier.info(err.message, '', 3000);
                } else {
                    
                    // we're using torrent-stream to get torrent's file list only
                    new torrentStream(parsedTorrent, {
                        connections: 30,
                        id: '-' + ls('peerID') + '-' + hat(48)
                    }, (engine) => {
                        handleTorrent(engine, parsedTorrent)
                    });
                }
            });
        }
        
        var handleTorrent = (engine, parsedTorrent) => {
            torrentUtil.getContents(engine.torrent.files || engine.files, engine.infoHash).then( files => {
                var fileSelectorData = _.omit(files, ['files_total', 'folder_status']);
                var folder = fileSelectorData[Object.keys(fileSelectorData)[0]];
                var file = folder[Object.keys(folder)[0]];
                var newFiles = [];
                var queueParser = [];

                if (files.ordered.length) {
                    var ij = player.wcjs.playlist.itemCount;
                    files.ordered.forEach( file => {
                        if (file.name.toLowerCase().replace("sample","") == file.name.toLowerCase() && file.name != "ETRG.mp4" && file.name.toLowerCase().substr(0,5) != "rarbg") {
                            newFiles.push({
                                title: parser(file.name).name(),
                                uri: file.infoHash + '/' + file.id,
                                byteSize: file.size,
                                torrentHash: file.infoHash,
                                streamID: file.id,
                                path: file.path,
                                announce: parsedTorrent && parsedTorrent.announce ? parsedTorrent.announce : null 
                            });
                            queueParser.push({
                                idx: ij,
                                url: file.infoHash + '/' + file.id,
                                filename: file.name
                            });
                            ij++;
                        }
                    });
                }

                if (newFiles.length) {
                    PlayerActions.addPlaylist(newFiles);
                    // start searching for thumbnails after 1 second
                    _.delay(() => {
                        if (queueParser.length) {
                            queueParser.forEach( el => {
                                metaParser.push(el);
                            });
                        }
                    },1000);
                }

                player.notifier.info('Torrent Added', '', 3000);

                player.events.emit('playlistUpdate');

            });
            
            engine.remove( () => {
//                console.log('removed torrent meta')
                engine.destroy( () => {
//                    console.log('destroyed torrent meta')
                });
            });
        }

        torrentMeta(torrentLink)

    },
    
    fileDrop(e) {

        e.preventDefault();

        if (window.immuneToDrop) return false;

        var files = e.dataTransfer.files;
        
        if (!_.size(files)) {
            var droppedLink = e.dataTransfer.getData("text/plain");
            if (droppedLink) {
                if (droppedLink.startsWith('magnet:')) {
                    this.droppedTorrent(droppedLink)
                } else {
                    linkUtil(droppedLink).then(url => {
                        var savedHistory = ls('savedHistory');
                        if (savedHistory && savedHistory.length) return
                        player.notifier.info('Link Added', '', 3000);
                    }).catch(error => {
                        player.notifier.info(error.message, '', 3000);
                    });
                }
            }
            return false;
        }

        if (_.size(files) == 1 && files[0].path) {
            if (supported.is(files[0].path, 'subs')) {
                var subs = player.itemDesc().setting.subtitles || {};
                subs[path.basename(files[0].path)] = files[0].path;
                PlayerActions.setDesc({
                    subtitles: subs
                });
                player.wcjs.subtitles.track = 0;
                SubtitleActions.loadSub(files[0].path);
                SubtitleActions.settingChange({
                    selectedSub: _.size(subs) + (player.wcjs.subtitles.count || 1),
                });
                player.notifier.info('Subtitle Loaded', '', 3000);
                return false;
            } else if (supported.is(files[0].path, 'torrent')) {

                this.droppedTorrent(files[0].path)

                return false;

            }
        }

        var anyShortSz = _.some(files, function(el) {
            if (parser(el.name).shortSzEp())
                return true
        })

        if (anyShortSz)
            files = sorter.episodes(files, 2);
        else
            files = sorter.naturalSort(files, 2);

        var newFiles = [];
        var queueParser = [];
        
        var itemCount = player.wcjs.playlist.itemCount;
        
        var idx = itemCount;

        var addFile = (filePath) => {
            if (supported.is(filePath, 'allMedia')) {
                newFiles.push({
                    title: parser(filePath).name(),
                    uri: 'file:///'+filePath,
                    path: filePath
                });
                queueParser.push({
                    idx: idx,
                    url: 'file:///'+filePath,
                    filename: filePath.replace(/^.*[\\\/]/, '')
                });
                idx++;
            }

            return false;
        };

        var addDir = (filePath) => {
            var newFiles = fs.readdirSync(filePath);

            var anyShortSz = newFiles.some(function(el) {
                if (parser(el).shortSzEp())
                    return true
            })

            if (anyShortSz)
                newFiles = sorter.episodes(newFiles, 1);
            else
                newFiles = sorter.naturalSort(newFiles, 1);

            newFiles.forEach(( file, index ) => {
                var dummy = decide( path.join( filePath, file ) );
            });

            return false;
        };
        
        var decide = (filePath) => {
            if (fs.lstatSync(filePath).isDirectory())
                var dummy = addDir(filePath);
            else
                var dummy = addFile(filePath);

            return false;
        };

        _.forEach(files, el => {
            var dummy = decide(el.path);
        });

        PlayerActions.addPlaylist(newFiles);

        if (idx == itemCount)
            player.notifier.info('File Not Supported', '', 3000);
        else
            player.notifier.info('Added to Playlist', '', 3000);

        // start searching for thumbnails after 1 second
        _.delay(() => {
            queueParser.forEach( el => {
                metaParser.push(el);
            });
        },1000);

        return false;
    },
    hideUI() {
        if (!ControlStore.getState().scrobbling)
            VisibilityActions.uiShown(false);
        else
            player.hoverTimeout = setTimeout(this.hideUI, 3000);
    },
    hover(event) {
        var curPos = event.pageX+'x'+event.pageY;
        if (curPos != lastPos) {
            lastPos = curPos;
            player.hoverTimeout && clearTimeout(player.hoverTimeout);
            this.state.uiShown || VisibilityActions.uiShown(true);
            player.hoverTimeout = setTimeout(this.hideUI, 3000);
        }
    },
    render() {
        var cursorStyle = {
            cursor: this.state.uiShown ? 'pointer' : 'none'
        };
        return (
            <div className="wcjs-player" style={cursorStyle}>
                <PlayerHeader />
                <PlayerRender />
                <Announcement />
                <SubtitleText />
                <PlayerControls />
                <Playlist />
                <Settings />
                <SubtitleList />
                <CastingMenu />
                <div className="castingBackground" />
                <ReactNotify ref='notificator'/>
            </div>
        );
    }
});

export
default mouseTrap(Player)
