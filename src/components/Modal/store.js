import alt from '../../alt';
import modalActions from './actions';


class modalStore {
    constructor() {
        this.bindActions(modalActions);

        this.open = false;
        this.data = false;
        this.thinking = false;
    }

    onOpen(data) {
        this.setState({
            open: true,
            data: data
        });
    }

    onThinking(think) {
        this.setState({
            thinking: think
        });
    }

    onClose() {
        this.setState({
            open: false,
            data: false,
            thinking: false
        });
    }
}

export
default alt.createStore(modalStore);