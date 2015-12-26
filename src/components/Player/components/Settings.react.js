import React from 'react';
import _ from 'lodash';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import MUI from 'material-ui';

const {
    RaisedButton, Toggle, Tabs, Tab, TextField, IconButton
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
            menuFlags: localStorage.menuFlags ? (localStorage.menuFlags == 'true') : true,
            defaultSubDelay: playerState.subDelay,
            speed: playerState.speed
        }
    },
    componentWillMount() {
        PlayerStore.listen(this.update);
    },

    componentWillUnmount() {
        PlayerStore.unlisten(this.update);
    },
    
    componentDidMount() {
        PlayerActions.settingChange({
            subDelayField: this.refs['subDelayInput'],
            speedField: this.refs['speedInput']
        });
    },
        
    update() {
        if (this.isMounted()) {
            var playerState = PlayerStore.getState();
            this.setState({
                open: playerState.settingsOpen,
                alwaysOnTop: playerState.alwaysOnTop,
                playerRippleEffects: playerState.rippleEffects,
                trakt: traktUtil.loggedIn ? true : false,
                defaultSubDelay: playerState.subDelay,
                speed: playerState.speed
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

    _handleSubDelayDown(event) {
        this.refs['subDelayInput'].setValue((parseInt(this.refs['subDelayInput'].getValue())-50)+' ms');
        if (event) {
            PlayerActions.setSubDelay(parseInt(this.refs['subDelayInput'].getValue()));
        }
    },
    
    _handleSubDelayUp(event) {
        this.refs['subDelayInput'].setValue((parseInt(this.refs['subDelayInput'].getValue())+50)+' ms');
        if (event) {
            PlayerActions.setSubDelay(parseInt(this.refs['subDelayInput'].getValue()));
        }
    },
    
    _handleSubDelayKeys(event) {
        if (event.keyCode == 38) {
            event.preventDefault();
            this._handleSubDelayUp();
        } else if (event.keyCode == 40) {
            event.preventDefault();
            this._handleSubDelayDown();
        } else if ([13, 27].indexOf(event.keyCode) > -1) {
            event.preventDefault();
            this.refs['subDelayInput'].blur();
        }
    },
    
    _handleSubDelayBlur(event) {
        var newValue = parseInt(this.refs['subDelayInput'].getValue());
        if (isNaN(newValue))
            newValue = 0;

        this.refs['subDelayInput'].setValue(newValue+' ms');
        PlayerActions.setSubDelay(newValue);
    },

    _handleSpeedDown(event) {
        
        var newRate = 0;
        var playerState = PlayerStore.getState();
        var curRate = playerState.wcjs.input.rate;
        
        if (curRate > 0.25 && curRate <= 0.5) newRate = 0.125;
        if (curRate > 0.5 && curRate <= 1) newRate = 0.25;
        if (curRate > 1 && curRate <= 2) newRate = 0.5;
        if (curRate > 2 && curRate <= 4) newRate = 1;
        if (curRate > 4) newRate = curRate /2;
        if ((curRate + newRate) >= 0.25)
            playerState.wcjs.input.rate = curRate - newRate;

        var newValue = parseFloat(Math.round(playerState.wcjs.input.rate * 100) / 100).toFixed(2);

        this.refs['speedInput'].setValue(newValue + 'x');
    },
    
    _handleSpeedUp(event) {

        var newRate = 0;
        var playerState = PlayerStore.getState();
        var curRate = playerState.wcjs.input.rate;
        
        if (curRate >= 0.25 && curRate < 0.5) newRate = 0.125;
        if (curRate >= 0.5 && curRate < 1) newRate = 0.25;
        if (curRate >= 1 && curRate < 2) newRate = 0.5;
        if (curRate >= 2 && curRate < 4) newRate = 1;
        if (curRate >= 4) newRate = curRate;
        if ((curRate + newRate) < 100)
            playerState.wcjs.input.rate = curRate + newRate;

        var newValue = parseFloat(Math.round(playerState.wcjs.input.rate * 100) / 100).toFixed(2);

        this.refs['speedInput'].setValue(newValue + 'x');
        
    },
    
    _handleSpeedKeys(event) {
        if (event.keyCode == 38) {
            event.preventDefault();
            this._handleSpeedUp();
        } else if (event.keyCode == 40) {
            event.preventDefault();
            this._handleSpeedDown();
        } else if ([13, 27].indexOf(event.keyCode) > -1) {
            event.preventDefault();
            this.refs['speedInput'].blur();
        }
    },
    
    _handleSpeedBlur(event) {
        var newValue = parseFloat(this.refs['speedInput'].getValue());
        if (isNaN(newValue))
            newValue = 0.25;

        if (newValue > 64)
            newValue = 64;
        else if (newValue < 0.25)
            newValue = 0.25;

        var newValue = parseFloat(Math.round(newValue * 100) / 100).toFixed(2);

        this.refs['speedInput'].setValue(newValue+'x');
        PlayerStore.getState().wcjs.input.rate = newValue;
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

                                <div className="sub-delay-setting">
                                    <span style={{color: '#fff'}}>
                                        Playback Speed:
                                    </span>
                                    <IconButton
                                        onClick={this._handleSpeedDown}
                                        iconClassName="material-icons"
                                        iconStyle={{color: '#0097a7', fontSize: '22px', float: 'right'}}>
                                        keyboard_arrow_down
                                    </IconButton>
                                    <IconButton
                                        onClick={this._handleSpeedUp}
                                        iconClassName="material-icons"
                                        iconStyle={{color: '#0097a7', fontSize: '22px', float: 'right'}}>
                                        keyboard_arrow_up
                                    </IconButton>
                                    <TextField
                                        ref="speedInput"
                                        defaultValue={parseFloat(Math.round(this.state.speed * 100) / 100).toFixed(2) + 'x'}
                                        onKeyDown={this._handleSpeedKeys}
                                        onBlur={this._handleSpeedBlur}
                                        style={{float: 'right', height: '32px', width: '60px', top: '-5px'}} />
                                </div>
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
                                    name="auto-select-subs"
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

                                <div className="sub-delay-setting">
                                    <span style={{color: '#fff'}}>
                                        Subtitle Delay:
                                    </span>
                                    <IconButton
                                        onClick={this._handleSubDelayDown}
                                        iconClassName="material-icons"
                                        iconStyle={{color: '#0097a7', fontSize: '22px', float: 'right'}}>
                                        keyboard_arrow_down
                                    </IconButton>
                                    <IconButton
                                        onClick={this._handleSubDelayUp}
                                        iconClassName="material-icons"
                                        iconStyle={{color: '#0097a7', fontSize: '22px', float: 'right'}}>
                                        keyboard_arrow_up
                                    </IconButton>
                                    <TextField
                                        ref="subDelayInput"
                                        defaultValue={this.state.defaultSubDelay+' ms'}
                                        onKeyDown={this._handleSubDelayKeys}
                                        onBlur={this._handleSubDelayBlur}
                                        style={{float: 'right', height: '32px', width: '86px', top: '-5px'}} />
                                </div>
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