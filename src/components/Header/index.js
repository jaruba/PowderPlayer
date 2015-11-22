import React from 'react';
import {
    History
}
from 'react-router';
import HeaderStore from './store';
import HeaderActions from './actions';


export
default React.createClass({

    mixins: [History],

    getInitialState() {
        return {
            maximized: false,
            minimized: false,
            view: false
        };
    },
    componentWillMount() {
        HeaderStore.listen(this.update);
        this.history.listen(this.updatehistory)
    },
    componentWillUnmount() {
        HeaderStore.unlisten(this.update);
    },
    updatehistory(n, location) {
        this.setState({
            view: (location.pathname === '/') ? 'dashboard' : 'player'
        });
    },
    update() {
        if (this.isMounted()) {
            this.setState({
                maximized: HeaderStore.getState().maximized,
                minimized: HeaderStore.getState().minimized,
                view: HeaderStore.getState().view
            });
        }
    },
    render() {
        return (
            <div className="header windows">
                <h1>Powder Player</h1>
                <i onClick={HeaderActions.close} className="material-icons close">clear</i>
                <i onClick={HeaderActions.toggleMaximize} className="material-icons maximize off">crop_3_2</i>
                <i onClick={HeaderActions.toggleMinimize} className="material-icons minimize">remove</i>
            </div>
        );
    }
});