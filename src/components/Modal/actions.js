import alt from '../../alt'

class modalActions {
    constructor() {
        this.generateActions(
            'data',
            'close',
            'open'
        );
    }
}


export
default alt.createActions(modalActions);