import React from 'react';
import {
    RaisedButton, Paper
}
from 'material-ui';

import utils from '../../utils/util';



export
default React.createClass({
    getInitialState() {
        return {
            alwaysOnTop: false
        };
    },
    componentWillMount() {

    },

    componentWillUnmount() {

    },
    render() {
        return (
            <div className="wrapper">
               <center>
                    <Paper className="holder" rounded={true} zDepth={1}>
                        
                    </Paper>
               </center>
            </div>
        );
    }
});