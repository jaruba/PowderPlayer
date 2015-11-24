import React from 'react';
import remote from 'remote';
import Dropzone from 'react-dropzone';
import {
    RaisedButton, Paper, IconButton
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
                remote.require('dialog')
                    .showOpenDialog({
                        title: 'Select file',
                        properties: ['openFile', 'createDirectory'],
                        filters: filters ? filters : [{
                            name: 'Torrents',
                            extensions: ['TORRENT', 'MAGNET']
                        }]
                    }, (filename) => {
                        console.log(filename)
                    });
        }
    },
    onDrop(file) {
        console.log('Received file:', file);
    },
    render() {
        return (
            <div className="wrapper">
               <center>
                    <Paper className="holder" rounded={true} zDepth={1}>
                        <div className="mainButtonHolder">
                             <div className="inButtonHolder">
                                <IconButton iconClassName="material-icons" iconStyle={{color: '#767A7B', fontSize: '30px', top: '-2px', right: '2px'}} className="settings" >settings</IconButton>
                                <IconButton iconClassName="material-icons" iconStyle={{color: '#767A7B', fontSize: '30px', top: '-2px', right: '2px'}} className="torrent-dash" >view_compact</IconButton>
                            </div>
                        </div>

                        <img src="images/powder-logo.png" className="logoBig"/>
                        <br/>
                        <b className="fl_dd droid-bold">Drag &amp; Drop a File</b>
                        <br/>
                        <span className="fl_sl">or select an option below</span>
                        <br/>
                        <br/>
                        <div className="mainButHold">
                            <RaisedButton style={{float: 'left', width: '130px', height: '108px'}} onClick={this.addSource.bind(this, 'local-torrent')} label="Add Torrent">
                                <img src="images/icons/torrent-icon.png" style={{marginTop: '13px'}}/>
                                <br/>
                                <span className="fl_sl lbl" style={{marginTop: '11px'}}>
                                Add Torrent
                                </span>
                            </RaisedButton>
                            <RaisedButton style={{width: '130px', height: '108px'}} onClick={this.addSource.bind(this, 'local-video')} label="Add Video">
                                <img src="images/icons/video-icon.png" style={{marginTop: '18px'}}/>
                                <br/>
                                <span className="fl_sl lbl" style={{marginTop: '15px'}}>
                                Add Video
                                </span>
                            </RaisedButton>
                            <RaisedButton style={{float: 'right', width: '130px', height: '108px'}} onClick={this.addSource.bind(this, 'url')} label="Use a URL">
                                <img src="images/icons/link-icon.png" style={{marginTop: '17px'}}/>
                                <br/>
                                <span className="fl_sl lbl" style={{marginTop: '10px'}}>
                                Use a URL
                                </span>
                            </RaisedButton>
                        </div>
                    </Paper>
               </center>
            </div>
        );
    }
});