import React from 'react';
import path from 'path';
import wcjsRenderer from '../utils/wcjs-renderer';

import PlayerActions from '../actions';
import PlayerStore from '../store';

try {
    var wcjs = require(path.join(process.cwd(), 'resources/bin/', 'WebChimera.js.node'));
} catch (e) {
    console.error('WCJS Load Error:', e);
}

export
default React.createClass({
    getInitialState() {
        return {
            uri: PlayerStore.getState().uri,

            playing: PlayerStore.getState().playing,
            paused: PlayerStore.getState().paused,
            position: PlayerStore.getState().position,
            buffering: PlayerStore.getState().buffering,
            time: PlayerStore.getState().time,
            fullscreen: PlayerStore.getState().fullscreen
        }
    },
    componentWillMount() {
        if (!PlayerStore.getState().wcjs) {
            PlayerActions.wcjsInit(wcjsRenderer.init(wcjs, this.refs['wcjs-render'], [
                "--no-media-library",
                "--no-sub-autodetect-file",
                "--no-spu",
                "--no-stats",
                "--no-osd",
                "--network-caching", "3500",
                "--file-caching", "3000",
                "--no-skip-frames",
                "--no-video-title-show",
                "--disable-screensaver",
                "--no-autoscale",
                "--ipv4-timeout=86400000"
            ]));
        }
    },
    componentDidMount() {
        PlayerStore.listen(this.update);
        window.addEventListener('resize', this.handleResize);
        this.initPlayer();
    },
    componentWillUnmount() {
        PlayerStore.unlisten(this.update);
        window.removeEventListener('resize', this.handleResize);
    },
    update() {
        this.setState({
            uri: PlayerStore.getState().uri,

            playing: PlayerStore.getState().playing,
            paused: PlayerStore.getState().paused,
            position: PlayerStore.getState().position,
            buffering: PlayerStore.getState().buffering,
            time: PlayerStore.getState().time,
            fullscreen: PlayerStore.getState().fullscreen
        });
    },
    initPlayer() {
        this.player = PlayerStore.getState().wcjs;

        this.player.onPositionChanged = (pos) => {
            this.setState({
                position: pos
            })
        }

        this.player.onTimeChanged = (time) => {
            this.setState({
                time: time
            })
        }

        this.player.onOpening = () => {
            this.setState({
                buffering: 0,
                playing: false,
                paused: false
            })
        }

        this.player.onBuffering = (perc) => {
            if (perc === 100)
                return this.setState({
                    buffering: false
                });
            return this.setState({
                buffering: perc
            })
        }

        this.player.onPlaying = () => {
            this.setState({
                buffering: false,
                playing: true,
                paused: false
            })
        }

        this.player.onPaused = () => {
            this.setState({
                buffering: false,
                playing: false,
                paused: true
            })
        }

        this.player.onStopped = () => {
            this.setState({
                buffering: false,
                playing: false,
                paused: false
            })
        }

        this.player.onEndReached = () => {
            this.player.stop();
        }

        this.player.onEncounteredError = (error) => {
            console.error(error);
            this.player.stop();
        }

        this.player.playlist.add(this.state.uri)
        this.player.play()
        this.player.subtitles.track = 0;
    },
    handleResize() {
        var canvas = this.refs['wcjs-render'];
        var container = document.body;
        var sourceAspect = canvas.width / canvas.height;
        var destAspect = container.clientWidth / container.clientHeight;
        var cond = destAspect > sourceAspect;

        if (cond) {
            canvas.style.height = "100%";
            canvas.style.width = ((container.clientHeight * sourceAspect) / container.clientWidth) * 100 + "%";
        } else {
            canvas.style.height = ((container.clientWidth / sourceAspect) / container.clientHeight) * 100 + "%";
            canvas.style.width = "100%";
        };
    },
    handleTogglePlay() {
        if (!this.state.buffering)
            this.player.togglePause(this.state.playing ? false : true);
    },
    render() {
        return (
            <div>
               <canvas onClick={this.handleTogglePlay} ref="wcjs-render"/>
            </div>
        );
    }
});