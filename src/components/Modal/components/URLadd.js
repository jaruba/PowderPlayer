import React from 'react';
import {
    clipboard
} from 'electron';

import ModalActions from '../actions';

import MessageActions from '../../Message/actions';
import PlayerActions from '../../Player/actions';

import linkUtil from '../../../utils/linkUtil';
import _ from 'lodash';


export
default React.createClass({

    componentDidMount() {
        this.refs['dialog'].open();
        _.delay(() => {
            this.refs.urlInput.$.input.focus()
        });
    },

    handleURLAdd() {
        ModalActions.thinking(true);
        var inputvalue = this.refs.urlInput.value;
        this.refs.urlInput.value = '';
        linkUtil(inputvalue).then(url => {
            ModalActions.thinking(false);
        }).catch(error => {
            ModalActions.thinking(false);
            ModalActions.open({
                title: 'Add URL',
                type: 'URLAdd'
            });
            MessageActions.open(error.message);
        });
    },
    pasteClipboard() {
        this.refs['urlInput'].value = clipboard.readText('text/plain');
    },
    clearValue() {
        var that = this;
        _.delay(() => {
            that.refs.urlInput.value = '';
        },500);
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
                entry-animation="slide-from-top-animation"
                opened={false}
                with-backdrop >

                <paper-input
                    ref="urlInput"
                    style={{marginBottom: '15px', marginTop: '20px'}}
                    fullWidth={true}
                    onKeyDown={event => event.keyCode === 13 ? this.handleURLAdd() : void 0}
                    onContextMenu={this.pasteClipboard}
                    label="Magnet/Torrent URI or Video URL"
                    no-label-float />
                    
                <paper-button
                    raised
                    onClick={this.handleURLAdd}
                    style={{float: 'right', background: '#00bcd4', color: 'white', padding: '8px 15px', fontWeight: 'bold', marginRight: '22px', marginTop: '0px', textTransform: 'none'}}>
                Stream
                </paper-button>
                
                <paper-button
                    raised
                    onClick={this.clearValue}
                    style={{float: 'right', marginRight: '10px', padding: '8px 15px', fontWeight: 'bold', marginTop: '0px', textTransform: 'none'}}
                    dialog-dismiss>
                Cancel
                </paper-button>
                
            </paper-dialog>
        );
    }
});