import React from 'react';
import ModalStore from '../store';
import ModalActions from '../actions';

import MUI from 'material-ui';

const {
    RaisedButton, Toggle
} = MUI;


import playerStore from '../../Player/store';
import playerActions from '../../Player/actions';

import MessageActions from '../../Message/actions';
import traktUtil from '../../Player/utils/trakt';

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
            playerRippleEffects: playerState.rippleEffects,
            trakt: traktUtil.loggedIn ? true : false,
            traktScrobble: localStorage.traktScrobble ? (localStorage.traktScrobble == 'true') : true
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
                playerRippleEffects: playerState.rippleEffects,
                trakt: traktUtil.loggedIn ? true : false
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
    openTraktLogin(event) {
        if (traktUtil.loggedIn) {
            traktUtil.logOut();
            MessageActions.open('Logout Successful');
            this.setState({
                trakt: false
            });
        } else {
            ModalActions.open({
                title: 'Login to Trakt',
                type: 'TraktCode',
                theme: 'DarkRawTheme'
            });
        }
    },
    handleScrobbler(event, toggled) {
        
        localStorage.traktScrobble = toggled;
        
        this.setState({
            traktScrobble: toggled
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

                <Toggle
                    name="trakt-scrobble"
                    onToggle={this.handleScrobbler}
                    defaultToggled={this.state.traktScrobble}
                    style={{ 'display': (this.state.trakt ? 'block' : 'none') }}
                    label="Trakt Scrobble:"/>

                <RaisedButton onClick={ModalActions.close} style={{float: 'right', 'marginTop': '20px' }} label="Close" />
                <RaisedButton onClick={this.openTraktLogin} style={{float: 'right', 'marginTop': '20px', 'marginRight': '15px' }} label={ this.state.trakt ? 'Trakt Logout' : 'Trakt Login' } />
            </div>
        );
    }
});