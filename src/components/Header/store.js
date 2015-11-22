import alt from '../../alt';
import HeaderActions from './actions';


class HeaderStore {
    constructor() {
        this.bindActions(HeaderActions);

        this.maximized = false;
        this.minimized = false;
    }

    onMaximized(toggle) {
        this.setState({
            maximized: toggle,
        });
    }

    onMinimized(toggle) {
        this.setState({
            minimized: toggle,
        });
    }
}

export
default alt.createStore(HeaderStore);