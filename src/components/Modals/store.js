import alt from '../alt';
import modalActions from './actions';


class modalStore {
    constructor() {
        this.bindActions(modalActions);

        this.magnet = false;
        this.open = false;
        this.filePath = false;
    }

    onStream(data) {

    }

    onOpen() {
        this.setState({
            open: false
        });
    }

    onClose() {
        this.setState({
            open: false
        });
    }
}

export
default alt.createStore(modalStore);