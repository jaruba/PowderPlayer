import React from 'react';
import ModalActions from '../actions';

export
default React.createClass({

    getInitialState() {
        return {

        }
    },
    
    componentDidMount() {
        this.refs.dialog.open();
    },
    
    componentDidUpdate() {
        this.refs.dialog.open();
    },
    
    update() {

    },
    
    componentWillMount() {
        this.update();
    },

    render() {
        return (
            <paper-dialog
                ref="dialog"
                style={{width: '900px', textAlign: 'left', borderRadius: '3px', maxWidth: '90%', backgroundColor: '#303030', padding: '20px', overflowX: 'auto'}}
                opened={false}
                className="trakt-info-dialog"
                with-backdrop >

                <div className={'trakt-info-desc' + (!this.state.image ? ' trakt-long-desc' : '')} style={{ fontSize: '15px', color: 'white', float: 'left', display: 'inline-block', padding: '0', margin: '0', marginLeft: '3%', maxWidth: '45%' }}>
                  <h3 style={{ fontWeight: 'normal', marginBottom: '12px' }}>Disabled in Development Version</h3>
                  <div style={{ marginBottom: '7px' }}>Because this feature gives a high competitive advantage, I've decided to close source it.</div>
                </div>

                <div style={{clear:'both', height: '10px'}} />
                
                <paper-button
                    raised
                    onClick={ModalActions.close}
                    style={{ marginBottom: '0', marginRight: '0', float: 'right' }}
                    className='playerButtons-primary' >
                Back
                </paper-button>
                
            </paper-dialog>
        );
    }
});