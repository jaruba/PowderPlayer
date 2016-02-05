import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import {
    IconButton, Slider
}
from 'material-ui';
import ls from 'local-storage';
import VolumeStore from './store';
import VolumeActions from './actions';

export
default React.createClass({

    mixins: [PureRenderMixin],

    getInitialState() {
        return {
            volume: ls.isSet('volume') ? ls('volume') : 100,
            muted: false
        }
    },
    componentWillMount() {
        VolumeStore.listen(this.update);
    },
    componentDidMount() {
        VolumeActions.settingChange({
            volumeSlider: this.refs['volume-slider']
        });
        var volumeIndex = this.refs['volume-slider'].refs['track'].lastChild;
        var volumeClass = volumeIndex.className.replace(' volume-hover', '');
        volumeIndex.className = volumeClass + ' volume-hover';
    },
    componentWillUnmount() {
        VolumeStore.unlisten(this.update);
    },
    update() {
        if (this.isMounted()) {
//            console.log('volume update');
            var volumeState = VolumeStore.getState();
            this.setState({
                volume: volumeState.volume,
                muted: volumeState.muted
            });
        }
    },
    render() {
        return (
            <div>
                <IconButton onClick={VolumeActions.handleMute} iconClassName="material-icons" iconStyle={{color: '#e7e7e7'}} className="volume-button">{this.state.muted ? 'volume_off' : this.state.volume <= 0 ? 'volume_mute' : this.state.volume <= 120 ? 'volume_down' : 'volume_up' }</IconButton>
                <Slider name="volume-slider" ref="volume-slider" defaultValue={this.state.volume} step={1} min={0} max={200} onChange={VolumeActions.handleVolume} value={this.state.muted ? 0 : this.state.volume} onMouseEnter={VolumeActions.volumeRippleEffect} onMouseLeave={VolumeActions.volumeRippleEffect} onDragStart={VolumeActions.volumeDragStart} onDragStop={VolumeActions.volumeDragStop} />
            </div>
        );
    }
});