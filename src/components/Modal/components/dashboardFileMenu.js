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
import ModalStore from '../store';

import remote from 'remote';

import engineStore from '../../../stores/engineStore';
import mimeUtil from '../../../utils/mimeDetectorUtil.js';
import player from '../../Player/utils/player';

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
    playNow() {
        var engineState = engineStore.getState(),
            modalState = ModalStore.getState(),
            torrent = engineState.torrents[engineState.infoHash],
            file = torrent.files[modalState.index];

        if (/^win/.test(process.platform)) var pathBreak = "\\";
        else var pathBreak = "/";

        var playlistItem = -1;
        
        for (var i = 0; i < player.wcjs.playlist.items.count; i++) {
            if (player.wcjs.playlist.items[i].mrl.endsWith('/' + file.fileID)) {
                playlistItem = i;
                break;
            }
        }


        if (playlistItem > -1) {
            player.saveState = {
                idx: playlistItem,
                position: 0
            };
        }
        ModalActions.close();
        this.history.replaceState(null, 'player');
    },
    openFile() {
        var engineState = engineStore.getState(),
            modalState = ModalStore.getState(),
            torrent = engineState.torrents[engineState.infoHash],
            file = torrent.files[modalState.index];

        if (/^win/.test(process.platform)) var pathBreak = "\\";
        else var pathBreak = "/";

        shell.openItem(torrent.path + pathBreak + file.path);
        ModalActions.close();
    },
    openFolder() {
        var engineState = engineStore.getState(),
            modalState = ModalStore.getState(),
            torrent = engineState.torrents[engineState.infoHash],
            file = torrent.files[modalState.index];
        
        if (/^win/.test(process.platform)) var pathBreak = "\\";
        else var pathBreak = "/";

        shell.showItemInFolder(torrent.path + pathBreak + file.path);
        ModalActions.close();
    },
    copyStreamURL() {
        var engineState = engineStore.getState(),
            modalState = ModalStore.getState(),
            torrent = engineState.torrents[engineState.infoHash],
            file = torrent.files[modalState.index];

        clipboard.writeText('http://127.0.0.1:' + torrent.server.address().port + '/' + file.fileID);
        ModalActions.close();
    },

    render() {
        var engineState = engineStore.getState(),
            modalState = ModalStore.getState(),
            torrent = engineState.torrents[engineState.infoHash],
            file = torrent.files[modalState.index],
            progress = torrent.torrent.pieces.downloaded / torrent.torrent.pieces.length,
            fileProgress = Math.round(torrent.torrent.pieces.bank.filePercent(file.offset, file.length) * 100),
            passiveButtons = [],
            finished = false;

        if (progress == 1)
            finished = true;
        else if (fileProgress >= 100)
            finished = true;
            
        if (mimeUtil.supportedMedia(file.path, 'all')) {
            var newButton = (
                <paper-item className="dashboardMenuButton dashboardBorder" onClick={this.playNow}>
                    <paper-item-body>
                        Play Now
                    </paper-item-body>
                </paper-item>
            );
            passiveButtons.push(newButton);
        }
        
        if (finished) {
            var newButton = (
                <paper-item className="dashboardMenuButton dashboardBorder" onClick={this.openFile}>
                    <paper-item-body>
                        Open File
                    </paper-item-body>
                </paper-item>
            );
            passiveButtons.push(newButton);
        }
        
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
                        File Options
                    </div>
                </header>
                
                <div style={{backgroundColor: '#303030', padding: '0', margin: '0', cursor: 'pointer'}}>

                    {passiveButtons}
                    
                    <paper-item className="dashboardMenuButton dashboardBorder" onClick={this.openFolder}>
                        <paper-item-body>
                            Open Containing Folder
                        </paper-item-body>
                    </paper-item>

                    <paper-item className="dashboardMenuButton dashboardBorder" onClick={this.copyStreamURL}>
                        <paper-item-body>
                            Copy Stream URL
                        </paper-item-body>
                    </paper-item>

                </div>

            </paper-dialog>
        );
    }
});