import ModalActions from '../components/Modal/actions';
import PlayerActions from '../components/Player/actions';
import EngineStore from '../stores/engineStore';
import HistoryStore from '../stores/historyStore';
import _ from 'lodash';
import alt from '../alt';
import path from 'path';
import {
    ipcRenderer
}
from 'electron';
import parser from '../components/Player/utils/parser';

class torrentActions {

    constructor() {
        this.generateActions(
            'add',
            'remove',
            'change',
            'selectFile'
        );
    }

    addTorrent(torrent) {
        var TorrentUtil = require('../utils/stream/torrentUtil');
        this.dispatch();
        TorrentUtil.init(torrent)
            .then((instance) => {
                ModalActions.metaUpdate({
                    type: 'torrent',
                    data: instance
                });
                return instance;
            })
            .then((instance) => {
                this.actions.add(instance);
                return new Promise((resolve) => {
                    instance.on('ready', function() {
                        resolve(instance);
                    });
                });
            })
            .then((instance) => {
                return TorrentUtil.getContents(instance.torrent.files, instance.infoHash);
            })
            .then((files) => {
               if (localStorage.askFiles == 'true' && files.files_total > 1) {
                    ModalActions.fileSelector(files);
                    ipcRenderer.send('app:bitchForAttention');
                } else {
                    var fileSelectorData = _.omit(files, ['files_total', 'folder_status']);
                    var folder = fileSelectorData[Object.keys(fileSelectorData)[0]];
                    var file = folder[Object.keys(folder)[0]];
                    var newFiles = [];
                    var queueParser = [];

                    files.ordered.forEach( (file, ij) => {
                        newFiles.push({
                            title: parser(file.name).name(),
                            uri: 'http://127.0.0.1:' + EngineStore.state.torrents[file.infoHash]['stream-port'] + '/' + file.id
                        });
                        queueParser.push({
                            idx: ij,
                            url: 'http://127.0.0.1:' + EngineStore.state.torrents[file.infoHash]['stream-port'] + '/' + file.id,
                            filename: file.name
                        });
                    });

                    PlayerActions.addPlaylist(newFiles);
                    
            
                    // start searching for thumbnails after 1 second
                    _.delay(() => {
                        queueParser.forEach( el => {
                            PlayerActions.parseURL(el);
                        });
                    },1000);

                    ModalActions.close();
                }
            })
            .catch(err => {
                //ModalActions.close();
                console.error(err);
            });
    }
}




export
default alt.createActions(torrentActions);