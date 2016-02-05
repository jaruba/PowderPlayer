import React from 'react';
import _ from 'lodash';
import {
    Snackbar
}
from 'material-ui';
import MessageStore from './store';
import MessageActions from './actions';


export
default React.createClass({
    getInitialState() {
        return {
            message: '',
            open: false
        };
    },
    componentWillMount() {
        MessageStore.listen(this.update);
    },

    componentWillUnmount() {
        MessageStore.unlisten(this.update);
    },
    update() {
        this.setState({
            message: MessageStore.getState().message,
            open: MessageStore.getState().open
        });
    },
    render() {
        return (
            <div>
                <Snackbar 
                    ref="Snackbar"
                    open={this.state.open}
                    message={this.state.message}
                    autoHideDuration={5000}
                    onRequestClose={() => { this.setState({ open: false }) }}
                />
            </div>
        );
    }
});