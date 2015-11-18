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



export
default React.createClass({

    mixins: [History],

    handelURLAdd() {
        console.log(this.refs.urlInput.getValue())

        if (this.refs.urlInput.getValue() > 0) {
            var type = utils.parseURL(this.refs.urlInput.getValue());
            console.log('Detected:', type);

            switch (type) {
                case 'torrent':
                    torrentActions.addTorrent(this.refs.urlInput.getValue());
                    break;
                case 'http link':
                    break;
                default:
                    console.log('sorry we dont understand:', this.refs.urlInput.getValue());
            }

            this.history.replaceState(null, 'player');
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