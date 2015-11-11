import alt from '../alt';
import torrentActions from '../torrentActions';
import localFilesActions from '../localfileActions';


class engineStore {
    constructor() {
        this.bindActions(torrentActions);
        this.bindActions(localFilesActions);

        this.torrents = [];
        this.localFiles = [];
        this.hosted = [];
    }

    onNewTorrent(torrent) {
        this.setState({
            torrents: torrent.concat(this.torrents)
        });
    }

}

export
default alt.createStore(engineStore);