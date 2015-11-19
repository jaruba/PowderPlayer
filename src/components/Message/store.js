import alt from '../../alt';
import MessageActions from './actions';


class mmessageStore {
    constructor() {
        this.bindActions(MessageActions);

        this.open = false;
        this.message = '';

    }

    onOpen(message) {
        this.setState({
            open: true,
            message: message
        });
    }

    onClose() {
        this.setState({
            open: false,
            message: ''
        });
    }
}

export
default alt.createStore(mmessageStore);