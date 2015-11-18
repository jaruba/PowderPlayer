import React from 'react';

import RaisedButton from 'material-ui/lib/raised-button';


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
                            <RaisedButton label="Add Torrent" />
		                    <div onClick={this.addSource.bind(this, 'localFile')} className="mainButtons videoBut">
                    			<img className="vidIcon" src="images/icons/video-icon.png"/>
                    			<br/>
                    			<p>Add Video</p>
                    		</div>
                    		<div onClick={this.addSource.bind(this, 'url')} className="mainButtons goRight noMarginRight linkBut">
			                    <img className="urlIcon" src="images/icons/link-icon.png"/>
			                    <br/>
			                    <p>Use a URL</p>
		                    </div>
                        </div>
                    </div>
               </center>
            </div>
        );
    }
});