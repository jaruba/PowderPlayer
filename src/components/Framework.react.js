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
import {
    app
} from 'remote';
import plugins from '../utils/plugins';
import Modal from './Modal';
import DarkModal from './Player/components/Modal';
import Message from './Message';
import Header from './Header';
import historyActions from '../actions/historyActions';
import traktUtil from './Player/utils/trakt';
import request from 'request';
import subUtil from './Player/utils/subtitles';
import updater from './Player/utils/updates';
import remote from 'remote';
import clArgs from '../utils/clArgs';
import setDefaults from '../utils/defaults';
import ls from 'local-storage';
import Promise from 'bluebird';
import _ from 'lodash';

var attachArgs = true;

var passArgs = function(e, args) {
    if (args.startsWith('[')) {
        JSON.parse(args).forEach(arg => {
            clArgs.process([arg]);
        })
        ipcRenderer.removeListener('cmdline', passArgs)
    } else {
        clArgs.process([args]);
        ipcRenderer.send('app:cmdline');
    }
}

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

        if (ls('startFullscreen'))
             window.clFullscreen = true;

        // login trakt
        if (ls('traktTokens'))
            traktUtil.autoLogin();

        if (remote.process.argv.length > 1) {
            // load command line args
            var args = remote.process.argv;
            args.shift();
            clArgs.process(args);
        }

        if (attachArgs) {
            attachArgs = false;
            app.on('open-file', passArgs);
            app.on('open-url', passArgs);
        }
        ipcRenderer.send('app:cmdline');
        ipcRenderer.on('cmdline', passArgs);


        // analytics
        var ua = require('universal-analytics');
        if (!ls('cid')) {
            var visitor = ua('UA-65979437-4');
            ls('cid', visitor.cid);
        } else {
            var visitor = ua('UA-65979437-4', ls('cid'));
        }
        visitor.pageview("/").send();
    },

    componentWillUnmount() {
        ipcRenderer.removeListener('cmdline', passArgs);
        window.removeEventListener('resize', this.handleResize);
    },

    updatehistory() {
        historyActions.history(this.history);
    },

    render() {
        return (
            <div id="main">
              <textarea className="dropDummy" style={{ display: 'none', position: 'absolute', top: '0', right: '0', left: '0', bottom: '0', width: '100%', zIndex: '1000', opacity: '0' }} />
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