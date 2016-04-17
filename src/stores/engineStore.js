import alt from '../alt';
import torrentActions from '../actions/torrentActions';
import localFilesActions from '../actions/localfileActions';


class engineStore {
    constructor() {
        this.bindAction(torrentActions.add, this.onNewTorrent);
        this.bindAction(torrentActions.clear, this.onClearTorrents);

        this.torrents = {};
        this.localFiles = [];
        this.hosted = [];

    }

    onNewTorrent(instance) {
        this.torrents[instance.infoHash] = instance;
        this.setState({
            torrents: this.torrents,
            infoHash: instance.infoHash
        });
    }

    onClearTorrents() {
        this.setState({
            torrents: {},
            infoHash: null
        });
    }
}

export
default alt.createStore(engineStore);