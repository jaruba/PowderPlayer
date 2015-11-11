import alt from '../alt'

class localActions {

    constructor() {
        this.generateActions(
            'stream'
        );
    }

    stream(file) {
        this.dispatch();
    }

    host(file) {
        this.dispatch();

    }
}

export
default alt.createActions(localActions);