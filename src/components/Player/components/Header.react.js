import React from 'react';
import {
    FontIcon
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
        var shownClass = this.props.show ? 'header show' : 'header';
        return (
            <div className={shownClass}>
               <FontIcon color="white" className="material-icons player-close">arrow_back</FontIcon>
            </div>
        );
    }
});