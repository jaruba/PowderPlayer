import alt from '../alt';
import ipc from 'ipc';
import torrentActions from '../actions/torrentActions';
import localFilesActions from '../actions/localfileActions';
import PlayerActions from '../components/Player/actions';

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
        ipc.send('modal:close', {
            init: 'player'
        });
    }

}

export
default alt.createStore(engineStore);