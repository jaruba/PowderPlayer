import React from 'react';
import moment from 'moment';
import _ from 'lodash';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import {
    IconButton
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
            uiShown: playerState.uiShown || playerState.playlistOpen,

            scrobbling: false,
            playing: playerState.playing,
            position: playerState.position,
            buffering: playerState.buffering,
            time: playerState.time,
            length: playerState.length,

            currentTime: playerState.currentTime,
            totalTime: playerState.totalTime,

            rippleEffects: playerState.rippleEffects
        }
    },
    componentWillMount() {
        PlayerStore.listen(this.update);
    },
    componentDidMount() {
        window.addEventListener('mousemove', this.handleGlobalMouseMove);
        window.addEventListener('mouseup', this.handleGlobalMouseUp);
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
                uiShown: playerState.uiShown || playerState.playlistOpen,

                playing: playerState.playing,
                position: playerState.position,
                buffering: playerState.buffering,
                seekable: playerState.seekable,
                time: playerState.time,
                length: playerState.length,

                currentTime: playerState.currentTime,
                totalTime: playerState.totalTime,

                rippleEffects: playerState.rippleEffects
            });
        }
    },
    delayScrobbleGUI() {
        _.delay(() => {
            this.setState({
                keepScrobbleGUI: false
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
            newState.seekPerc = percent_done < 0 ? 0 : percent_done > 1 ? 1 : percent_done;
        }

        if (Object.keys(newState).length) {
            this.setState(newState);
        }

    },
    handleScrobble(event) {
        if (!this.state.length || !this.state.seekable)
            return;

        this.setState({
            keepScrobbleGUI: true,
            scrobbling: false,
            position: this.state.seekPerc
        });

        PlayerActions.scrobbleState(false);

        this.refs['scrobbler-height'].className = this.refs['scrobbler-height'].className.replace(' scrobbling', '');
        this.delayScrobbleGUI();
        var percent_done = event.pageX / document.body.clientWidth;
        PlayerActions.scrobble(this.state.length * percent_done);
    },
    handleDragStart(event) {

        this.setState({
            scrobbling: true
        });

        PlayerActions.scrobbleState(true);

        this.refs['scrobbler-height'].className = this.refs['scrobbler-height'].className + ' scrobbling';

        //        _.delay((still) => {
        //            if (still)
        //                this.refs['scrobbler-handle'].style.opacity = 1;
        //        }, 100, this.state.scrobbling)

        var percent_done = event.pageX / document.body.clientWidth;
        this.setState({
            keepScrobbleGUI: true,
            seekPerc: percent_done
        });
        this.delayScrobbleGUI();
    },
    handleDragEnd() {
        this.refs['scrobbler-tooltip'].style.display = 'none';
        //        this.refs['scrobbler-handle'].style.opacity = 0;
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
    render() {
        var scrobblerStyles = {
            time: {
                width: this.state.scrobbling || this.state.keepScrobbleGUI ? this.state.seekPerc * 100 + '%' : this.state.position * 100 + '%'
            },
            tooltip: {
                marginLeft: '-' + this.state.tooltipHalf + 'px',
                left: this.state.tooltipLeft
            }
        };
        return (
            <div className={this.state.uiShown ? 'control-bar show' : 'control-bar'}>
                <div onMouseUp={this.handleScrobble} onMouseDown={this.handleDragStart} onMouseOut={this.handleDragEnd} onMouseMove={this.handleScrobblerHover} className="scrobbler-padding"></div>
                <div ref="scrobbler-height" className="scrobbler">    
                    <div className="buffer"/>
                    <div ref="scrobbler-time" style={scrobblerStyles.time} className="time"/>
                    <div ref="scrobbler-tooltip" className="tooltip" style={scrobblerStyles.tooltip}>{this.state.humanTime}</div>
                    <div ref="scrobbler-shownTime" className="shownTime">
                        <span ref="scrobbler-currentTime" className="currentTime">{this.state.currentTime}</span> / <span ref="scrobbler-totalTime">{this.state.totalTime}</span>
                    </div>
                    <div ref="scrobbler-handle" className="handle"/>
                </div>
                <IconButton onClick={this.handlePausePlay} iconClassName="material-icons" iconStyle={{top: '-5px', left: '-1px'}} className={this.state.rippleEffects ? 'play-toggle' : 'play-toggle no-ripples'}>{this.state.playing ? 'pause' : 'play_arrow'}</IconButton>

                <IconButton onClick={this.handlePrev} iconClassName="material-icons" iconStyle={{top: '-6px'}} className={'prev-button'}>{'skip_previous'}</IconButton>
                
                <IconButton onClick={this.handleNext} iconClassName="material-icons" iconStyle={{top: '-6px'}} className={'next-button'}>{'skip_next'}</IconButton>

                <IconButton onClick={this.handleFullscreen} iconClassName="material-icons" iconStyle={{color: 'white', fontSize: '30px', top: '-5px', left: '-1px'}} className="fullscreen-toggle">{this.state.fullscreen ? 'fullscreen_exit' : 'fullscreen'}</IconButton>
                <IconButton iconClassName="material-icons" iconStyle={{color: 'white', fontSize: '26px', top: '-5px', left: '-1px'}} className="subtitles-toggle">closed_caption</IconButton>

            </div>
        );
    }
});