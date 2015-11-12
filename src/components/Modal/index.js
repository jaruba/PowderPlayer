import React from 'react';
import Modal from 'react-modal';

import ModalStore from './store';
import ModalActions from './actions';

import URLContents from './components/URLadd'

export
default React.createClass({
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

    getContents() {
        if (this.state.data) {
            switch (this.state.data.type) {
                case 'URLAdd':
                    return <URLContents/>;
            }
        } else
            return false;
    },

    render() {
        const customStyles = {
            content: {
                top: '50%',
                left: '50%',
                right: 'auto',
                bottom: 'auto',
                marginRight: '-50%',
                transform: 'translate(-50%, -50%)'
            }
        };

        return (
            <div>
 				<Modal
          			isOpen={this.state.modalIsOpen}
          			onRequestClose={this.closeModal}
          			style={customStyles} >
                    {this.getContents()}
        		</Modal>
      		</div>
        );
    }
});