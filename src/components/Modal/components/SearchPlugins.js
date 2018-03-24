import React from 'react';
import {
    clipboard
} from 'electron';

import ModalActions from '../actions';
import ModalStore from '../store';

import MessageActions from '../../Message/actions';
import PlayerActions from '../../Player/actions';

import linkUtil from '../../../utils/linkUtil';
import plugins from '../../../utils/plugins';
import _ from 'lodash';
import ls from 'local-storage';


export
default React.createClass({

    getInitialState() {
        return {
        }
    },

    componentDidMount() {
        this.refs['dialog'].open();
        _.delay(() => {
            this.refs.urlInput.$.input.focus()
        });
    },

    handleURLAdd() {
        var inputvalue = this.refs.urlInput.value;
        
        var results = plugins.fetchByName(inputvalue);
        if (results.length) {
            ModalActions.close();
            plugins.events.emit('pluginListUpdate', { terms: inputvalue, results: results });
        } else {
            MessageActions.open(new Error('No Results'));
        }
    },
    pasteClipboard() {
        this.refs['urlInput'].value = clipboard.readText('text/plain');
    },
    componentDidUpdate() {
        this.refs['dialog'].open();
        _.delay(() => {
            this.refs['urlInput'].$.input.focus()
        });
    },
    render() {
        return (
            <paper-dialog
                ref="dialog"
                style={{width: '440px', textAlign: 'left', borderRadius: '3px'}}
                opened={false}
                with-backdrop >

                <paper-input
                    ref="urlInput"
                    style={{marginBottom: '15px', marginTop: '20px'}}
                    fullWidth={true}
                    onKeyDown={event => event.keyCode === 13 ? this.handleURLAdd() : void 0}
                    onContextMenu={this.pasteClipboard}
                    label={'Search Plugin Names'}
                    no-label-float />
                    
                <paper-button
                    raised
                    onClick={this.handleURLAdd}
                    style={{float: 'right', background: '#00bcd4', color: 'white', padding: '8px 15px', fontWeight: 'bold', marginRight: '22px', marginTop: '0px', textTransform: 'none'}}>
                Search
                </paper-button>
                
                <paper-button
                    raised
                    onClick={ModalActions.close}
                    style={{float: 'right', marginRight: '10px', padding: '8px 15px', fontWeight: 'bold', marginTop: '0px', textTransform: 'none'}}
                  dialog-dismiss>
              Cancel
              </paper-button>
                
            </paper-dialog>
        );
    }
});