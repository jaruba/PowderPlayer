import alt from '../../alt';
import playerActions from './actions';


class playerStore {
    constructor() {
        this.bindActions(playerActions);

        this.uri = '';
        this.data = false;
    }

    onPlay(data) {
        this.setState({
            data: data.data,
            uri: data.uri
        });
    }
}

export
default alt.createStore(playerStore);