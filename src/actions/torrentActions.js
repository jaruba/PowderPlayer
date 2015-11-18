import ModalActions from '../components/Modal/actions';
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
            .then(ModalActions.close)
            .then(this.actions.add)
            .catch((err) => {
                ModalActions.close();
                console.error(err);
            });
    }

}


export
default alt.createActions(torrentActions);