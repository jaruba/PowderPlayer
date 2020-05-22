import React from 'react';
import {
    History
}
from 'react-router';
import ModalStore from '../store';
import ls from 'local-storage';

import ModalActions from '../actions';

export
default React.createClass({

    componentDidMount() {
        this.refs.dialog.open();
    },
    componentDidMount() {
        this.refs.dialog.addEventListener('iron-overlay-canceled', ModalActions.close);
    },

    componentWillUnmount() {
        this.refs.dialog.removeEventListener('iron-overlay-canceled', ModalActions.close);
    },
    render() {
        return (
            <paper-dialog
                ref="dialog"
                className="trakt-info-dialog"
                style={{width: '231px', textAlign: 'left', borderRadius: '3px', maxWidth: '90%', backgroundColor: '#303030', color: 'white', padding: '20px', overflowY: 'auto'}}
                opened={true}
                with-backdrop >
                
                <div style={{margin: '0', padding: '0', marginBottom: '5px', fontSize: '16px'}}>
                    <span style={{fontSize: '21px'}}>Powder Player v1.60</span>
                    <br />
                    Codename: Talon
                    <br /><br />
                    <span style={{textDecoration: 'underline'}}>Author</span>
                    <br />
                    Alexandru Branza
                    <br /><br />
                    <span style={{textDecoration: 'underline'}}>Contributors</span>
                    <br />
                    Luigi Poole<br />
                    Jean van Kasteel
                </div>
                
                <div style={{marginTop: '25px', marginBottom: '0', display: 'inline-block', paddingLeft: '0'}}>
                    <paper-button
                        raised
                        onClick={ModalActions.close}
                        style={{float: 'none', marginRight: '15px', marginBottom: '0'}}
                        className='playerButtons-primary' >
                    Close
                    </paper-button>
                </div>
            </paper-dialog>
        );
    }
});