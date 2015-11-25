import React from 'react';
import ModalActions from '../actions';
import {
    RaisedButton, Toggle
}
from 'material-ui';

import playerStore from '../../Player/store';
import playerActions from '../../Player/actions';

export
default React.createClass({
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