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
                return PlayerActions.play({
                    type: 'torrent',
                    infohash: instance.infoHash
                });
            })
            .then(ModalActions.close)
            .catch((err) => {
                ModalActions.close();
                console.error(err);
            });
    }
}


export
default alt.createActions(torrentActions);