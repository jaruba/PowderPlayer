import ipc from 'ipc';
import alt from '../../alt';
import modalActions from './actions';


class modalStore {
    constructor() {
        this.bindActions(modalActions);

        this.open = false;
        this.data = false;
        this.thinking = false;
        this.meta = false;
        this.files = {};

        ipc.on('modal:close', function() {
            this.setState({
                open: false,
                data: false,
                thinking: false
            });
        });
    }

    onOpen(data) {
        this.setState({
            open: true,
            data: data
        });
    }

    onMetaUpdate(meta) {
        this.setState({
            meta: meta
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