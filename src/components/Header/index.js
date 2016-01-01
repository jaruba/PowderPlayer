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

            var headerState = HeaderStore.getState();

            this.setState({
                maximized: headerState.maximized,
                minimized: headerState.minimized
            });
        }
    },
    render() {
        return (
            <header className={this.state.view}>
                <div className={'controls ' + process.platform}>
                    <div className="close" onClick={HeaderActions.close}>
                        <i className="ion-ios-close-empty"/>
                    </div>
                    <div className="toggle" onClick={HeaderActions.toggleMaximize}>
                        <i/>
                        <i/>
                    </div>
                    <div className="minimize" onClick={HeaderActions.toggleMinimize}>
                        <i/>
                    </div>
                </div>
            </header>
        );
    }
});