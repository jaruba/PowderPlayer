import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';

import MUI from 'material-ui';

const {
    Dialog
} = MUI;

import ModalStore from './store';
import ModalActions from './actions';

import FileStreamSelector from './components/fileStreamSelector';
import URLContents from './components/URLadd';
import Thinking from './components/Thinking';
import PlayerSettings from './components/player-settings';

export
default React.createClass({

    mixins: [PureRenderMixin],

    childContextTypes: {
        muiTheme: React.PropTypes.object,
    },

    getChildContext() {
        return {
            muiTheme: MUI.Styles.ThemeManager.getMuiTheme(MUI.Styles[ModalStore.getState().theme])
        };
    },
    
    getInitialState() {

        var modalState = ModalStore.getState();

        return {
            Thinking: modalState.thinking,
            modalIsOpen: modalState.open,
            type: modalState.type,
            data: modalState.data,
            theme: modalState.theme
        };
    },

    componentDidMount() {
        ModalStore.listen(this.update);
    },

    componentWillUnmount() {
        ModalStore.unlisten(this.update);
    },

    update() {

        var modalState = ModalStore.getState();

        if (this.isMounted()) {
            this.setState({
                modalIsOpen: modalState.open,
                data: modalState.data,
                type: modalState.type,
                Thinking: modalState.thinking
            });
        }
    },

    openModal() {
        this.setState({
            modalIsOpen: true
        });
    },

    closeModal() {
        this.setState({
            modalIsOpen: false
        });
    },

    getStyle() {
        if (this.state.data) {
            switch (this.state.data.type) {
                case 'URLAdd':
                    return {
                        height: '200px'
                    };
            }
        } else
            return {};
    },

    getContents() {
        switch (this.state.type) {
            case 'URLAdd':
                return <URLContents />;
                break;
            case 'fileSelctor':
                return <FileStreamSelector />;
                break;
            case 'thinking':
                return <Thinking />;
                break;
            case 'player-settings':
                return <PlayerSettings />;
                break;
        }
    },

    render() {
        return (
            <Dialog
                style={this.getStyle()}
                  open={this.state.modalIsOpen}
                autoScrollBodyContent={true}
                contentClassName='material-dialog'
                onRequestClose={this.closeModal}>
                {this.getContents()}
            </Dialog>
        );
    }
});