import ModalActions from '../components/Modal/actions';
import PlayerActions from '../components/Player/actions';
import EngineStore from '../stores/engineStore';
import HistoryStore from '../stores/historyStore';
import _ from 'lodash';
import alt from '../alt';

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
                if (files.files_total === 1) {
                    var fileSelectorData = _.omit(files, ['files_total', 'folder_status']);
                    var folder = fileSelectorData[Object.keys(fileSelectorData)[0]];
                    var file = folder[Object.keys(folder)[0]];
                    PlayerActions.open({
                        title: file.name,
                        uri: 'http://127.0.0.1:' + EngineStore.state.torrents[file.infoHash]['stream-port'] + '/' + file.id
                    });
                    ModalActions.close();
                    HistoryStore.getState().history.replaceState(null, 'player');
                } else
                    ModalActions.fileSelector(files);
            })
            .catch(err => {
                //ModalActions.close();
                console.error(err);
            });
    }
}




export
default alt.createActions(torrentActions);