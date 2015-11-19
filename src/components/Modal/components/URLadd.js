import React from 'react';
import {
    History
}
from 'react-router';
import {
    TextField, RaisedButton
}
from 'material-ui';

import utils from '../../../utils/util';
import torrentActions from '../../../actions/torrentActions';
import ModalActions from '../actions';

import MessageActions from '../../Message/actions';
import PlayerActions from '../../Player/actions';


export
default React.createClass({

    mixins: [History],

    handelURLAdd() {
        ModalActions.thinking(true);
        var inputvalue = this.refs.urlInput.getValue();
        if (inputvalue.length > 0) {
            var type = utils.parseURL(inputvalue);
            switch (type) {
                case 'torrent':
                    torrentActions.addTorrent(inputvalue);
                    break;
                default:
                    ModalActions.close();
                    PlayerActions.play({
                        type: 'other',
                        uri: inputvalue
                    });
                    this.history.replaceState(null, 'player');
            }
        } else {
            ModalActions.thinking(false);
            MessageActions.open('Enter a URL to stream.');
        }
    },
    render() {
        return (
            <div>
                <TextField ref="urlInput" style={{'marginBottom': '15px' }} fullWidth={true} floatingLabelText="Magnet/Torrent URI or Video URL" />
                <RaisedButton secondary={true} onClick={this.handelURLAdd} style={{float: 'right', }} label="Stream" />
                <RaisedButton onClick={ModalActions.close} style={{float: 'right', 'marginRight': '10px' }} label="Cancel" />
            </div>
        );
    }
});