import React from 'react';
import player from '../../utils/player';
import SubStore from './store';
import VisibilityStore from '../Visibility/store';
import ls from 'local-storage';

export
default React.createClass({

    getInitialState() {
        var visibilityState = VisibilityStore.getState();
        var subState = SubStore.getState();
        return {
            text: '',
            size: (subState.size * (ls('customSubSize') / 100)),
            visibility: !(visibilityState.playlist || visibilityState.settings),
            color: ls.isSet('subColor') ? ls('subColor') : 0,
            hex: ['#fff', '#ebcb00', '#00e78f', '#00ffff', '#00b6ea'],
            subBottom: subState.marginBottom
        }
    },
    componentWillMount() {
        VisibilityStore.listen(this.update);
        SubStore.listen(this.update);
        player.events.on('subtitleUpdate', this.update);
    },

    componentWillUnmount() {
        VisibilityStore.unlisten(this.update);
        SubStore.unlisten(this.update);
        player.events.removeListener('subtitleUpdate', this.update);
    },
    update() {
        if (this.isMounted()) {
            var visibilityState = VisibilityStore.getState();
            var subState = SubStore.getState();
            this.setState({
                text: subState.text,
                size: (subState.size * (ls('customSubSize') / 100)),
                visibility: !(visibilityState.playlist || visibilityState.settings),
                color: ls.isSet('subColor') ? ls('subColor') : 0,
                subBottom: subState.marginBottom
            });
        }
    },
    render() {
        var style = {
            fontSize: this.state.size,
            zIndex: this.state.visibility ? '10' : '1',
            color: this.state.hex[this.state.color],
            bottom: this.state.subBottom
        };
        return (
            <span className='wcjs-subtitle-text' style={style} dangerouslySetInnerHTML={{__html: this.state.text}} />
        );
    }
});
