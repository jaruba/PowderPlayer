import React from 'react';
import {
    Snackbar
}
from 'material-ui';
import HeaderStore from './store';
import HeaderActions from './actions';


export
default React.createClass({
    getInitialState() {
        return {
            maximized: false,
            minimized: false
        };
    },
    componentWillMount() {
        HeaderStore.listen(this.update);
    },

    componentWillUnmount() {
        HeaderStore.unlisten(this.update);
    },
    update() {
        if (this.isMounted()) {
            this.setState({
                maximized: HeaderStore.getState().maximized,
                minimized: HeaderStore.getState().minimized
            });
        }
    },

    toggleMaximize() {

    },


    toggleMinimize() {

    },

    render() {
        return (
            <div>
               
            </div>
        );
    }
});