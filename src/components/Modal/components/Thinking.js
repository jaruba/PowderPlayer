import React from 'react';
import ModalActions from '../actions';


import {
    LinearProgress, RaisedButton
}
from 'material-ui';



export
default React.createClass({

    handelCancel() {
        ModalActions.close();
    },

    render() {
        return (
            <div style={{ 'paddingTop': '10px' }} >
                <LinearProgress mode="indeterminate"  />
                <RaisedButton onClick={this.handelCancel} style={{float: 'right', 'marginTop': '15px' }} label="Cancel" />
            </div>
        );
    }
});