import React from 'react';
import {
    Snackbar
}
from 'material-ui';


export
default React.createClass({
    getInitialState() {
        return {
            message: false,
            show: false
        };
    },
    componentDidMount() {

    },
    componentWillUnmount() {

    },
    update() {
        if (this.isMounted()) {
            this.setState({

            });
        }
    },

    showError(toggle = true) {
        toggle ? this.refs.Snackbar.show() : this.refs.Snackbar.dismiss();
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