import alt from '../../alt';
import modalActions from './actions';


class modalStore {
    constructor() {
        this.bindActions(modalActions);

        this.open = false;
        this.data = false;

    }

    onOpen(data) {
        this.setState({
            open: true,
            data: data
        });
    }

    onClose() {
        this.setState({
            open: false,
            data: false
        });
    }
}

export
default alt.createStore(modalStore);