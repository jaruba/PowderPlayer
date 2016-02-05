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
import DarkModal from './Player/components/Modal';
import Message from './Message';
import Header from './Header';
import historyActions from '../actions/historyActions';
import traktUtil from './Player/utils/trakt';
import request from 'request';
import subUtil from './Player/utils/subtitles';
import remote from 'remote';
import clArgs from '../utils/clArgs';
import ls from 'local-storage';
import Promise from 'bluebird';

const Framework = React.createClass({

    mixins: [PureRenderMixin, RouteContext, History],

    componentWillMount() {

        Promise.config({
            warnings: {
                wForgottenReturn: false
            }
        });

        if (!ls.isSet('renderFreq')) ls('renderFreq', 500);
        if (!ls.isSet('renderHidden')) ls('renderHidden', true);
        if (!ls.isSet('subEncoding')) ls('subEncoding', 'auto');
        if (!ls.isSet('peerPort')) ls('peerPort', 6881);
        if (!ls.isSet('maxPeers')) ls('maxPeers', 200);
        if (!ls.isSet('bufferSize')) ls('bufferSize', 7000);

        this.props.bindShortcut('ctrl+d', () => ipc.send('app:toggleDevTools'));

        subUtil.fetchOsCookie(true);

        historyActions.history(this.history);
        this.history.listen(this.updatehistory);
    },

    componentDidMount() {
        ipc.send('app:startup', new Date().getTime());

        require('request')('https://www.google.com'); // Connect once to avoid cloggage

        // login trakt
        if (ls('traktTokens'))
            traktUtil.autoLogin();

        if (remote.process.argv.length > 1) {
            // load command line args
            var args = remote.process.argv;
            args.shift();
            clArgs.process(args);
        }
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
              <DarkModal />
              <Message />
            </div>
        );
    }
});

export
default mouseTrap(Framework)