import React from 'react';

import SettingsPanel from '../Settings.react';
import PlayerStore from '../../store';
import PlayerActions from '../../actions';

export
default React.createClass({

    getInitialState() {
        var playerState = PlayerStore.getState();
        return {
            open: false,
            uiHidden: playerState.uiHidden,
		}
    },
    componentWillMount() {
        PlayerStore.listen(this.update);
    },

    componentWillUnmount() {
        PlayerStore.unlisten(this.update);
    },
    
    componentDidMount() {

    },

    update() {
		console.log('settings holder update');
        if (this.isMounted()) {
            var playerState = PlayerStore.getState();
            this.setState({
                open: playerState.settingsOpen,
                uiHidden: playerState.uiHidden
            });
        }
    },

    close() {
        PlayerActions.openSettings(false);
    },

    render() {
        return (
            <div className={this.state.uiHidden ? 'playlist-container' : this.state.open ? 'playlist-container show' : 'playlist-container'}>
                <div className="playlist-controls" / >
                <div className="playlist-holder settings-holder" style={{marginLeft: '0', height: '100%'}}>
                    <SettingsPanel />
                </div> 
            </div>
        );
    }

});