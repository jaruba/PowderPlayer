import React from 'react';
import ipc from 'ipc';
import {
    Lifecycle
}
from 'react-router';
import {
    Dialog
}
from 'material-ui';

import ModalStore from './store';
import ModalActions from './actions';

import URLContents from './components/URLadd';
import Thinking from './components/Thinking';

export
default React.createClass({

    mixins: [Lifecycle],

    getInitialState() {
        return {
            Thinking: ModalStore.getState().thinking,
            modalIsOpen: ModalStore.getState().open,
            data: ModalStore.getState().data
        };
    },

    componentDidMount() {
        ModalStore.listen(this.update);
        ipc.on('modal:close', function(event, params) {
            console.log(params);
        });
    },

    componentWillUnmount() {
        ModalStore.unlisten(this.update);
    },

    routerWillLeave(nextLocation) {
        if (!this.state.confirmLeave)
            return console.log('Are you sure.');
    },

    update() {
        this.setState({
            modalIsOpen: ModalStore.getState().open,
            data: ModalStore.getState().data,
            Thinking: ModalStore.getState().thinking
        });
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
        if (this.state.Thinking) //loading thing
            return <Thinking />;

        if (this.state.data) {
            switch (this.state.data.type) {
                case 'URLAdd':
                    return <URLContents />;
            }
        } else
            return false;
    },

    render() {
        return (
            <Dialog
                style={this.getStyle()}
          		open={this.state.modalIsOpen}
                contentClassName='.material-dialog-content'
                onRequestClose={this.closeModal}>
                {this.getContents()}
        	</Dialog>
        );
    }
});