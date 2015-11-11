import React from 'react';
import Modal from 'react-modal';

import ModalStore from './store';
import ModalActions from './actions';

export
default React.createClass({
    getInitialState() {
        return {
            modalIsOpen: false
        };
    },

    componentDidMount() {
        this.listenTo(LoginModalStore, this.update);
    },

    update(data) {
        this.setState(data);
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
        		</Modal>
      		</div>
        );
    }
});