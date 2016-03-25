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
        this.data = false;
        this.index = -1;
        this.shouldExit = false;

    }
    
    onSetIndex(index) {
        this.setState({
            index: index
        });
    }
    
    onShouldExit(shouldI) {
        this.setState({
            shouldExit: shouldI
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

    onThinking() {
        this.setState({
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