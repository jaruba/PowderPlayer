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
        require('../utils/stream/torrentUtil').init(torrent);
    }

}


export
default alt.createActions(torrentActions);