import React from 'react';

import utils from '../utils/util';


let If = React.createClass({
    render() {
        return this.props.test ? this.props.children : false;
    }
});

export
default React.createClass({
    getInitialState() {
        return {

        };
    },
    componentDidMount() {

    },
    componentWillUnmount() {

    },
    update(state) {
        if (this.isMounted()) {
            this.setState(state);
        }
    },
    render() {
        return (
            <div className="wrapper">
               
            </div>
        );
    }
});