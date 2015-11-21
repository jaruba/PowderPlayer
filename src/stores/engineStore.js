import alt from '../alt';
import torrentActions from '../actions/torrentActions';
import localFilesActions from '../actions/localfileActions';

import ModalActions from '../components/Modal/actions';
import PlayerActions from '../components/Player/actions';


class engineStore {
    constructor() {
        this.bindAction(torrentActions.add, this.onNewTorrent);

        this.bindAction(torrentActions.selectFile, this.onSelectTorrent);

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

    onSelectTorrent(file) {
        ModalActions.close();
        PlayerActions.open({
            title: file.name,
            url: 'http://127.0.0.1:' + this.torrents[file.infoHash]['stream-port'] + '/' + file.id
        });
    }

}

export
default alt.createStore(engineStore);