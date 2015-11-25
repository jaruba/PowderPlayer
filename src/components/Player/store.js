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
        this.length = 0;
        this.seekable = false;

        this.files = [];
        this.playlist = {};

        this.fullscreen = false;
        this.uiShown = true;
        this.playlistOpen = false;

        this.currentTime = '00:00';
        this.totalTime = '00:00';

        this.scrobbling = false;

    }

    handleTime(millis) {
        if (millis < 0) millis = 0;
        if (millis > this.length && this.length > 0) millis = this.length;
        var seconds = Math.floor((millis / 1000) % 60);
        var minutes = Math.floor((millis / (1000 * 60)) % 60);
        var hours = Math.floor((millis / (1000 * 60 * 60)) % 24);
        if (hours < 10 && hours > 0) hours = '0' + hours;
        if (minutes < 10) minutes = '0' + minutes;
        if (seconds < 10) seconds = '0' + seconds;
        if (!hours && this.length && this.length > 3600000) hours = '00';
        if (hours) {
            return hours + ':' + minutes + ':' + seconds;
        }
        return minutes + ':' + seconds;
    }

    onWcjsInit(wcjs) {
        this.setState({
            wcjs: wcjs
        });
    }

    onOpenPlaylist(state = true) {
        this.setState({
            playlistOpen: state
        });
    }

    onUiShown(toggle) {
        this.setState({
            uiShown: toggle
        });
    }

    onFullscreen(state) {
        this.setState({
            fullscreen: state
        });
    }

    onPosition(pos) {
        this.setState({
            position: pos
        });
    }

    onSeekable(state) {
        this.setState({
            seekable: state
        });
    }

    onLength(length) {
        this.setState({
            length: length,
            totalTime: this.handleTime(length)
        });
    }

    onTime(time) {
        this.setState({
            time: time,
            currentTime: this.handleTime(time)
        });
    }

    onOpen(data) {
        this.setState({
            title: data.title,
            uri: data.uri
        });
        playerActions.togglePowerSave(true);
    }

    onBuffering(perc) {
        if (perc === 100) {
            this.setState({
                buffering: false
            });
        } else {
            this.setState({
                buffering: perc
            })
        }
    }

    onScrobble(time) {

        time = parseInt(time);

        if (time < 0) time = 0;
        else if (this.length && time > this.length) time = this.length - 2000;

        if (!this.playing) {
            this.setState({
                position: time / this.length,
                currentTime: this.handleTime(time)
            });
        }

        this.wcjs.time = time;

    }

    onScrobbleState(toState) {
        this.setState({
            scrobbling: toState
        });
    }

    onStopped() {
        this.setState({
            buffering: false,
            playing: false,
            paused: false
        });
    }

    onPlaying() {
        this.setState({
            buffering: false,
            playing: true,
            paused: false
        });
    }

    onPlay() {
        this.setState({
            buffering: false,
            playing: true,
            paused: false
        })
        this.wcjs.play();
    }

    onPause() {
        this.setState({
            buffering: false,
            playing: false,
            paused: true
        })
        this.wcjs.pause();
    }

    onClose() {
        this.setState({
            playing: false,
            paused: false,
            buffering: false,
            time: 0,
            length: 0,
            position: 0,

            title: '',
            fullscreen: false,
            uiShown: true,
            uri: false,
            currentTime: '00:00',
            totalTime: '00:00'

        });
        if (this.wcjs) {
            this.wcjs.stop();
            this.wcjs.playlist.clear();
        }
        playerActions.togglePowerSave(false);
    }

}

export
default alt.createStore(playerStore);