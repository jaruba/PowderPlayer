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
    }

    removeTorrent(infohash) {
        this.dispatch();
    }

    changeTorrent(change) {
        this.dispatch();
    }
}


export
default alt.createActions(torrentActions);