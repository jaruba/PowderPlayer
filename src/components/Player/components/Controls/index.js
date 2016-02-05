import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import {
    IconButton
}
from 'material-ui';
import {
    History
}
from 'react-router';
import _ from 'lodash';
import HumanTime from './components/HumanTime';
import ProgressBar from './components/ProgressBar';
import Tooltip from './components/Tooltip';
import Volume from './components/Volume';
import player from '../../utils/player';
import ControlStore from './store';
import ControlActions from './actions';
import VolumeActions from './components/Volume/actions';
import VisibilityStore from '../Visibility/store';

import ls from 'local-storage';
import ui from '../../utils/ui';

export
default React.createClass({
    mixins: [PureRenderMixin],

    getInitialState() {
        var visibilityState = VisibilityStore.getState();
        
        return {
            playing: player.wcjs.playing,
            fullscreen: false,
            uiShown: visibilityState.uiShown || visibilityState.playlist || visibilityState.settings,
            uiHidden: visibilityState.uiHidden,
            subtitlesOpen: visibilityState.subtitles,
            rippleEffects: ls.isSet('playerRippleEffects') ? ls('playerRippleEffects') : true,

            foundSubs: false
        }
    },
    componentWillMount() {
        VisibilityStore.listen(this.update);
        ControlStore.listen(this.update);
    },
    componentDidMount() {
        player.events.on('controlsUpdate', this.update);
    },
    componentWillUnmount() {
        VisibilityStore.unlisten(this.update);
        ControlStore.unlisten(this.update);
        player.events.removeListener('controlsUpdate', this.update);
    },
    update() {
        if (this.isMounted()) {
            var controlState = ControlStore.getState();
            var visibilityState = VisibilityStore.getState();

            this.setState({
                playing: player.wcjs.playing,
                uiShown: visibilityState.uiShown || visibilityState.playlist || visibilityState.settings,
                uiHidden: visibilityState.uiHidden,
                subtitlesOpen: visibilityState.subtitles,
                rippleEffects: ls.isSet('playerRippleEffects') ? ls('playerRippleEffects') : true,

                foundSubs: controlState.foundSubs,
                
                fullscreen: controlState.fullscreen
            });
        }
    },
    render() {
        return (
            <div className={this.state.uiHidden ? 'control-bar' : this.state.uiShown ? 'control-bar show' : 'control-bar'} onMouseEnter={VolumeActions.volumeIndexEffect} onMouseLeave={VolumeActions.volumeIndexEffect}>
                <ProgressBar />
                <Tooltip />
                <HumanTime />

                <IconButton onClick={ControlActions.handlePausePlay} iconClassName="material-icons" iconStyle={{top: '-5px', left: '-1px'}} className={this.state.rippleEffects ? 'play-toggle' : 'play-toggle no-ripples'}>{this.state.playing ? 'pause' : 'play_arrow'}</IconButton>

                <IconButton onClick={player.prev} iconClassName="material-icons" iconStyle={{top: '-6px'}} className={'prev-button'}>{'skip_previous'}</IconButton>

                <IconButton onClick={player.next} iconClassName="material-icons" iconStyle={{top: '-6px'}} className={'next-button'}>{'skip_next'}</IconButton>

                <Volume />
                <IconButton onClick={ControlActions.toggleFullscreen} iconClassName="material-icons" iconStyle={{color: '#e7e7e7', fontSize: '30px', top: '-5px', left: '-1px'}} className="fullscreen-toggle">{this.state.fullscreen ? 'fullscreen_exit' : 'fullscreen'}</IconButton>
                <IconButton onClick={ui.toggleMenu.bind(null, 'subtitles')} iconClassName="material-icons" iconStyle={{color: this.state.subtitlesOpen ? '#00acff' : '#e7e7e7', fontSize: '26px', top: '-5px', left: '-1px'}} className="subtitles-toggle" style={{display: 'inline-block'}}>closed_caption</IconButton>

            </div>
        );
    }
});
