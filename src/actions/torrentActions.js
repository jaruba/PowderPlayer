import alt from '../alt'

class torrentActions {

    constructor() {
        this.generateActions(
            'add',
            'remove',
            'change'
        );
    }

    addTorrent() {
        this.dispatch();
    }

    removeTorrent() {
        this.dispatch();
    }

    changeTorrent() {
        this.dispatch();
    }
}


export
default alt.createActions(torrentActions);