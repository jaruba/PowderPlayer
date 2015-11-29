import React from 'react';
import ModalStore from '../store';
import ModalActions from '../actions';

import MUI from 'material-ui';

const {
    RaisedButton, Toggle
} = MUI;


import playerStore from '../../Player/store';
import playerActions from '../../Player/actions';

export
default React.createClass({

    childContextTypes: {
        muiTheme: React.PropTypes.object,
    },

    getChildContext() {
        return {
            muiTheme: MUI.Styles.ThemeManager.getMuiTheme(MUI.Styles[ModalStore.getState().theme])
        };
    },
    
    getInitialState() {

        var playerState = playerStore.getState();

        return {
            alwaysOnTop: playerState.alwaysOnTop,
            playerRippleEffects: playerState.rippleEffects
        };
    },
    componentWillMount() {
        playerStore.listen(this.update);
    },

    componentWillUnmount() {
        playerStore.unlisten(this.update);
    },
    update() {
        if (this.isMounted()) {

            var playerState = playerStore.getState();

            this.setState({
                alwaysOnTop: playerState.alwaysOnTop,
                playerRippleEffects: playerState.rippleEffects
            });
        }
    },
    handleAlwaysOnTop(event, toggled) {
        playerActions.settingChange({
            alwaysOnTop: toggled
        });
        playerActions.toggleAlwaysOnTop(toggled);
    },
    handlePlayerRippleEffects(event, toggled) {
        
        localStorage.playerRippleEffects = toggled;
        
        playerActions.settingChange({
            rippleEffects: toggled
        });
        
    },
    render() {
        return (
            <div>
                <Toggle
                    name="always-on-top"
                    onToggle={this.handleAlwaysOnTop}
                    defaultToggled={this.state.alwaysOnTop}
                    label="Always on top:"/>

                <Toggle
                    name="player-ripple-effects"
                    onToggle={this.handlePlayerRippleEffects}
                    defaultToggled={this.state.playerRippleEffects}
                    label="Player Ripple Effects:"/>

                <RaisedButton onClick={ModalActions.close} style={{float: 'right', 'marginTop': '20px' }} label="Close" />
            </div>
        );
    }
});