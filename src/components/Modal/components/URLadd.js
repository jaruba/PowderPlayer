import React from 'react';


export
default React.createClass({
    render() {
        return (
            <div className="holdCenter">
 				<div id="formHolder">
                        <form className="pure-form pure-form-aligned" onsubmit="urlFormAction(); return false;" id="magnetForm">
                            <fieldset>
                                <div className="pure-control-group">
                                    <input id="magnetLink" type="text" name="magnet" placeholder="Magnet/Torrent URI or Video URL" />
                                    <button id="magnetSubmit" type="submit" className="pure-button pure-button-primary">Stream</button>
                                </div>
                            </fieldset>
                        </form>
                    </div>
      		</div>
        );
    }
});