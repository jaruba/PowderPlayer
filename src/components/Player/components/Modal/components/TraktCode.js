import React from 'react';
import {
    TextField, RaisedButton
}
from 'material-ui';
import clipboard from 'clipboard';
import _ from 'lodash';

import ModalActions from '../actions';
import PlayerStore from '../../../store'

import traktUtil from '../../../utils/trakt';
import player from '../../../utils/player';

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
                player.notifier.info('Login Successful', '', 4000);
                _.delay(() => {
                    player.events.emit('settingsUpdate');
                },1000);
            } catch(e) {
                player.notifier.info('Error: '+e.message, '', 7000);
            }
        } else {
            this.refs['codeInput'].focus();
            player.notifier.info('Error: Trakt Code is Required', '', 7000);
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