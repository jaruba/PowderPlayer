import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import {
    IconButton, Slider
}
from 'material-ui';
import {
    History
}
from 'react-router';
import PlayerStore from '../../store';
import PlayerActions from '../../actions';
import ControlStore from './store';
import ControlActions from './actions';
import VisibilityStore from '../Visibility/store';

import ls from 'local-storage';
import ui from '../../utils/ui';

export
default React.createClass({
    mixins: [PureRenderMixin],

    getInitialState() {
        var playerState = PlayerStore.getState();
        var visibilityState = VisibilityStore.getState();
        
        return {
            playing: playerState.playing,
            fullscreen: playerState.fullscreen,
            uiShown: visibilityState.uiShown || visibilityState.playlist || visibilityState.settings,
            uiHidden: visibilityState.uiHidden,
            subtitlesOpen: visibilityState.subtitles,
            rippleEffects: ls.isSet('playerRippleEffects') ? ls('playerRippleEffects') : true,

            position: 0,
            scrobbling: false,
            keepScrobble: false,
            progressHover: false,
            seekPerc: 0,
            scrobbleHeight: 'scrobbler',

            currentTime: '00:00',
            totalTime: '00:00',
            length: 0,
            forceTime: false,
            overTime: false,

            volume: ls.isSet('volume') ? ls('volume') : 100,
            muted: false,
            
            foundSubs: false
        }
    },
    componentWillMount() {
        PlayerStore.listen(this.update);
        VisibilityStore.listen(this.update);
        ControlStore.listen(this.update);
    },
    componentDidMount() {
        window.addEventListener('mousemove', (evt) => {
            ControlActions.handleGlobalMouseMove(evt.pageX);
        });
        window.addEventListener('mouseup', ControlActions.handleGlobalMouseUp);
        ControlActions.settingChange({
            volumeSlider: this.refs['volume-slider']
        });
        PlayerStore.getState().events.on('controlsUpdate', this.update);
    },
    componentWillUnmount() {
        PlayerStore.unlisten(this.update);
        VisibilityStore.unlisten(this.update);
        ControlStore.unlisten(this.update);
        PlayerStore.getState().events.removeListener('controlsUpdate', this.update);
    },
    update() {
        if (this.isMounted()) {
            var controlState = ControlStore.getState();
            var playerState = PlayerStore.getState();
            var visibilityState = VisibilityStore.getState();

            this.setState({
                playing: playerState.playing,
                fullscreen: playerState.fullscreen,
                uiShown: visibilityState.uiShown || visibilityState.playlist || visibilityState.settings,
                uiHidden: visibilityState.uiHidden,
                subtitlesOpen: visibilityState.subtitles,
                rippleEffects: ls.isSet('playerRippleEffects') ? ls('playerRippleEffects') : true,

                position: controlState.position,
                scrobbling: controlState.scrobbling,
                keepScrobble: controlState.keepScrobble,
                progressHover: controlState.progressHover,
                seekPerc: controlState.seekPerc,
                scrobbleTooltip: controlState.scrobbleTooltip,
                scrobbleHeight: controlState.scrobbleHeight,
                tooltipLeft: controlState.tooltipLeft,
                tooltipHalf: controlState.tooltipHalf,

                currentTime: controlState.currentTime,
                totalTime: controlState.totalTime,
                humanTime: controlState.humanTime,
                length: controlState.length,
                forceTime: controlState.forceTime,
                overTime: controlState.overTime,

                volume: controlState.volume,
                muted: controlState.muted,
                
                foundSubs: controlState.foundSubs
            });
        }
    },
    render() {
        var scrobblerStyles = {
            time: {
                width: (this.state.scrobbling || this.state.keepScrobble ? this.state.seekPerc : this.state.position) * 100 + '%'
            },
            tooltip: {
                marginLeft: '-' + this.state.tooltipHalf + 'px',
                left: this.state.tooltipLeft,
                display: this.state.progressHover ? 'inline-block' : this.state.scrobbleTooltip
            }
        };
        return (
            <div className={this.state.uiHidden ? 'control-bar' : this.state.uiShown ? 'control-bar show' : 'control-bar'} onMouseEnter={ControlActions.volumeIndexEffect} onMouseLeave={ControlActions.volumeIndexEffect}>
                <div
                    className="scrobbler-padding"
                    onMouseUp={ControlActions.handleScrobble}
                    onMouseDown={ControlActions.handleDragStart}
                    onMouseEnter={ControlActions.handleDragEnter}
                    onMouseOut={ControlActions.handleDragEnd}
                    onMouseMove={(evt) => ControlActions.handleScrobblerHover(evt.pageX)} />
                <div ref="scrobbler-height" className={this.state.scrobbleHeight}>
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

                <IconButton onClick={ControlActions.handlePausePlay} iconClassName="material-icons" iconStyle={{top: '-5px', left: '-1px'}} className={this.state.rippleEffects ? 'play-toggle' : 'play-toggle no-ripples'}>{this.state.playing ? 'pause' : 'play_arrow'}</IconButton>

                <IconButton onClick={PlayerActions.prev} iconClassName="material-icons" iconStyle={{top: '-6px'}} className={'prev-button'}>{'skip_previous'}</IconButton>

                <IconButton onClick={PlayerActions.next} iconClassName="material-icons" iconStyle={{top: '-6px'}} className={'next-button'}>{'skip_next'}</IconButton>

                <IconButton onClick={ControlActions.handleMute} iconClassName="material-icons" iconStyle={{color: '#e7e7e7'}} className="volume-button">{this.state.muted ? 'volume_off' : this.state.volume <= 0 ? 'volume_mute' : this.state.volume <= 120 ? 'volume_down' : 'volume_up' }</IconButton>
                <Slider name="volume-slider" ref="volume-slider" defaultValue={this.state.volume} step={1} min={0} max={200} onChange={ControlActions.handleVolume} value={this.state.muted ? 0 : this.state.volume} onMouseEnter={ControlActions.volumeRippleEffect} onMouseLeave={ControlActions.volumeRippleEffect} onDragStart={ControlActions.volumeDragStart} onDragStop={ControlActions.volumeDragStop} />
                <IconButton onClick={ControlActions.handleFullscreen} iconClassName="material-icons" iconStyle={{color: '#e7e7e7', fontSize: '30px', top: '-5px', left: '-1px'}} className="fullscreen-toggle">{this.state.fullscreen ? 'fullscreen_exit' : 'fullscreen'}</IconButton>
                <IconButton onClick={ui.toggleMenu.bind(null, 'subtitles')} iconClassName="material-icons" iconStyle={{color: this.state.subtitlesOpen ? '#00acff' : '#e7e7e7', fontSize: '26px', top: '-5px', left: '-1px'}} className="subtitles-toggle" style={{display: 'inline-block'}}>closed_caption</IconButton>

            </div>
        );
    }
});
