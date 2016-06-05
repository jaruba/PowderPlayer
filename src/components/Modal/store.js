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
        this.selectedPlugin = false;
        this.installededPlugin = false;
        this.searchPlugin = false;
        this.parseLink = false;

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
    
    onPlugin(el) {
        this.setState({
            selectedPlugin: el,
            type: 'plugin'
        });
    }
    
    onInstalledPlugin(el) {
        this.setState({
            installedPlugin: el,
            type: 'installedPlugin'
        });
    }
    
    onSearchPlugin(el) {
        this.setState({
            searchPlugin: el,
            type: 'searchPlugin'
        });
    }

    onTorrentWarning() {
        this.setState({
            type: 'torrentWarning'
        });
    }

    onTorrentSelector(el) {
        this.setState({
            parseLink: el,
            type: 'torrentSelector'
        });
    }

    onFileSelector(files) {
        this.setState({
            fileSelectorFiles: files,
            type: 'fileSelctor'
        });
    }
    
    onSearchPlugins() {
        this.setState({
            type: 'searchPlugins'
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