import alt from '../alt'

class modalActions {

    constructor() {
        this.generateActions(
            'stream',
            'close'
        );
    }

    stream() {
        this.dispatch();
    }

}


export
default alt.createActions(modalActions);