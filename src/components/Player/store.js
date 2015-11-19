import alt from '../../alt';
import playerActions from './actions';


class playerStore {
    constructor() {
        this.bindActions(playerActions);

        this.uri = false;

        this.data = false;

        this.type = false;
        this.infoHash = false;
    }

    onPlay(data) {
        this.setState(data);
    }
}

export
default alt.createStore(playerStore);