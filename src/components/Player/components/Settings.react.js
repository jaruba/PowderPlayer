import React from 'react';
import _ from 'lodash';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import MUI from 'material-ui';

const {
    RaisedButton, Toggle, Tabs, Tab
} = MUI;
import PlayerStore from '../store';
import PlayerActions from '../actions';
import traktUtil from '../utils/trakt';
import MessageActions from '../../Message/actions';
import ModalActions from '../../Modal/actions';

var injectTapEventPlugin = require("react-tap-event-plugin");
injectTapEventPlugin();

export
default React.createClass({

    childContextTypes: {
        muiTheme: React.PropTypes.object,
    },

    getChildContext() {
        return {
            muiTheme: MUI.Styles.ThemeManager.getMuiTheme(MUI.Styles['DarkRawTheme'])
        };
    },
    
    mixins: [PureRenderMixin],

    getInitialState() {
        var playerState = PlayerStore.getState();
        return {
            open: false,
            alwaysOnTop: playerState.alwaysOnTop,
            playerRippleEffects: playerState.rippleEffects,
            playerNotifs: localStorage.playerNotifs ? (localStorage.playerNotifs == 'true') : true,
            trakt: traktUtil.loggedIn ? true : false,
            traktScrobble: localStorage.traktScrobble ? (localStorage.traktScrobble == 'true') : true,
            findSubs: localStorage.findSubs ? (localStorage.findSubs == 'true') : true,
            autoSub: localStorage.autoSub ? (localStorage.autoSub == 'true') : true,
            menuFlags: localStorage.menuFlags ? (localStorage.menuFlags == 'true') : true
        }
    },
    componentWillMount() {
        PlayerStore.listen(this.update);
    },

    componentWillUnmount() {
        PlayerStore.unlisten(this.update);
    },
    update() {
        if (this.isMounted()) {
            var playerState = PlayerStore.getState();
            this.setState({
                open: playerState.settingsOpen,
                alwaysOnTop: playerState.alwaysOnTop,
                playerRippleEffects: playerState.rippleEffects,
                trakt: traktUtil.loggedIn ? true : false
            });
        }
    },

    close() {
        PlayerActions.openSettings(false);
    },

    handleOpenPlaylist() {


    },

    handleAlwaysOnTop(event, toggled) {
        PlayerActions.settingChange({
            alwaysOnTop: toggled
        });
        PlayerActions.toggleAlwaysOnTop(toggled);
    },
    handlePlayerRippleEffects(event, toggled) {
        
        localStorage.playerRippleEffects = toggled;
        
        PlayerActions.settingChange({
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
    handleFindSubs(event, toggled) {
        
        localStorage.findSubs = toggled;
        
        this.setState({
            findSubs: toggled
        });
        
    },
    handleScrobbler(event, toggled) {
        
        localStorage.traktScrobble = toggled;
        
        this.setState({
            traktScrobble: toggled
        });
        
    },
    
    handlePlayerNotifs(event, toggled) {
        
        localStorage.playerNotifs = toggled;
        
        this.setState({
            playerNotifs: toggled
        });
        
    },
    
    handleAutoSub(event, toggled) {
        
        localStorage.autoSub = toggled;
        
        this.setState({
            autoSub: toggled
        });
        
    },

    
    handleMenuFlags(event, toggled) {
        
        localStorage.menuFlags = toggled;
        
        this.setState({
            menuFlags: toggled
        });
        
    },

    render() {
        return (
            <div className={this.state.open ? 'playlist-container show' : 'playlist-container'}>
                <div className="playlist-controls" / >
                <div className="playlist-holder settings-holder" style={{marginLeft: '0', height: '100%'}}>
                    <Tabs style={{width: '70vw', maxWidth: '700px', marginTop: '11%', marginLeft: 'auto', marginRight: 'auto', height: '100%'}}>

                        <Tab label="General" style={{height: '100%'}}>
                            <div className="playlist-inner" style={{maxWidth: '700px', maxHeight: 'calc(100% - 130px)'}}>
                                <Toggle
                                    name="always-on-top"
                                    onToggle={this.handleAlwaysOnTop}
                                    defaultToggled={this.state.alwaysOnTop}
                                    label="Always on top:"
                                    style={{marginBottom: '7px'}}/>

                                <Toggle
                                    name="player-ripple-effects"
                                    onToggle={this.handlePlayerRippleEffects}
                                    defaultToggled={this.state.playerRippleEffects}
                                    label="Player Ripple Effects:"
                                    style={{marginBottom: '7px'}}/>

                                <Toggle
                                    name="player-notifs"
                                    onToggle={this.handlePlayerNotifs}
                                    defaultToggled={this.state.playerNotifs}
                                    label="Notifications:"
                                    style={{marginBottom: '7px'}}/>
                            </div>
                        </Tab>

                        <Tab label="Subtitles" style={{height: '100%'}}>
                            <div className="playlist-inner" style={{maxWidth: '700px', maxHeight: 'calc(100% - 130px)'}}>
                                <Toggle
                                    name="find-subs"
                                    onToggle={this.handleFindSubs}
                                    defaultToggled={this.state.findSubs}
                                    label="Find Subtitles:"
                                    style={{marginBottom: '7px'}}/>

                                <Toggle
                                    name="find-subs"
                                    onToggle={this.handleAutoSub}
                                    defaultToggled={this.state.autoSub}
                                    label="Auto-select Subtitle:"
                                    style={{marginBottom: '7px'}}/>

                                <Toggle
                                    name="menu-flags"
                                    onToggle={this.handleMenuFlags}
                                    defaultToggled={this.state.menuFlags}
                                    label="Flags in Menu:"
                                    style={{marginBottom: '7px'}}/>
                            </div>
                        </Tab>

                        <Tab label="Trakt" style={{height: '100%'}}>
                            <div className="playlist-inner" style={{maxWidth: '700px', maxHeight: 'calc(100% - 130px)'}}>
                                <Toggle
                                    name="trakt-scrobble"
                                    onToggle={this.handleScrobbler}
                                    defaultToggled={this.state.traktScrobble}
                                    style={{ 'display': (this.state.trakt ? 'block' : 'none') }}
                                    label="Trakt Scrobble:"
                                    style={{marginBottom: '7px'}}/>
                                <RaisedButton onClick={this.openTraktLogin} label={ this.state.trakt ? 'Trakt Logout' : 'Trakt Login' } />
                            </div>
                        </Tab>

                    </Tabs>
                </div> 
            </div>
        );
    }

    
});