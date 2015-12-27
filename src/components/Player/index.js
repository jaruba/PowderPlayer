import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import PlayerHeader from './components/Header.react';
import PlayerControls from './components/Controls.react';
import PlayerRender from './components/Renderer.react';
import Playlist from './components/Playlist.react';
import Settings from './components/Settings.react';
import SubtitleList from './components/Subtitles.react';
import SubtitleText from './components/SubtitleText.react';
import Announcement from './components/Announcement.react';

import webFrame from 'web-frame';
import remote from 'remote';

import PlayerStore from './store';
import PlayerActions from './actions';

import ReactNotify from 'react-notify';


export
default React.createClass({
    mixins: [PureRenderMixin],

    getInitialState() {
        var playerState = PlayerStore.getState();
        return {
            uri: playerState.uri,

            volume: playerState.volume,
            position: playerState.position,
            buffering: playerState.buffering,
            uiShown: playerState.uiShown,
            
            rippleEffects: playerState.rippleEffects
        }
    },
    componentWillMount() {
        if (!localStorage.customSubSize)
            localStorage.customSubSize = 100;
        PlayerStore.listen(this.update);
        remote.getCurrentWindow().setMinimumSize(392, 228);
        webFrame.setZoomLevel(localStorage.zoomLevel ? parseFloat(localStorage.zoomLevel) : 0);
    },
    componentWillUnmount() {
        PlayerStore.unlisten(this.update);
    },
    componentDidMount() {
        var announcer = document.getElementsByClassName('wcjs-announce')[0];
        if (['', '0'].indexOf(announcer.style.opacity) > -1) {
            PlayerActions.buffering(0);
        }
        PlayerActions.settingChange({
            notifier: this.refs.notificator
        });
    },
    update() {
        if (this.isMounted()) {
            var playerState = PlayerStore.getState();
            this.setState({
                uri: playerState.uri,

                volume: playerState.volume,
                position: playerState.position,
                buffering: playerState.buffering,
                uiShown: playerState.uiShown,
                
                fontSize: playerState.fontSize,
                subSize: playerState.subSize,
                
                rippleEffects: playerState.rippleEffects
            });
        }
    },
    hideUI() {
        if (!PlayerStore.getState().scrobbling) {
            PlayerActions.uiShown(false);
        } else {
            this.hoverTimeout = setTimeout(this.hideUI, 3000);
        }
    },
    hover(event) {
        this.hoverTimeout && clearTimeout(this.hoverTimeout);
        this.state.uiShown || PlayerActions.uiShown(true);
        this.hoverTimeout = setTimeout(this.hideUI, 3000);
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