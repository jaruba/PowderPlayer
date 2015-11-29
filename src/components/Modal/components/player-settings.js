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
        return {
            alwaysOnTop: playerStore.getState().alwaysOnTop,
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
            this.setState({
                alwaysOnTop: playerStore.getState().alwaysOnTop,
            });
        }
    },
    handelalwaysOnTop(event, toggled) {
        playerActions.settingChange({
            alwaysOnTop: toggled
        });
        playerActions.toggleAlwaysOnTop(toggled);
    },
    render() {
        return (
            <div>
                <Toggle
                    name="always-on-top"
                    onToggle={this.handelalwaysOnTop}
                    defaultToggled={this.state.alwaysOnTop}
                    label="Always on top:"/>

                <RaisedButton onClick={ModalActions.close} style={{float: 'right', 'marginTop': '20px' }} label="Close" />
            </div>
        );
    }
});