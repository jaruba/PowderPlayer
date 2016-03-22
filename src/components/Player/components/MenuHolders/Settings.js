import React from 'react';

import SettingsPanel from '../Settings.react';
import PlayerActions from '../../actions';
import VisibilityStore from '../Visibility/store';
import VisibilityActions from '../Visibility/actions';

export
default React.createClass({

    getInitialState() {
        var visibilityState = VisibilityStore.getState();
        return {
            open: false,
            uiHidden: visibilityState.uiHidden,
        }
    },
    componentWillMount() {
        VisibilityStore.listen(this.update);
    },

    componentWillUnmount() {
        VisibilityStore.unlisten(this.update);
    },
    
    componentDidMount() {

    },

    update() {
//        console.log('settings holder update');
        if (this.isMounted()) {
            var visibilityState = VisibilityStore.getState();
            this.setState({
                open: visibilityState.settings,
                uiHidden: visibilityState.uiHidden
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
                <div className="playlist-holder settings-holder" style={{marginLeft: '0', height: '100%', textAlign: 'center'}}>
                    <SettingsPanel />
                </div> 
            </div>
        );
    }

});