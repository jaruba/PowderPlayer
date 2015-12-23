import React from 'react';
import {
    TextField, RaisedButton
}
from 'material-ui';
import clipboard from 'clipboard';

import ModalActions from '../actions';

import MessageActions from '../../Message/actions';
import PlayerActions from '../../Player/actions';

import linkUtil from '../../../utils/linkUtil';
import traktUtil from '../../Player/utils/trakt';

export
default React.createClass({

    componentDidMount() {
        this.refs['codeInput'].focus();
    },

    handleCodeAdd() {
        var inputvalue = this.refs.codeInput.getValue();
        if (inputvalue.length) {
            ModalActions.close();
            try {
                traktUtil.exchangePin(inputvalue);
                MessageActions.open('Login Successful');
            } catch(e) {
                MessageActions.open('Error: '+e.message);
            }
        } else {
            this.refs['codeInput'].focus();
            MessageActions.open('Error: Trakt Code is Required');
        }
    },
    pasteClipboard() {
        this.refs['codeInput'].setValue(clipboard.readText('text/plain'));
    },
    getCode(event) {
        traktUtil.openTraktAuth();
    },
    render() {
        return (
            <div>
                <TextField ref="codeInput" style={{'marginBottom': '15px' }} fullWidth={true} onEnterKeyDown={this.handleCodeAdd} onContextMenu={this.pasteClipboard} hintText="Trakt Code" />
                <RaisedButton secondary={true} onClick={this.handleCodeAdd} style={{float: 'right', }} label="Login" />
                <RaisedButton onClick={this.getCode} style={{float: 'right', 'marginRight': '10px' }} label="Request Code" />
                <RaisedButton onClick={ModalActions.close} style={{float: 'right', 'marginRight': '10px' }} label="Cancel" />
            </div>
        );
    }
});