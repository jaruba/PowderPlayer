import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import path from 'path';
import wcjsRenderer from '../utils/wcjs-renderer';
import player from '../utils/player';
import events from '../utils/events';
import _ from 'lodash';
import ls from 'local-storage';
import {
    RaisedButton
}
from 'material-ui';

const appPath = require('remote').require('app');

import PlayerActions from '../actions';
import PlayerStore from '../store';
import VisibilityStore from './Visibility/store';
import ControlActions from './Controls/actions';
import ProgressActions from './Controls/components/ProgressBar/actions';
import VolumeActions from './Controls/components/Volume/actions';
import TimeActions from './Controls/components/HumanTime/actions';
import SubtitleActions from './SubtitleText/actions';

try {
    var wcjs_path = (process.env.NODE_ENV === 'development') ? path.join(__dirname, '../../../../bin/', 'WebChimera.js.node') : path.join(appPath.getAppPath(), '../bin/', 'WebChimera.js.node');
    var wcjs = require(wcjs_path);
} catch (e) {
    console.error('WCJS Load Error:', e);
}

function gcd(a, b) {
    if (b > a) {
        var temp = a;
        a = b;
        b = temp;
    }
    while (b != 0) {
        var m = a % b;
        a = b;
        b = m;
    }
    return a;
}

export
default React.createClass({

    mixins: [PureRenderMixin],

    getInitialState() {
        return {
            initialResize: false,
            rippleEffects: ls.isSet('playerRippleEffects') ? ls('playerRippleEffects') : true,
            clickPause: ls.isSet('clickPause') ? ls('clickPause') : true,
            firstPlay: true
        }
    },
    componentWillMount() {

    },
    componentDidMount() {
        var renderRef = this.refs['wcjs-render'];
        var renderParent = this.refs['canvas-holder'];

        window.addEventListener('resize', () => {
            this.handleResize({
                canvas: renderRef,
                canvasParent: renderParent
            });
        });
        player.events.on('resizeNow', this.updateSize);
        player.events.on('rendererUpdate', this.update);
        if (!player.wcjs) {
            player.wcjsInit(wcjsRenderer.init(this.refs['wcjs-render'], [
                "--network-caching=" + ls('bufferSize'),
                "--no-sub-autodetect-file"
            ], {
                fallbackRenderer: false,
                preserveDrawingBuffer: true
            }, wcjs));
        } else {
            wcjsRenderer.reinit(this.refs['wcjs-render'], player.wcjs, {
                fallbackRenderer: false,
                preserveDrawingBuffer: true
            });
        }
        this.initPlayer();
    },
    componentWillUnmount() {
        wcjsRenderer.clearCanvas();
        var playerEvents = player.events;
        playerEvents.removeListener('resizeNow', this.updateSize);
        playerEvents.removeListener('rendererUpdate', this.update);
        window.removeEventListener('resize', this.handleResize);
    },
    update() {
        if (this.isMounted()) {
//            console.log('renderer update');
            this.setState({
                rippleEffects: ls.isSet('playerRippleEffects') ? ls('playerRippleEffects') : true,
                clickPause: ls.isSet('clickPause') ? ls('clickPause') : true,
            });
        }
    },
    updateSize(newValue) {
        player.set(newValue);
        this.handleResize({
            canvas: this.refs['wcjs-render'],
            canvasParent: this.refs['canvas-holder']
        });
    },
    initPlayer() {

        var renderer = this;

        this.player = player.wcjs;
        this.pendingFiles = player.pendingFiles;

        var initializeSize = _.once(() => {
            if (!this.state.initialResize) {
                this.setState({
                    initialResize: true
                });

                this.handleResize({
                    canvas: this.refs['wcjs-render'],
                    canvasParent: this.refs['canvas-holder']
                });
            }
        });

        this.player.onPositionChanged = _.throttle((pos) => {
            var visibilityState = VisibilityStore.getState();
            if (ls('renderHidden') || ((visibilityState.uiShown && !visibilityState.uiHidden) || (visibilityState.playlist || visibilityState.settings)))
                ProgressActions.position(pos);
            initializeSize();
        }, ls('renderFreq'));

        this.player.onOpening = () => {
            wcjsRenderer.clearCanvas();
            events.opening();
        };

        this.player.onTimeChanged = TimeActions.pushTime;

        this.player.onBuffering = _.throttle(events.buffering, ls('renderFreq'));

        this.player.onLengthChanged = TimeActions.length;

        this.player.onSeekableChanged = ProgressActions.seekable;

        this.player.onPlaying = () => {
            if (renderer.state.firstPlay) {
                if (renderer.isMounted()) {
                    renderer.setState({
                        firstPlay: false
                    });
                }
                _.delay(() => {
                    renderer.handleResize({
                        canvas: renderer.refs['wcjs-render'],
                        canvasParent: renderer.refs['canvas-holder']
                    });
                });
            }
            events.playing();
        }

        this.player.onPaused = events.paused;

        this.player.onStopped = () => {
            if (renderer.isMounted())
                renderer.setState({
                    firstPlay: true
                });
            events.stopped();
        }

        this.player.onEndReached = () => {
            if (renderer.isMounted()) {
                renderer.setState({
                    firstPlay: true
                });
            }
            events.ended();
        }

        this.player.onEncounteredError = () => {
            if (renderer.isMounted())
                renderer.setState({
                    firstPlay: true
                });
            events.error();
        }

        this.player.onMediaChanged = () => {
            if (renderer.isMounted())
                renderer.setState({
                    firstPlay: true
                });
            events.mediaChanged();
        }

        if (this.pendingFiles && this.pendingFiles.length) {

            if (this.player.playlist.items.count == 0)
                var playAfter = true;

            for (var i = 0; this.pendingFiles[i]; i++) {
                if (typeof this.pendingFiles[i] === 'string') {
                    this.player.playlist.add(this.pendingFiles[i]);
                } else if (this.pendingFiles[i].uri) {
                    this.player.playlist.add(this.pendingFiles[i].uri);
                    if (this.pendingFiles[i].title)
                        this.player.playlist.items[this.player.playlist.items.count - 1].title = this.pendingFiles[i].title;

                    if (this.pendingFiles[i].byteSize && this.pendingFiles[i].torrentHash)
                        PlayerActions.setDesc({
                            idx: this.player.playlist.items.count - 1,
                            byteSize: this.pendingFiles[i].byteSize,
                            torrentHash: this.pendingFiles[i].torrentHash,
                            path: this.pendingFiles[i].path
                        });
                    else if (this.pendingFiles[i].path)
                        PlayerActions.setDesc({
                            idx: this.player.playlist.items.count - 1,
                            path: this.pendingFiles[i].path
                        });

                }
            }

            if (playAfter) player.wcjs.play();

        }

    },
    calcFontSize() {
        var height = window.innerHeight;
        var width = window.innerWidth;
        var fontSize = 0;

        if (height < 235) {
            fontSize = height / 14;
            if (fontSize < 21.3) fontSize = 21.3;
        } else {
            if (width > 220 && width <= 982) {
                fontSize = ((width - 220) / 40) + 9;
                if (fontSize < 21.3) fontSize = 21.3;
            } else if (width > 982 && width < 1600) {
                fontSize = height / 14;
                if (fontSize > 35) fontSize = 35;
            } else if (width >= 1600 && width <= 1920) {
                fontSize = ((width - 1600) / 35.5) + 40;
            } else if (width > 1920) {
                fontSize = parseInt(width / 39.2);
            } else fontSize = 21.3;
        }

        return fontSize;
    },
    calcSubSize() {
        var height = window.innerHeight;
        var width = window.innerWidth;
        var fontSize = 0;

        if (height < 235) {
            fontSize = height / 14;
            if (fontSize < 16) fontSize = 16;
        } else {
            if (width > 220 && width <= 982) {
                fontSize = ((width - 220) / 40) + 9;
                if (fontSize < 16) fontSize = 16;
            } else if (width > 982 && width < 1600) {
                fontSize = height / 14;
                if (fontSize > 35) fontSize = 35;
            } else if (width >= 1600 && width <= 1920) {
                fontSize = ((width - 1600) / 35.5) + 40;
            } else if (width > 1920) {
                fontSize = parseInt(width / 39.2);
            } else fontSize = 20;
        }
        return fontSize;
    },
    handleResize(obj) {
        var canvas = obj.canvas;
        var canvasParent = obj.canvasParent;
        var container = document.body;
        var width = canvas.width;
        var height = canvas.height;
        var sourceAspect = width / height;

        if (player.aspect != "Default" && player.aspect.indexOf(":") > -1) {
            var res = player.aspect.split(":");
            var ratio = gcd(width, height);
        }

        var destAspect = container.clientWidth / container.clientHeight;

        if (ratio) var sourceAspect = (ratio * parseFloat(res[0])) / (ratio * parseFloat(res[1]));
        else var sourceAspect = width / height;

        if (player.crop != "Default" && player.crop.indexOf(":") > -1) {
            var res = player.crop.split(":");
            var ratio = gcd(width, height);
            var sourceAspect = (ratio * parseFloat(res[0])) / (ratio * parseFloat(res[1]));
        }

        var cond = destAspect > sourceAspect;

        if (player.crop != "Default" && player.crop.indexOf(":") > -1) {
            if (cond) {
                canvasParent.style.height = "100%";
                canvasParent.style.width = (((container.clientHeight * sourceAspect) / container.clientWidth) * 100) + "%";
            } else {
                canvasParent.style.height = (((container.clientWidth / sourceAspect) / container.clientHeight) * 100) + "%";
                canvasParent.style.width = "100%";
            }
            var sourceAspect = width / height;
            var futureWidth = (((canvasParent.offsetHeight * sourceAspect) / canvasParent.offsetWidth) * canvasParent.offsetWidth);
            if (futureWidth < canvasParent.offsetWidth) {
                var sourceAspect = canvas.height / canvas.width;
                canvas.style.width = canvasParent.offsetWidth + "px";
                canvas.style.height = (((canvasParent.offsetWidth * sourceAspect) / canvasParent.offsetHeight) * canvasParent.offsetHeight) + "px";
            } else {
                canvas.style.height = canvasParent.offsetHeight + "px";
                canvas.style.width = (((canvasParent.offsetHeight * sourceAspect) / canvasParent.offsetWidth) * canvasParent.offsetWidth) + "px";
            }
        } else {
            if (cond) {
                canvasParent.style.height = (100 * player.zoom) + "%";
                canvasParent.style.width = (((container.clientHeight * sourceAspect) / container.clientWidth) * 100 * player.zoom) + "%";
            } else {
                canvasParent.style.height = (((container.clientWidth / sourceAspect) / container.clientHeight) * 100 * player.zoom) + "%";
                canvasParent.style.width = (100 * player.zoom) + "%";
            }
            canvas.style.height = "100%";
            canvas.style.width = "100%";
        }

        SubtitleActions.settingChange({
            size: this.calcSubSize()
        });

        player.events.emit('announce', {
            size: this.calcFontSize()
        });

    },
    handleTogglePlay() {
        if (this.state.clickPause)
            player.wcjs.togglePause();
    },
    wheel(event) {
        var volume = (event.deltaY < 0) ? this.player.volume + 5 : this.player.volume - 5;
        VolumeActions.setVolume(volume);
        if (volume >= 0 && volume <= 200)
            PlayerActions.announcement('Volume ' + volume + '%');
    },
    render() {
        var renderStyles = {
            container: {
                textAlign: 'center'
            },
            canvas: {
                display: 'inline-block',
                height: '100vh',
                opacity: this.state.initialResize ? 1 : 0,
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%,-50%)'
            }
        };
        return (
            <div className='render-holder' onWheel={this.wheel}>
                <RaisedButton id={'canvasEffect'} onClick={this.handleTogglePlay} onDoubleClick={ControlActions.toggleFullscreen} iconClassName="material-icons" className={this.state.rippleEffects ? this.state.clickPause ? 'over-canvas' : 'over-canvas no-ripples' : 'over-canvas no-ripples' } label="Canvas Overlay" />
                <div ref="canvas-holder" className="canvas-holder" style={renderStyles.container}>
                    <canvas id={'playerCanvas'} style={renderStyles.canvas} onClick={this.handleTogglePlay} onDoubleClick={ControlActions.toggleFullscreen} ref="wcjs-render" />
                </div>
            </div>
        );
    }
});
