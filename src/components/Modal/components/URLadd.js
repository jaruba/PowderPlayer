import React from 'react';
import {
    TextField, RaisedButton
}
from 'material-ui';
import {
    clipboard
}
from 'electron';

import MimeUtil from '../../../utils/mimeDetectorUtil';
import torrentActions from '../../../actions/torrentActions';
import ModalActions from '../actions';

import MessageActions from '../../Message/actions';
import PlayerActions from '../../Player/actions';

export
default React.createClass({

    componentDidMount() {
        this.refs['urlInput'].focus();
    },

    handleURLAdd() {
        ModalActions.thinking(true);
        var inputvalue = this.refs.urlInput.getValue();
        if (inputvalue.length > 0) {
            MimeUtil.parseURL(inputvalue).then((parsed) => {
                console.log(parsed)
                switch (parsed.catagory) {
                    case 'torrent':
                        torrentActions.addTorrent(inputvalue);
                        break;
                    case 'direct':
                        ModalActions.close();
                        PlayerActions.open({
                            uri: parsed.url,
                            title: parsed.title
                        });
                        break;
                    case 'error':
                        ModalActions.open({
                            title: 'Add URL',
                            type: 'URLAdd'
                        });
                        MessageActions.open('There was a error parsing that URL');
                        break;
                }
            })
        } else {
            ModalActions.thinking(false);
            MessageActions.open('Enter a URL to stream.');
        }
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