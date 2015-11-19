import React from 'react';
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
            message: ''
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
            message: MessageStore.getState().message
        });
        this.toggleOpen();
    },

    toggleOpen() {
        if (MessageStore.getState().open) {
            this.refs.Snackbar.show()
        } else
            this.refs.Snackbar.dismiss()
    },

    render() {
        return (
            <div>
                <Snackbar 
                    ref="Snackbar"
                    openOnMount={false}
                    message={this.state.message}
                    autoHideDuration={5000}
                />
            </div>
        );
    }
});