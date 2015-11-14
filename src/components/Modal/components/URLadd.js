import React from 'react';
import {
    History
}
from 'react-router';

import utils from '../../../utils/util';
import torrentActions from '../../../actions/torrentActions';




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
            <div className="holdCenter">
 				<div id="formHolder">
                    <form onSubmit={this.handelURLAdd} >
                        <input ref="urlInput" type="text" placeholder="Magnet/Torrent URI or Video URL" />
                        <button type="submit" >Stream</button>
                    </form>
                </div>
      		</div>
        );
    }
});