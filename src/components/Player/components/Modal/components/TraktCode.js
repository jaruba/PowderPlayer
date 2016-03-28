import React from 'react';
import {
    clipboard
} from 'electron';
import _ from 'lodash';

import ModalActions from '../actions';
import PlayerStore from '../../../store'

import traktUtil from '../../../utils/trakt';
import player from '../../../utils/player';

export
default React.createClass({

    componentDidMount() {
        this.refs.dialog.open();
        _.delay(() => {
            this.refs.codeInput.$.input.focus();
        });
    },
    handleCodeAdd() {
        var inputvalue = this.refs.codeInput.value;
        if (inputvalue.length) {
            ModalActions.close();
            try {
                traktUtil.exchangePin(inputvalue);
                player.notifier.info('Login Successful', '', 4000);
                _.delay(() => {
                    player.events.emit('settingsUpdate');
                },1000);
            } catch(e) {
                player.notifier.info('Error: '+e.message, '', 7000);
            }
        } else {
            this.refs.codeInput.$.input.focus();
            player.notifier.info('Error: Trakt Code is Required', '', 7000);
        }
    },
    pasteClipboard() {
        this.refs.codeInput.value = clipboard.readText('text/plain');
    },
    getCode(event) {
        traktUtil.openTraktAuth();
    },
    render() {
        return (
            <paper-dialog
                ref="dialog"
                style={{width: '440px', textAlign: 'left', borderRadius: '3px', maxWidth: '90%', backgroundColor: '#303030', padding: '20px'}}
                entry-animation="slide-from-top-animation"
                opened={false}
                with-backdrop >
                
                <paper-input
                    ref={'codeInput'}
                    label="Trakt Code"
                    style={{float: 'right', height: '32px', top: '-5px', marginRight: '4px', textAlign: 'left', width: '100%', marginBottom: '15px', padding: '0', marginTop: '0', marginRight: '0'}}
                    onKeyDown={event => event.keyCode === 13 ? this.handleCodeAdd() : void 0}
                    onContextMenu={this.pasteClipboard}
                    fullWidth={true}
                    no-label-float
                    className="dark-input dark-input-large" />
                <paper-button
                    raised
                    onClick={this.handleCodeAdd}
                    style={{float: 'right', marginRight: '0', marginBottom: '0'}}
                    className='playerButtons-primary' >
                Login
                </paper-button>
                <paper-button
                    raised
                    onClick={this.getCode}
                    style={{float: 'right', marginBottom: '0'}}
                    className='playerButtons' >
                Request Code
                </paper-button>
                <paper-button
                    raised
                    onClick={ModalActions.close}
                    style={{float: 'right', marginBottom: '0'}}
                    className='playerButtons' >
                Cancel
                </paper-button>
            </paper-dialog>
        );
    }
});