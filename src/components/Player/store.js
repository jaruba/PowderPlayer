import alt from '../../alt';
import playerActions from './actions';


class playerStore {
    constructor() {
        this.bindActions(playerActions);

        this.uri = false;
        this.title = '';
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

    onUiShown(toggle) {
        this.setState({
            uiShown: toggle
        });
    }

    onPlay(data) {
        this.setState({
            title: data.uri,
            uri: data.uri,
            playing: true,
            paused: false,
            buffering: false
        });
    }

    onClose() {
        this.setState({
            playing: false,
            paused: false,
            buffering: false,
            title: '',
            time: 0,
            position: 0,
            fullscreen: false,
            uiShown: true,
            uri: false
        });
    }

}

export
default alt.createStore(playerStore);