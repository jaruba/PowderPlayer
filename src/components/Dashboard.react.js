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
               <center>
                    <div className="holder">
                        <i className="player-settings"/>
                        <i className="history-icon"/>
                        <img src="images/powder-logo.png" className="logoBig"/>
                        <br/>
                        <b className="fl_dd droid-bold">Drag &amp; Drop a File</b>
                        <br/>
                        <span className="fl_sl">or select an option below</span>
                    </div>
               </center>
            </div>
        );
    }
});