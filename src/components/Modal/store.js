import ipc from 'ipc';
import alt from '../../alt';
import modalActions from './actions';


class modalStore {
    constructor() {
        this.bindActions(modalActions);

        this.open = false;
        this.type = false;
        this.thinking = false;
        this.meta = false;
        this.fileSelectorFiles = {};

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
            data: data,
            type: data.type
        });
    }

    onMetaUpdate(meta) {
        this.setState({
            meta: meta
        });
    }

    onThinking(think) {
        this.setState({
            thinking: think,
            type: 'thinking'
        });
    }

    onFileSelector(files) {
        this.setState({
            fileSelectorFiles: files,
            type: 'fileSelctor'
        });
    }

    onClose() {
        this.setState({
            open: false,
            data: false,
            thinking: false,
            type: false
        });
    }
}

export
default alt.createStore(modalStore);