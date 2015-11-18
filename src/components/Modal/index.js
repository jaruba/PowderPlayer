import React from 'react';
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

import URLContents from './components/URLadd'

export
default React.createClass({

    mixins: [Lifecycle],

    getInitialState() {
        return {
            modalIsOpen: ModalStore.getState().open,
            data: ModalStore.getState().data
        };
    },

    componentDidMount() {
        ModalStore.listen(this.update);
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
            data: ModalStore.getState().data
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