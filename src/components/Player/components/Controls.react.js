import React from 'react';
import {
    IconButton
}
from 'material-ui';

export
default React.createClass({
    getInitialState() {
        return {

        }
    },
    componentDidMount() {

    },
    componentWillUnmount() {

    },
    update() {

    },

    render() {
        return (
            <div className="control-bar">
                <div className="scrobbler" >    
                    <div className="buffer"/>
                    <div className="time"/>
                    <div className="handle"/>
                </div>
                <p className="time-info"><span className="current">00:30:15</span> / <span>1:20:00</span></p>
            </div>
        );
    }
});