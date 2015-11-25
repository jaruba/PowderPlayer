import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import {
    Dialog
}
from 'material-ui';

import ModalStore from './store';
import ModalActions from './actions';

import FileStreamSelector from './components/fileStreamSelector';
import URLContents from './components/URLadd';
import Thinking from './components/Thinking';
import PlayerSettings from './components/player-settings';

export
default React.createClass({

    mixins: [PureRenderMixin],

    getInitialState() {
        return {
            Thinking: ModalStore.getState().thinking,
            modalIsOpen: ModalStore.getState().open,
            type: ModalStore.getState().type,
            data: ModalStore.getState().data
        };
    },

    componentDidMount() {
        ModalStore.listen(this.update);
    },

    componentWillUnmount() {
        ModalStore.unlisten(this.update);
    },

    update() {
        if (this.isMounted()) {
            this.setState({
                modalIsOpen: ModalStore.getState().open,
                data: ModalStore.getState().data,
                type: ModalStore.getState().type,
                Thinking: ModalStore.getState().thinking
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