import React from 'react';
import ModalActions from '../actions';
import {
    RaisedButton, Toggle
}
from 'material-ui';


export
default React.createClass({
    getInitialState() {
        return {
            alwaysOnTop: false
        };
    },
    componentWillMount() {

    },

    componentWillUnmount() {

    },
    update() {
        if (this.isMounted()) {

        }
    },
    render() {
        return (
            <div>
               <Toggle
                name="always-on-top"
                defaultToggled={this.state.alwaysOnTop}
                label="Always on top:"/>
            </div>
        );
    }
});