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
        this.dispatch();
        require('../utils/stream/torrentUtil')
            .init(torrent)
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
            .then(this.actions.generatePlayerObject)
            .then(ModalActions.close)
            .catch((err) => {
                ModalActions.close();
                console.error(err);
            });
    }

    generatePlayerObject(instance, PlayerObject = {}) {
        var TorrentUtil = require('../utils/stream/torrentUtil');
        return new Promise((resolve, reject) => {
            TorrentUtil.getStreamableFiles(instance.torrent.files)
                .then((files) => {
                    PlayerObject['StreamableFiles'] = files;

                    console.log(PlayerObject)
                })
        });
    }
}


export
default alt.createActions(torrentActions);