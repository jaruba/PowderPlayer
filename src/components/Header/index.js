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
            view: 'dashboard'
        };
    },
    componentWillMount() {
        HeaderStore.listen(this.update);
        this.history.listen(this.updatehistory);
    },
    componentWillUnmount() {
        HeaderStore.unlisten(this.update);
        this.history.unlisten(this.updatehistory);
    },
    updatehistory(n, location) {
        if (location.location.pathname)
            this.setState({
                view: (location.location.pathname.substr(1) === '') ? 'dashboard' : location.location.pathname.substr(1)
            });
    },
    update() {
        if (this.isMounted()) {
            this.setState({
                maximized: HeaderStore.getState().maximized,
                minimized: HeaderStore.getState().minimized
            });
        }
    },
    render() {
        var headerClass = 'header ' + process.platform + ' ' + this.state.view;
        return (
            <div className={headerClass}>
                <h1></h1>
                <div className="close" onClick={HeaderActions.close}>
                    <i className="material-icons">clear</i>
                </div>
                <div className="maximize off" onClick={HeaderActions.toggleMaximize}>
                    <i  className="material-icons">crop_landscape</i>
                </div>
                <div className="minimize" onClick={HeaderActions.toggleMinimize}>
                    <i  className="material-icons">remove</i>
                </div>
            </div>
        );
    }
});