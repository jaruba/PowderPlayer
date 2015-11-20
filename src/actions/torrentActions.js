import ModalActions from '../components/Modal/actions';
import PlayerActions from '../components/Player/actions';
import alt from '../alt'

class torrentActions {

    constructor() {
        this.generateActions(
            'add',
            'remove',
            'change'
        );
    }

    addTorrent(torrent) {
        var TorrentUtil = require('../utils/stream/torrentUtil');
        this.dispatch();
        var Torrentinstance = false;
        TorrentUtil.init(torrent)
            .then((instance) => {
                ModalActions.metaUpdate({
                    type: 'torrent',
                    data: instance
                });
                Torrentinstance = instance;
                return instance;
            })
            .then((instance) => {
                this.actions.add(instance);
                return new Promise((resolve) => {
                    instance.on('ready', function() {
                        resolve(instance.torrent.files)
                    });
                });
            })
            .then(TorrentUtil.getContents)
            .then(ModalActions.fileSelector)
            .catch((err) => {
                //ModalActions.close();
                console.error(err);
            });
    }
}


export
default alt.createActions(torrentActions);