import alt from '../alt';
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
        this.initPlay(instance.infoHash);
    }

    initPlay(infohash) {
        console.log(this.torrents[infohash])
        var uri = '127.0.0.1:' + this.torrents[infohash].port;
        var meta = {
            title: 'Not yet'
        };
        
        PlayerActions.play({
            uri: uri,
            data: meta
        });
    }

}

export
default alt.createStore(engineStore);