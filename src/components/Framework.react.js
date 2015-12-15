import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import {
    RouteContext, History
}
from 'react-router';
import {
    ipcRenderer
}
from 'electron';
import Modal from './Modal';
import Message from './Message';
import TraktMessage from './TraktMessage';
import Header from './Header';
import historyActions from '../actions/historyActions';
import traktUtil from './Player/utils/trakt';

export
default React.createClass({

    mixins: [PureRenderMixin, RouteContext, History],

    componentWillMount() {
        historyActions.history(this.history);
        this.history.listen(this.updatehistory);
    },

    componentDidMount() {
        ipcRenderer.send('app:startup', new Date().getTime());
        require('request')('https://www.google.com/'); // Connect once to avoid cloggage
        if (localStorage.traktTokens)
            traktUtil.autoLogin();
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
              <TraktMessage />
            </div>
        );
    }
});