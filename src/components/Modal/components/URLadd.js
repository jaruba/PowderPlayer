import React from 'react';
import {
    TextField, RaisedButton
}
from 'material-ui';
import {
    clipboard
}
from 'electron';

import ModalActions from '../actions';

import MessageActions from '../../Message/actions';
import PlayerActions from '../../Player/actions';

import linkUtil from '../../../utils/linkUtil';


export
default React.createClass({

    componentDidMount() {
        this.refs['urlInput'].focus();
    },

    handleURLAdd() {
        ModalActions.thinking(true);
        var inputvalue = this.refs.urlInput.getValue();
        linkUtil(inputvalue, error => {
            ModalActions.thinking(false);
            ModalActions.open({
                title: 'Add URL',
                type: 'URLAdd'
            });
            MessageActions.open(error);
        });
    },
    pasteClipboard() {
        this.refs['urlInput'].setValue(clipboard.readText('text/plain'));
    },
    render() {
        return (
            <div>
                <TextField ref="urlInput" style={{'marginBottom': '15px' }} fullWidth={true} onEnterKeyDown={this.handleURLAdd} onContextMenu={this.pasteClipboard} hintText="Magnet/Torrent URI or Video URL" />
                <RaisedButton secondary={true} onClick={this.handleURLAdd} style={{float: 'right', }} label="Stream" />
                <RaisedButton onClick={ModalActions.close} style={{float: 'right', 'marginRight': '10px' }} label="Cancel" />
            </div>
        );
    }
});