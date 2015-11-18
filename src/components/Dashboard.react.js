import React from 'react';
import remote from 'remote';
import {
    RaisedButton
}
from 'material-ui';


import utils from '../utils/util';
import ModalActions from './Modal/actions';

export
default React.createClass({
    addSource(source) {
        switch (source) {
            case 'url':
                ModalActions.open({
                    title: 'Add URL',
                    type: 'URLAdd'
                });
                break;
            case 'local-video':
                var filters = [{
                    name: 'Video Files',
                    extensions: ['MP4', 'MKV', 'MOV', 'AVI', 'WMV', 'WMA', 'ASF', '3GP', 'OGM', 'OGG', 'WAV', 'Real']
                }];
            case 'local-torrent':
                var filters = filters ? filters : [{
                    name: 'Torrents',
                    extensions: ['TORRENT', 'MAGNET']
                }];
                remote.require('dialog')
                    .showOpenDialog({
                        title: 'Select file',
                        properties: ['openFile', 'createDirectory'],
                        filters: filters
                    }, (filename) => {
                        console.log(filename)
                    });
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
                            <RaisedButton style={{float: 'left', width: '130px'}} onClick={this.addSource.bind(this, 'local-torrent')} label="Add Torrent" />
                            <RaisedButton style={{width: '130px'}} onClick={this.addSource.bind(this, 'local-video')} label="Add Video" />
                            <RaisedButton style={{float: 'right', width: '130px'}} onClick={this.addSource.bind(this, 'url')} label="Use a URL" />
                        </div>
                    </div>
               </center>
            </div>
        );
    }
});