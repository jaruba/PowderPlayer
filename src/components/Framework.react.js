import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import {
    RouteContext, History
}
from 'react-router';
import ipc from 'ipc';
import {
    mouseTrap
}
from 'react-mousetrap';
import Modal from './Modal';
import Message from './Message';
import Header from './Header';
import historyActions from '../actions/historyActions';
import traktUtil from './Player/utils/trakt';
import request from 'request';
// we just initiate this here for _reasons_:
import subUtil from './Player/utils/subtitles';

const Framework = React.createClass({

    mixins: [PureRenderMixin, RouteContext, History],

    componentWillMount() {

        this.props.bindShortcut('ctrl+d', () => ipc.send('app:toggleDevTools'));

        historyActions.history(this.history);
        this.history.listen(this.updatehistory);
    },

    componentDidMount() {
        ipc.send('app:startup', new Date().getTime());
        request('https://www.google.com'); // Connect once to avoid cloggage
        if (localStorage.traktTokens)
            traktUtil.autoLogin();
    },

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleResize);
    },

    updatehistory() {
        historyActions.history(this.history);
    },

    render() {
        return (
            <div id="main">
              <Header/>
              {React.cloneElement(this.props.children, {query: this.props.query})}
              <Modal />
              <Message />
            </div>
        );
    }
});

export
default mouseTrap(Framework)