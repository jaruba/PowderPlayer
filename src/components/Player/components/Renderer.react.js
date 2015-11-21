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
            initialResize: false,

            playing: PlayerStore.getState().playing,
            paused: PlayerStore.getState().paused,
            fullscreen: PlayerStore.getState().fullscreen
        }
    },
    componentWillMount() {
        PlayerStore.listen(this.update);
        window.addEventListener('resize', this.handleResize);
    },
    componentDidMount() {
        if (!PlayerStore.getState().wcjs) {
            PlayerActions.wcjsInit(wcjsRenderer.init(this.refs['wcjs-render'], [
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
            ], {
                fallbackRenderer: false,
                preserveDrawingBuffer: true
            }, wcjs));
        } else {
            wcjsRenderer.reinit(this.refs['wcjs-render'], PlayerStore.getState().wcjs, {
                fallbackRenderer: false,
                preserveDrawingBuffer: true
            });
        }
        this.initPlayer();
    },
    componentWillUnmount() {
        wcjsRenderer.clearCanvas();
        PlayerStore.unlisten(this.update);
        window.removeEventListener('resize', this.handleResize);
    },
    update() {
        if (this.isMounted()) {
            this.setState({
                uri: PlayerStore.getState().uri,
                playing: PlayerStore.getState().playing,
                fullscreen: PlayerStore.getState().fullscreen
            });
        }
    },
    initPlayer() {
        this.player = PlayerStore.getState().wcjs;

        this.player.onPositionChanged = (pos) => {
            PlayerActions.position(pos);
            if (!this.state.initialResize) {
                this.setState({
                    initialResize: true
                });
                this.handleResize();
            }

        }

        this.player.onTimeChanged = (time) => {
            PlayerActions.time(time);
        }

        this.player.onOpening = () => {
            PlayerActions.buffering(0);
        }

        this.player.onBuffering = (perc) => {
            PlayerActions.buffering(perc);
        }

        this.player.onLengthChanged = (length) => {
            PlayerActions.length(length);
        }

        this.player.onSeekableChanged = (seekable) => {
            PlayerActions.seekable(seekable);
        }

        this.player.onPlaying = () => {
            PlayerActions.playing();
        }

        this.player.onPaused = () => {
            PlayerActions.pause();
        }

        this.player.onStopped = () => {
            PlayerActions.stopped();
        }

        this.player.onEndReached = () => {
            this.player.stop();
        }

        this.player.onEncounteredError = (error) => {
            console.error(error);
            this.player.stop();
        }

        this.player.playlist.add(this.state.uri);
        this.player.play();
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
        var renderStyles = {
            container: {
                textAlign: 'center'
            },
            canvas: {
                display: 'inline-block',
                height: '100vh',
                opacity: this.state.initialResize ? 1 : 0
            }
        };
        return (
            <div style={renderStyles.container}>
                <canvas style={renderStyles.canvas} onClick={this.handleTogglePlay} ref="wcjs-render" />
            </div>
        );
    }
});