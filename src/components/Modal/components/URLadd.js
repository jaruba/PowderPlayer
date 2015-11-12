import React from 'react';

import utils from '../../../utils/util';

export
default React.createClass({

    handelURLAdd() {
        if (this.refs.urlInput.value.length > 0) {
            console.log('value:', this.refs.urlInput.value)
            console.log('detected:', utils.parseURL(this.refs.urlInput.value))
        }
    },

    render() {
        return (
            <div className="holdCenter">
 				<div id="formHolder">
                    <form className="pure-form pure-form-aligned" onSubmit={this.handelURLAdd} >
                        <fieldset>
                            <div className="pure-control-group">
                                <input ref="urlInput" type="text" placeholder="Magnet/Torrent URI or Video URL" />
                                <button type="submit" className="pure-button pure-button-primary">Stream</button>
                            </div>
                        </fieldset>
                    </form>
                </div>
      		</div>
        );
    }
});