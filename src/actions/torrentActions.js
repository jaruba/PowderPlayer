import ModalActions from '../components/Modal/actions';
import PlayerActions from '../components/Player/actions';
import alt from '../alt'

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
                        resolve(instance)
                    });
                });
            })
            .then((instance) => {
                return TorrentUtil.getContents(instance.torrent.files, instance.infoHash);
            })
            .then(ModalActions.fileSelector)
            .catch((err) => {
                //ModalActions.close();
                console.error(err);
            });
    }
}


export
default alt.createActions(torrentActions);