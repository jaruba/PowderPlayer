import React from 'react';
import {
    History
}
from 'react-router';

import utils from '../../../utils/util';
import torrentActions from '../../../actions/torrentActions';


import TextField from 'material-ui/lib/text-field';
import RaisedButton from 'material-ui/lib/raised-button';


export
default React.createClass({

    mixins: [History],

    handelURLAdd() {
        if (this.refs.urlInput.value.length > 0) {
            var type = utils.parseURL(this.refs.urlInput.value);
            console.log('Detected:', type);

            switch (type) {
                case 'torrent':
                    torrentActions.addTorrent(this.refs.urlInput.value);
                    break;
                case 'http link':
                    break;
                default:
                    console.log('sorry we dont understand:', this.refs.urlInput.value);
            }

            this.history.replaceState(null, 'player');
        }
    },

    render() {
        return (
            <form onSubmit={this.handelURLAdd} >
                <TextField fullWidth="true" floatingLabelText="Magnet/Torrent URI or Video URL" />
                <RaisedButton style={{float: 'right', }} label="Stream" />
                <RaisedButton style={{float: 'right', }} label="Cancel" />
            </form>
        );
    }
});