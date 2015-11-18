import React from 'react';
import {
    RaisedButton
}
from 'material-ui';


import utils from '../utils/util';
import ModalActions from './Modal/actions';

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
    update() {
        if (this.isMounted()) {
            this.setState({

            });
        }
    },

    addSource(source) {
        switch (source) {
            case 'url':
                ModalActions.open({
                    title: 'Add URL',
                    type: 'URLAdd'
                });
                break;
            default:
        }
    },

    render() {
        return (
            <div className="wrapper">
               <center>
                    <div className="holder">
                        <i className="ion-android-settings player-settings"/>
                        <i className="ion-android-time history-icon"/>
                        <img src="images/powder-logo.png" className="logoBig"/>
                        <br/>
                        <b className="fl_dd droid-bold">Drag &amp; Drop a File</b>
                        <br/>
                        <span className="fl_sl">or select an option below</span>
                        <br/>
                        <br/>
                        <div className="mainButHold">
                            <RaisedButton style={{float: 'left', width: '130px'}} label="Add Torrent" />
                            <RaisedButton style={{width: '130px'}} label="Add Video" />
                            <RaisedButton style={{float: 'right', width: '130px'}} onClick={this.addSource.bind(this, 'url')} label="Use a URL" />
                        </div>
                    </div>
               </center>
            </div>
        );
    }
});