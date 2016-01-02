import React from 'react';
import moment from 'moment';
import _ from 'lodash';
import ls from 'local-storage';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import {
    IconButton, Slider
}
from 'material-ui';
import {
    handleTime
}
from '../utils/time';
import PlayerStore from '../store';
import PlayerActions from '../actions';

export
default React.createClass({

    mixins: [PureRenderMixin],

    getInitialState() {

        var playerState = PlayerStore.getState();

        return {
            fullscreen: playerState.fullscreen,
            uiShown: playerState.uiShown || playerState.playlistOpen || playerState.settingsOpen,
            uiHidden: playerState.uiHidden,

            scrobbling: playerState.scrobbling,
            playing: playerState.playing,
            position: playerState.position,
            buffering: playerState.buffering,
            time: playerState.time,
            length: playerState.length,
            keepScrobble: playerState.keepScrobble,
            seekPerc: playerState.seekPerc,

            currentTime: playerState.currentTime,
            totalTime: playerState.totalTime,

            rippleEffects: playerState.rippleEffects,

            foundSubs: playerState.foundSubs,
            subtitlesOpen: playerState.subtitlesOpen,

            volume: ls('volume'),
            mute: playerState.muted,

            volumeDragging: false,
            volumePendingEffects: '',
            volumePendingRipples: '',

            forceTime: playerState.forceTime,
            overTime: playerState.overTime
        }
    },
    componentWillMount() {
        PlayerStore.listen(this.update);
    },
    componentDidMount() {
        window.addEventListener('mousemove', this.handleGlobalMouseMove);
        window.addEventListener('mouseup', this.handleGlobalMouseUp);

        // assign a class to the volume index pointer
        var volumeSlider = this.refs['volume-slider'][0].children[4].children[0].children[2];
        volumeSlider.className = 'volume-index volume-hover';
        volumeSlider.children[0].className = 'volume-ripple';
    },
    componentWillUnmount() {
        window.removeEventListener('mousemove', this.handleGlobalMouseMove);
        window.removeEventListener('mouseup', this.handleGlobalMouseUp);
        PlayerStore.unlisten(this.update);
    },
    update() {
        if (this.isMounted()) {

            var playerState = PlayerStore.getState();

            this.setState({
                fullscreen: playerState.fullscreen,
                uiShown: playerState.uiShown || playerState.playlistOpen || playerState.settingsOpen,
                uiHidden: playerState.uiHidden,

                playing: playerState.playing,
                position: playerState.position,
                buffering: playerState.buffering,
                seekable: playerState.seekable,
                time: playerState.time,
                length: playerState.length,
                scrobbling: playerState.scrobbling,
                seekPerc: playerState.seekPerc,

                currentTime: playerState.currentTime,
                totalTime: playerState.totalTime,

                rippleEffects: playerState.rippleEffects,

                foundSubs: playerState.foundSubs,
                subtitlesOpen: playerState.subtitlesOpen,

                volume: ls('volume'),
                mute: playerState.muted,

                forceTime: playerState.forceTime,
                overTime: playerState.overTime,

                keepScrobble: playerState.keepScrobble
            });
        }
    },
    delayScrobbleGUI() {
        _.delay(() => {
            PlayerActions.settingChange({
                keepScrobble: false
            })
        }, 1000)
    },
    handlePausePlay() {
        this.state.playing ? PlayerActions.pause() : PlayerActions.play();
    },
    handleNext() {
        PlayerActions.next();
    },
    handlePrev() {
        PlayerActions.prev();
    },
    handleFullscreen() {
        PlayerActions.toggleFullscreen(!this.state.fullscreen);
    },
    handleScrobblerHover(event) {

        var newState = {};

        var total_time = this.state.length;

        var percent_done = event.pageX / document.body.clientWidth;

        var newTime = total_time * percent_done;
        //        this.refs['scrobbler-handle'].style.left = (percent_done * 100) + '%';
        //console.log(total_time, percent_done + '%', newTime);
        if (this.state.time) {
            this.refs['scrobbler-tooltip'].style.display = 'inline-block';
            if (percent_done <= 0.5) {
                var realPos = Math.floor(window.innerWidth * percent_done) - this.state.tooltipHalf;
            } else {
                var realPos = Math.floor(window.innerWidth * percent_done) + this.state.tooltipHalf;
            }

            var seekTime = handleTime(percent_done * this.state.length, this.state.length);

            if (seekTime.length > 5)
                newState.tooltipHalf = 33;
            else
                newState.tooltipHalf = 24;

            if (realPos < 0) newState.tooltipLeft = newState.tooltipHalf + 'px';
            else if (realPos > window.innerWidth) newState.tooltipLeft = (window.innerWidth - newState.tooltipHalf) + 'px';
            else newState.tooltipLeft = (percent_done * 100) + '%';

            newState.humanTime = seekTime;
        }

        if (this.state.scrobbling) {
            PlayerActions.settingChange({
                seekPerc: percent_done < 0 ? 0 : percent_done > 1 ? 1 : percent_done
            });
        }

        if (Object.keys(newState).length) {
            this.setState(newState);
        }

    },
    handleScrobble(event) {
        if (!this.state.length || !this.state.seekable)
            return;

        PlayerActions.settingChange({
            keepScrobble: true,
            scrobbling: false
        });

        this.setState({
            position: this.state.seekPerc
        });

        this.refs['scrobbler-height'].className = this.refs['scrobbler-height'].className.replace(' scrobbling', '');
        this.delayScrobbleGUI();
        var percent_done = event.pageX / document.body.clientWidth;
        PlayerActions.scrobble(this.state.length * percent_done);
    },
    handleDragStart(event) {

        PlayerActions.scrobbleState(true);

        this.refs['scrobbler-height'].className = this.refs['scrobbler-height'].className + ' scrobbling';

        PlayerActions.settingChange({
            keepScrobble: true
        });
        var percent_done = event.pageX / document.body.clientWidth;
        PlayerActions.settingChange({
            seekPerc: percent_done
        });
        this.delayScrobbleGUI();
    },
    handleDragEnd() {
        this.refs['scrobbler-tooltip'].style.display = 'none';
    },
    handleGlobalMouseMove(event) {
        if (this.state.scrobbling) {
            this.handleScrobblerHover(event);
        }
    },
    handleGlobalMouseUp(event) {
        if (this.state.scrobbling) {
            this.handleScrobble(event);
            this.refs['scrobbler-tooltip'].style.display = 'none';
        }
    },
    handleVolume(event, t) {
        PlayerActions.volume(t);
    },
    handleMute(event) {
        PlayerActions.mute(!this.state.mute);
    },
    volumeIndexEffect(f, b, i) {
        if (i) {
            if (!this.state.volumeDragging) {
                var volumeIndex = document.querySelector('.volume-index');
                var volumeClass = volumeIndex.className.replace(' volume-hover', '');
                if (i.type == 'react-mouseenter') {
                    volumeIndex.className = volumeClass;
                } else if (i.type == 'react-mouseleave') {
                    volumeIndex.className = volumeClass + ' volume-hover';
                }
            } else if (i.type) {
                this.setState({
                    volumePendingEffects: i.type
                })
            }
        }
    },
    volumeRippleEffect(c, i, a) {
        if (a) {
            if (!this.state.volumeDragging) {
                var volumeRipple = document.querySelector('.volume-ripple');
                var volumeClass = volumeRipple.className.replace(' volume-ripple-hover', '');
                if (a.type == 'react-mouseenter') {
                    volumeRipple.className = volumeClass;
                } else if (a.type == 'react-mouseleave') {
                    volumeRipple.className = volumeClass + ' volume-ripple-hover';
                }
            } else if (a.type) {
                this.setState({
                    volumePendingRipples: a.type
                });
            }
        }
    },
    volumeDragStart() {
        this.setState({
            volumeDragging: true
        });
    },
    volumeDragStop() {
        this.setState({
            volumeDragging: false
        });
        if (this.state.volumePendingEffects) {
            this.volumeIndexEffect(null, null, {
                type: this.state.volumePendingEffects
            });
            this.setState({
                volumePendingEffects: ''
            });
        }
        if (this.state.volumePendingRipples) {
            this.volumeRippleEffect(null, null, {
                type: this.state.volumePendingRipples
            });
            this.setState({
                volumePendingRipples: ''
            });
        }
    },
    render() {
        var scrobblerStyles = {
            time: {
                width: this.state.scrobbling || this.state.keepScrobble ? this.state.seekPerc * 100 + '%' : this.state.position * 100 + '%'
            },
            tooltip: {
                marginLeft: '-' + this.state.tooltipHalf + 'px',
                left: this.state.tooltipLeft
            }
        };
        return (
            <div className={this.state.uiHidden ? 'control-bar' : this.state.uiShown ? 'control-bar show' : 'control-bar'} onMouseEnter={this.volumeIndexEffect} onMouseLeave={this.volumeIndexEffect}>
                <div onMouseUp={this.handleScrobble} onMouseDown={this.handleDragStart} onMouseOut={this.handleDragEnd} onMouseMove={this.handleScrobblerHover} className="scrobbler-padding"></div>
                <div ref="scrobbler-height" className="scrobbler">
                    <div className="buffer"/>
                    <div ref="scrobbler-time" style={scrobblerStyles.time} className="time"/>
                    <div ref="scrobbler-tooltip" className="tooltip" style={scrobblerStyles.tooltip}>{this.state.humanTime}</div>
                    <div ref="scrobbler-shownTime" className="shownTime">
                        <span ref="scrobbler-currentTime" className="currentTime">{
                            this.state.forceTime ? this.state.overTime : this.state.currentTime
                        }</span> / <span ref="scrobbler-totalTime">{this.state.totalTime}</span>
                    </div>
                    <div ref="scrobbler-handle" className="handle"/>
                </div>

                <IconButton onClick={this.handlePausePlay} iconClassName="material-icons" iconStyle={{top: '-5px', left: '-1px'}} className={this.state.rippleEffects ? 'play-toggle' : 'play-toggle no-ripples'}>{this.state.playing ? 'pause' : 'play_arrow'}</IconButton>

                <IconButton onClick={this.handlePrev} iconClassName="material-icons" iconStyle={{top: '-6px'}} className={'prev-button'}>{'skip_previous'}</IconButton>

                <IconButton onClick={this.handleNext} iconClassName="material-icons" iconStyle={{top: '-6px'}} className={'next-button'}>{'skip_next'}</IconButton>

                <IconButton onClick={this.handleMute} iconClassName="material-icons" iconStyle={{color: '#e7e7e7'}} className="volume-button">{this.state.mute ? 'volume_off' : this.state.volume <= 0 ? 'volume_mute' : this.state.volume <= 120 ? 'volume_down' : 'volume_up' }</IconButton>
                <Slider name="volume-slider" ref="volume-slider" defaultValue={this.state.volume} step={1} min={0} max={200} onChange={this.handleVolume} value={this.state.mute ? 0 : this.state.volume} onMouseEnter={this.volumeRippleEffect} onMouseLeave={this.volumeRippleEffect} onDragStart={this.volumeDragStart} onDragStop={this.volumeDragStop} />
                <IconButton onClick={this.handleFullscreen} iconClassName="material-icons" iconStyle={{color: '#e7e7e7', fontSize: '30px', top: '-5px', left: '-1px'}} className="fullscreen-toggle">{this.state.fullscreen ? 'fullscreen_exit' : 'fullscreen'}</IconButton>
                <IconButton onClick={PlayerActions.toggleSubtitles} iconClassName="material-icons" iconStyle={{color: this.state.subtitlesOpen ? '#00acff' : '#e7e7e7', fontSize: '26px', top: '-5px', left: '-1px'}} className="subtitles-toggle" style={{display: 'inline-block'}}>closed_caption</IconButton>

            </div>
        );
    }
});