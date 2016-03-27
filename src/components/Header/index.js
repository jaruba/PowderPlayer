import React from 'react';
import {
    History
}
from 'react-router';
import HeaderStore from './store';
import HeaderActions from './actions';
import engineStore from '../../stores/engineStore';

export
default React.createClass({

    mixins: [History],

    getInitialState() {
        return {
            maximized: false,
            minimized: false,
            view: 'dashboard',
            title: ''
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
        var engineState = engineStore.getState();
        var title = '';
        if (engineState.torrents && engineState.infoHash && engineState.torrents[engineState.infoHash] && engineState.torrents[engineState.infoHash].torrent && engineState.torrents[engineState.infoHash].torrent.name) {
            title = engineState.torrents[engineState.infoHash].torrent.name;
        }
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
                <div className="windowTitle">
                    {title}
                </div>
            </header>
        );
    }
});