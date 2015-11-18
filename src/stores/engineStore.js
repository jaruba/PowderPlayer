import alt from '../alt';
import torrentActions from '../actions/torrentActions';
import localFilesActions from '../actions/localfileActions';

class engineStore {
    constructor() {
        this.bindAction(torrentActions.add, this.onNewTorrent);


        this.torrents = {};
        this.localFiles = [];
        this.hosted = [];
    }

    onNewTorrent(instance) {
        this.torrents[instance.infoHash] = instance;
        this.setState({
            torrents: this.torrents
        });
    }

}

export
default alt.createStore(engineStore);