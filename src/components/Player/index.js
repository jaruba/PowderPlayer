import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import PlayerHeader from './components/Header.react';
import PlayerControls from './components/Controls';
import PlayerRender from './components/Renderer.react';
import Playlist from './components/Playlist.react';
import Settings from './components/MenuHolders/Settings';
import SubtitleList from './components/Subtitles.react';
import SubtitleText from './components/SubtitleText';
import Announcement from './components/Announcement.react';

import webFrame from 'web-frame';
import remote from 'remote';
import ls from 'local-storage';
import player from './utils/player';
import hotkeys from './utils/hotkeys';

import ControlStore from './components/Controls/store';
import VisibilityStore from './components/Visibility/store';
import VisibilityActions from './components/Visibility/actions';

import ReactNotify from 'react-notify';

import {mouseTrap} from 'react-mousetrap';

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
    },
    componentDidMount() {
        var announcer = document.getElementsByClassName('wcjs-announce')[0];
//        if (['', '0'].indexOf(announcer.style.opacity) > -1) {
//            events.buffering(0);
//        }
        player.set({
            notifier: this.refs.notificator
        });
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
    hideUI() {
        if (!ControlStore.getState().scrobbling)
            VisibilityActions.uiShown(false);
        else
            player.hoverTimeout = setTimeout(this.hideUI, 3000);
    },
    hover(event) {
        player.hoverTimeout && clearTimeout(player.hoverTimeout);
        this.state.uiShown || VisibilityActions.uiShown(true);
        player.hoverTimeout = setTimeout(this.hideUI, 3000);
    },
    render() {
        var cursorStyle = {
            cursor: this.state.uiShown ? 'pointer' : 'none'
        };
        return (
            <div onMouseMove={this.hover} className="wcjs-player" style={cursorStyle}>
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
