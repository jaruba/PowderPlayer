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
                this.actions.add(instance);
                return new Promise((resolve) => {
                    instance.on('ready', function() {
                        PlayerActions.play({
                            type: 'torrent',
                            infohash: instance.infoHash
                        });
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

    generatePlayerObject(instance) {
        this.dispatch();
        require('../utils/stream/torrentUtil')
            .getFileIndex(instance.infoHash, instance.torrent.files)
    }
}


export
default alt.createActions(torrentActions);