import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
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
        this.refs['volume-slider'].addEventListener('immediate-value-change', VolumeActions.handleVolume);
        this.refs['volume-slider'].addEventListener('mousedown', VolumeActions.volumeDragStart);
        this.refs['volume-slider'].addEventListener('mouseup', VolumeActions.volumeDragStop);
//        var volumeIndex = this.refs['volume-slider'].refs['track'].lastChild;
//        var volumeClass = volumeIndex.className.replace(' volume-hover', '');
//        volumeIndex.className = volumeClass + ' volume-hover';
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
    setVolume() {
        var t = document.querySelector('.vol-slide').immediateValue;
        VolumeActions.setVolume(t);
    },
    render() {
        return (
            <div>
                <paper-icon-button onClick={VolumeActions.handleMute} icon={ 'av:' + (this.state.muted ? 'volume-off' : this.state.volume <= 0 ? 'volume-mute' : this.state.volume <= 120 ? 'volume-down' : 'volume-up') } className="volume-button" noink={true} />
                <paper-slider onClick={this.setVolume} className="vol-slide" name="volume-slider" ref="volume-slider" min="0" max="200" steps="1" value={this.state.muted ? 0 : this.state.volume} noink={true}/>
            </div>
        );
    }
});