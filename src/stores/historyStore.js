import alt from '../alt';
import historyActions from '../actions/historyActions';


class historyStore {
    constructor() {
        this.bindActions(historyActions);

        this.history = false;
    }

    onHistory(history) {
        this.setState({
            history: history
        });
    }


}

export
default alt.createStore(historyStore);