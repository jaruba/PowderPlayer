import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import {
    History
}
from 'react-router';
import {
    clipboard, shell
} from 'electron';
import _ from 'lodash';

import ModalActions from '../actions';

import remote from 'remote';

import engineStore from '../../../stores/engineStore';
import torrentActions from '../../../actions/torrentActions';
import events from '../../Player/utils/events';
import player from '../../Player/utils/player';
import ls from 'local-storage';

export
default React.createClass({

    mixins: [History, PureRenderMixin],

    componentDidMount() {
        this.refs.dialog.open();
        this.refs.dialog.addEventListener('iron-overlay-canceled', ModalActions.close);
    },
    componentWillUnmount() {
        this.refs.dialog.removeEventListener('iron-overlay-canceled', ModalActions.close);
    },
    openFolder() {
        var engineState = engineStore.getState();
        
        var torrent = engineState.torrents[engineState.infoHash];
        
        if (torrent.files[0].path.indexOf('\\') > -1) {
            
            var extPath = '\\' + torrent.files[0].path.substr(0, torrent.files[0].path.indexOf('\\'));
            
        } else if (torrent.files[0].path.indexOf('/') > -1) {

            var extPath = '/' + torrent.files[0].path.substr(0, torrent.files[0].path.indexOf('/'));

        } else {

            var extPath = '';

        }
        shell.openItem(torrent.path + extPath);
        ModalActions.close();
    },
    forceDownload() {
        var engineState = engineStore.getState();
        var torrent = engineState.torrents[engineState.infoHash];
        torrent.discover();
        ModalActions.close();
    },
    copyMagnet() {
        var engineState = engineStore.getState();
        var torrent = engineState.torrents[engineState.infoHash];
        clipboard.writeText('magnet:?xt=urn:btih:' + torrent.infoHash);
        ModalActions.close();
    },
    downloadAll() {
        var engineState = engineStore.getState();
        var torrent = engineState.torrents[engineState.infoHash];
        torrent.files.forEach( el => {
            torrent.selectFile(parseInt(el.fileID));
        });
        ModalActions.close();
    },
    pauseAll() {
        var engineState = engineStore.getState();
        var torrent = engineState.torrents[engineState.infoHash];
        torrent.files.forEach( el => {
            torrent.deselectFile(parseInt(el.fileID));
        });
        ModalActions.close();
    },
    goToPlayer() {
        if (!player.saveState.idx || player.saveState.idx == -1) {
            player.saveState.idx = 0;
        }
        ModalActions.close();
        this.history.replaceState(null, 'player');
    },
    goToMenu() {
        ModalActions.close();
        if (ls('removeLogic') < 1) {
            ModalActions.shouldExit(false);
            ModalActions.open({ type: 'askRemove' });
        } else {
            var engineState = engineStore.getState(),
                torrent = engineState.torrents[engineState.infoHash];

            if (ls('removeLogic') == 1) {
        
                torrent.kill();
        
            } else if (ls('removeLogic') == 2) {
                
                torrent.softKill();

            }
            torrentActions.clear();
            events.close();
            this.history.replaceState(null, '');
        }
    },
    render() {
        return (
            <paper-dialog
                ref="dialog"
                style={{width: '440px', textAlign: 'left', borderRadius: '3px', maxWidth: '90%', backgroundColor: '#303030', padding: '0px', width: '200px', overflowX: 'auto'}}
                entry-animation="slide-from-top-animation"
                className="trakt-info-dialog"
                opened={false}
                with-backdrop >
                
                <header className="menusDashboard">
                    <div className={'controls ' + process.platform} style={{width: 'inherit'}}>
                        <div className="close" onClick={ModalActions.close} style={{height: '35px', lineHeight: '36px', cursor: 'pointer'}}>
                            <i className="ion-ios-close-empty"/>
                        </div>
                    </div>
                    <div style={{float: 'left', color: 'white', paddingTop: '6px', paddingLeft: '12px', fontSize:'15px' }}>
                        Torrent Options
                    </div>
                </header>
                
                <div style={{backgroundColor: '#303030', padding: '0', margin: '0', cursor: 'pointer'}}>

                    <paper-item className="dashboardMenuButton dashboardBorder" onClick={this.openFolder}>
                        <paper-item-body>
                            Open Folder
                        </paper-item-body>
                    </paper-item>

                    <paper-item className="dashboardMenuButton dashboardBorder" onClick={this.forceDownload}>
                        <paper-item-body>
                            Force Download
                        </paper-item-body>
                    </paper-item>

                    <paper-item className="dashboardMenuButton dashboardBorder" onClick={this.copyMagnet}>
                        <paper-item-body>
                            Copy Magnet URI
                        </paper-item-body>
                    </paper-item>

                    <paper-item className="dashboardMenuButton dashboardBorder" onClick={this.downloadAll}>
                        <paper-item-body>
                            Start All
                        </paper-item-body>
                    </paper-item>

                    <paper-item className="dashboardMenuButton dashboardBorder" onClick={this.pauseAll}>
                        <paper-item-body>
                            Pause All
                        </paper-item-body>
                    </paper-item>

                    <paper-item className="dashboardMenuButton dashboardBorder" onClick={this.goToPlayer}>
                        <paper-item-body>
                            Go to Player
                        </paper-item-body>
                    </paper-item>

                    <paper-item className="dashboardMenuButton" onClick={this.goToMenu}>
                        <paper-item-body>
                            Go to Main Menu
                        </paper-item-body>
                    </paper-item>

                </div>

            </paper-dialog>
        );
    }
});