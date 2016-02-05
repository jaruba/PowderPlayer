import alt from '../../alt';
import playerActions from './actions';

class playerStore {
    constructor() {
        this.bindActions(playerActions);
    }
}

export
default alt.createStore(playerStore);