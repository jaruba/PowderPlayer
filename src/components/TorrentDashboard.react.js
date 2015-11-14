import React from 'react';

import engineStore from '../stores/engineStore';
import torrentActions from '../actions/torrentActions';

import utils from '../utils/util';

export
default React.createClass({
    getInitialState() {
        return {
            torrents: engineStore.getState().torrents
        };
    },
    componentDidMount() {
        engineStore.listen(this.update);
    },
    componentWillUnmount() {
        engineStore.unlisten(this.update);
    },
    update() {
        if (this.isMounted()) {
            this.setState({
                torrents: engineStore.getState().torrents
            });
        }
    },


    render() {
        return (
            <div className="wrapper">
             
            </div>
        );
    }
});