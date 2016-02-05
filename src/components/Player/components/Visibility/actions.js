import alt from '../../../../alt'

class VisibilityActions {

    constructor() {
        this.generateActions(
            'settingChange',
            'toggleMenu',
            'uiShown'
        );
    }

}

export
default alt.createActions(VisibilityActions);
