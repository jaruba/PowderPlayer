import React from 'react';
import _ from 'lodash';
import {
    History
}
from 'react-router';

import ModalActions from '../actions';
import ModalStore from '../store';
import EngineStore from '../../../stores/engineStore';
import TorrentActions from '../../../actions/torrentActions'
import PlayerActions from '../../Player/actions';
import player from '../../Player/utils/player';
import parser from '../../Player/utils/parser';
import metaParser from '../../Player/utils/metaParser';

export
default React.createClass({

    mixins: [History],

    getInitialState() {
        return {
            selectedFile: false,
            files: ModalStore.getState().fileSelectorFiles
        };
    },

    componentWillMount() {
        ModalStore.listen(this.update);
    },

    componentWillUnmount() {
        ModalStore.unlisten(this.update);
    },

    handelCancel() {
        ModalActions.close();
    },

    update() {
        if (this.isMounted()) {
            this.setState({
                files: ModalStore.getState().fileSelectorFiles
            });
        }
    },

    getContent() {
        var fileSelectorData = _.omit(this.state.files, ['files_total', 'folder_status']);
        var content = [];
        _.forEach(fileSelectorData, (folder, key) => {
            if (fileSelectorData.folder_status) {
                content.push(this.generateFolder(folder, key))
            } else {
                _.forEach(folder, (file) => {
                    content.push(this.generateFile(file))
                });
            }
        });
        return content;
    },

    generateFolder(files, name) {
        var content = [];

        _.forEach(files, (file) => {
            content.push(this.generateFile(file))
        });

        return (
          <paper-submenu key={name}>
            <paper-item class="menu-trigger">{name}</paper-item>
            <paper-menu class="menu-content">
              {content}
            </paper-menu>
          </paper-submenu>
        );
    },

    handleSelectFile(file) {
        this.setState({
            selectedFile: file
        });
    },

    handleStreamAll() {

        ModalActions.close();
        
        var newFiles = [];
        var queueParser = [];
        var files = this.state.files;

        if (files.ordered.length) {
            files.ordered.forEach( (file_obj, ij) => {
                if (file_obj.name.toLowerCase().replace("sample","") == file_obj.name.toLowerCase() && file_obj.name != "ETRG.mp4" && file_obj.name.toLowerCase().substr(0,5) != "rarbg") {
                    newFiles.push({
                        title: parser(file_obj.name).name(),
                        uri: 'http://127.0.0.1:' + EngineStore.state.torrents[file_obj.infoHash]['stream-port'] + '/' + file_obj.id,
                        byteSize: file_obj.size,
                        torrentHash: file_obj.infoHash,
                        path: file_obj.path
                    });
                    queueParser.push({
                        idx: ij,
                        url: 'http://127.0.0.1:' + EngineStore.state.torrents[file_obj.infoHash]['stream-port'] + '/' + file_obj.id,
                        filename: file_obj.name
                    });
                }
            });
        }
                    
        PlayerActions.addPlaylist(newFiles);
        
        _.delay(() => {
            if (queueParser.length) {
                queueParser.forEach( el => {
                    metaParser.push(el);
                });
            }
        },1000);
        
        this.history.replaceState(null, 'player');

    },

    handleStreamFile(file) {
        file = file.infoHash ? file : this.state.selectedFile;

        ModalActions.close();
        
        var newFiles = [];
        var queueParser = [];
        var playItem = 0;
        var files = this.state.files;

        if (files.ordered.length) {
            files.ordered.forEach( (file_obj, ij) => {
                if (file.id == file_obj.id) {
                    playItem = parseInt(ij);
                }
                if (file_obj.name.toLowerCase().replace("sample","") == file_obj.name.toLowerCase() && file_obj.name != "ETRG.mp4" && file_obj.name.toLowerCase().substr(0,5) != "rarbg") {
                    newFiles.push({
                        title: parser(file_obj.name).name(),
                        uri: 'http://127.0.0.1:' + EngineStore.state.torrents[file_obj.infoHash]['stream-port'] + '/' + file_obj.id,
                        byteSize: file_obj.size,
                        torrentHash: file_obj.infoHash,
                        path: file_obj.path
                    });
                    queueParser.push({
                        idx: ij,
                        url: 'http://127.0.0.1:' + EngineStore.state.torrents[file_obj.infoHash]['stream-port'] + '/' + file_obj.id,
                        filename: file_obj.name
                    });
                }
            });
        }
                    
        PlayerActions.addPlaylist({ selected: playItem, files: newFiles });
        
        _.delay(() => {
            if (queueParser.length) {
                queueParser.forEach( el => {
                    metaParser.push(el);
                });
            }
        },1000);
        
        this.history.replaceState(null, 'player');
    },

    generateFile(file) {
        return (
            <paper-item key={file.id} disabled={!file.streamable} onClick={this.handleSelectFile.bind(this, file)} onDoubleClick={this.handleStreamFile.bind(this, file)} style={{cursor: 'pointer', padding: '5px 15px'}} toggles={true}>
            <paper-item-body two-line>
    <div>{file.name}</div>
    <div secondary>{this.formatBytes(file.size)}</div>
            </paper-item-body>
            </paper-item>
        );
    },
    formatBytes(bytes, decimals) {
        if (bytes == 0) return '0 Byte';
        var k = 1000;
        var dm = decimals + 1 || 3;
        var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        var i = Math.floor(Math.log(bytes) / Math.log(k));
        return (bytes / Math.pow(k, i)).toPrecision(dm) + ' ' + sizes[i];
    },
    render() {
        let playDisabled = this.state.selectedFile ? false : true;
        let folders_enabled = this.state.files.folders;
        let content = this.state.files ? this.getContent() : [];
        return (
            <paper-dialog
                ref="dialog"
                style={{width: '440px', textAlign: 'left', borderRadius: '3px', overflowX: 'auto'}}
                entry-animation="slide-from-top-animation"
                className="prettyScrollWhite"
                opened={true}
                with-backdrop >

                <paper-menu multi>
                    {content.map(function(content_item) {
                        return content_item;
                    })}
                </paper-menu>

                <paper-button
                    raised
                    onClick={this.handleStreamFile}
                    disabled={playDisabled}
                    style={{float: 'right', background: playDisabled ? '#eaeaea' : '#00bcd4', color: playDisabled ? '#a8a8a8' : 'white', padding: '8px 15px', fontWeight: 'bold', marginRight: '22px', marginTop: '15px', textTransform: 'none'}}>
                Play Selected
                </paper-button>

                <paper-button
                    raised
                    onClick={this.handleStreamAll}
                    style={{float: 'right', marginRight: '10px', padding: '8px 15px', fontWeight: 'bold', marginTop: '15px', textTransform: 'none'}}
                    dialog-dismiss>
                Play All
                </paper-button>

                <paper-button
                    raised
                    onClick={this.handelCancel}
                    style={{float: 'right', marginRight: '10px', padding: '8px 15px', fontWeight: 'bold', marginTop: '15px', textTransform: 'none'}}
                    dialog-dismiss>
                Cancel
                </paper-button>

            </paper-dialog>
        );
    }
});