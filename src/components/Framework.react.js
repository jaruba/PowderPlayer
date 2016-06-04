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
import {
    mouseTrap
}
from 'react-mousetrap';
import plugins from '../utils/plugins';
import Modal from './Modal';
import DarkModal from './Player/components/Modal';
import Message from './Message';
import Header from './Header';
import historyActions from '../actions/historyActions';
import traktUtil from './Player/utils/trakt';
import filmonUtil from './Player/utils/filmon';
import request from 'request';
import subUtil from './Player/utils/subtitles';
import updater from './Player/utils/updates';
import remote from 'remote';
import clArgs from '../utils/clArgs';
import setDefaults from '../utils/defaults';
import ls from 'local-storage';
import Promise from 'bluebird';
import _ from 'lodash';

const Framework = React.createClass({

    mixins: [PureRenderMixin, RouteContext, History],

    componentWillMount() {

        plugins.update();

        Promise.config({
            warnings: {
                wForgottenReturn: false
            }
        });

        updater.checkUpdates();

        setDefaults();

        filmonUtil.init();

        this.props.bindShortcut('ctrl+d', () => ipcRenderer.send('app:toggleDevTools'));

        window.addEventListener('mouseup', function() {
            // removes polymer's element focus which hijacks my enter / space hotkeys
            _.delay(() => {
                if (document.activeElement.tagName != "INPUT")
                    document.querySelector('body').focus();
            }, 500);
        });

        subUtil.fetchOsCookie(true);

        historyActions.history(this.history);
        this.history.listen(this.updatehistory);
    },

    componentDidMount() {
        ipcRenderer.send('app:startup', new Date().getTime());

        request('https://www.google.com'); // Connect once to avoid cloggage

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
              <canvas id="fake-canvas" style={{display: 'none'}} />
            </div>
        );
    }
});

export
default mouseTrap(Framework)