import alt from '../../alt';
import playerActions from './actions';


class playerStore {
    constructor() {
        this.bindActions(playerActions);

        this.uri = false;
        this.data = false;
        this.wcjs = false;

        this.playing = false;
        this.paused = false;
        this.position = 0;
        this.buffering = false;
        this.time = 0;
        this.fullscreen = false;
        this.uiShown = true;
    }

    onWcjsInit(wcjs) {
        this.setState({
            wcjs: wcjs
        });
    }

    onPlay(data) {
        this.setState(data);
    }
}

export
default alt.createStore(playerStore);