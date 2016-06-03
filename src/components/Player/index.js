import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import PlayerHeader from './components/Header.react';
import PlayerControls from './components/Controls';
import PlayerRender from './components/Renderer.react';
import Playlist from './components/Playlist.react';
import Settings from './components/MenuHolders/Settings';
import SubtitleList from './components/Subtitles.react';
import SubtitleText from './components/SubtitleText';
import SubtitleActions from './components/SubtitleText/actions';
import Announcement from './components/Announcement.react';
import PlayerActions from './actions';
import path from 'path';
import _ from 'lodash';
import metaParser from './utils/metaParser';
import parser from './utils/parser';
import fs from 'fs';

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
import VisibilityStore from './components/Visibility/store';
import VisibilityActions from './components/Visibility/actions';

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
    },
    componentWillUnmount() {
        VisibilityStore.unlisten(this.update);
        hotkeys.detach(this.props);
        cacheUtil.stop();
        window.removeEventListener('contextmenu', contextMenu.listen);
        window.removeEventListener('mousemove', this.hover);
        var handler = document.getElementsByClassName("wcjs-player")[0];

        handler.removeEventListener('dragover', this.nullEvent);
        handler.removeEventListener('dragleave', this.nullEvent);
        handler.removeEventListener('dragend', this.nullEvent);
        handler.removeEventListener('drop', this.fileDrop);
    },
    componentDidMount() {
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
        handler.ondrop = this.fileDrop;

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
    nullEvent() {
        return false;
    },
    fileDrop(e) {
        e.preventDefault();
        var supported = [".mkv", ".avi", ".mp4", ".m4v", ".mpg", ".mpeg", ".webm", ".flv", ".ogg", ".ogv", ".mov", ".wmv", ".3gp", ".3g2", ".m4a", ".mp3", ".flac"];
        var file = e.dataTransfer.files[0];
        if (e.dataTransfer.files.length == 1 && file.path) {
            if (file.path.endsWith('.sub') || file.path.endsWith('.srt') || file.path.endsWith('.vtt')) {
                var subs = player.itemDesc().setting.subtitles || {};
                subs[path.basename(file.path)] = file.path;
                PlayerActions.setDesc({
                    subtitles: subs
                });
                player.wcjs.subtitles.track = 0;
                SubtitleActions.loadSub(file.path);
                SubtitleActions.settingChange({
                    selectedSub: _.size(subs) + (player.wcjs.subtitles.count || 1),
                });
                player.notifier.info('Subtitle Loaded', '', 3000);
                return;
            }
        }

        var newFiles = [];
        var queueParser = [];
        
        var itemCount = player.wcjs.playlist.itemCount;
        
        var idx = itemCount;

        var addFile = (filePath) => {
            if (isSupported(filePath)) {
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
            fs.readdirSync(filePath).forEach(( file, index ) => {
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
        
        var isSupported = (filePath) => {
            return supported.some( el => {
                if (filePath.endsWith(el)) return true;
            });
        }

        _.forEach(e.dataTransfer.files, el => {
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
                <ReactNotify ref='notificator'/>
            </div>
        );
    }
});

export
default mouseTrap(Player)
