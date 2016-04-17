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
import ls from 'local-storage';
import parser from '../components/Player/utils/parser';
import player from '../components/Player/utils/player';
import metaParser from '../components/Player/utils/metaParser';

class torrentActions {

    constructor() {
        this.generateActions(
            'add',
            'clear'
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
                if (!EngineStore.state.torrents[instance.infoHash]['stream-port']) {
                    return new Promise((resolve) => {
                        instance.on('listening', function() {
                            resolve(instance);
                        });
                    });
                } else {
                    return instance;
                }
            })
            .then((instance) => {
                return TorrentUtil.getContents(instance.files, instance.infoHash);
            })
            .then((files) => {
               if (ls('askFiles') && files.files_total > 1) {
                    ModalActions.fileSelector(files);
                    ipcRenderer.send('app:bitchForAttention');
                } else {
                    var fileSelectorData = _.omit(files, ['files_total', 'folder_status']);
                    var folder = fileSelectorData[Object.keys(fileSelectorData)[0]];
                    var file = folder[Object.keys(folder)[0]];
                    var newFiles = [];
                    var queueParser = [];

                    if (files.ordered.length) {
                        files.ordered.forEach( (file, ij) => {
                            if (file.name.toLowerCase().replace("sample","") == file.name.toLowerCase() && file.name != "ETRG.mp4" && file.name.toLowerCase().substr(0,5) != "rarbg") {
                                newFiles.push({
                                    title: parser(file.name).name(),
                                    uri: 'http://127.0.0.1:' + EngineStore.state.torrents[file.infoHash].server.address().port + '/' + file.id,
                                    byteSize: file.size,
                                    torrentHash: file.infoHash,
                                    streamID: file.id,
                                    path: file.path
                                });
                                queueParser.push({
                                    idx: ij,
                                    url: 'http://127.0.0.1:' + EngineStore.state.torrents[file.infoHash].server.address().port + '/' + file.id,
                                    filename: file.name
                                });
                            }
                        });
                    }

                    if (ls('downloadType') == 0 && !ls('playerType')) {
                        // start with internal player
                        PlayerActions.addPlaylist(newFiles);
                    } else if (ls('downloadType') == 1 || ls('playerType')) {
                        if (ls('playerType') && ls('playerPath')) {
                            // start with external player
                            // player.generatePlaylist(newFiles);
                        }
                        // start torrent dashboard
                        var newData = { noStart: true, files: newFiles };
    
                        PlayerActions.addPlaylist(newData);

                        HistoryStore.getState().history.replaceState(null, 'torrentDashboard');
                    }


                    // start searching for thumbnails after 1 second
                    _.delay(() => {
                        if (queueParser.length) {
                            queueParser.forEach( el => {
                                metaParser.push(el);
                            });
                        }
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