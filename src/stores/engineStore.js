import alt from '../alt';
import torrentActions from '../actions/torrentActions';
import localFilesActions from '../actions/localfileActions';

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
        console.log(file)

        console.log(this.torrents[file.infoHash])

        this.torrents[file.infoHash].files.createReadStream();

        var player_object = {
            title: file.name
            url: '127.0.0.1:' + this.torrents[file.infoHash]['stream-port'] + '/' + file.id
        };
        console.log(player_object);


    }

}

export
default alt.createStore(engineStore);