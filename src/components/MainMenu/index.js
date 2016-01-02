import React from 'react';
import Dropzone from 'react-dropzone';
import {
    RaisedButton, Paper, IconButton
}
from 'material-ui';

import sorter from './../Player/utils/sort';
import parser from './../Player/utils/parser';

import MainMenuActions from './actions';
import PlayerActions from '../../components/Player/actions';
import ModalActions from './../Modal/actions';
import MessageActions from '../Message/actions';
import remote from 'remote';

import webFrame from 'web-frame';

import linkUtil from '../../utils/linkUtil';

import _ from 'lodash';

export
default React.createClass({
    getInitialState() {
        return {
            dropBorderColor: '#ccc',
            lastZoom: 0
        }
    },
    componentWillMount() {
        window.addEventListener('resize', this.handleResize);
        var currentWindow = remote.getCurrentWindow();
        currentWindow.setMinimumSize(410, 324);
        var currentSize = currentWindow.getSize();
        if (currentSize[0] < 410) currentSize[0] = 410;
        if (currentSize[1] < 324) currentSize[1] = 324;
        currentWindow.setSize(currentSize[0], currentSize[1]);
        this.handleResize();
    },

    componentDidMount() {

    },

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleResize);
    },

    handleResize() {

        var width = remote.getCurrentWindow().getSize()[0];
        var newZoom = 0;

        if (width < 407)
            newZoom = -2.3;
        else if (width >= 407 && width < 632)
            newZoom = (2.3 - ((width - 407) / 97.8)) * (-1);
        else if (width >= 632 && width < 755)
            newZoom = (width - 632) / 123;
        else
            newZoom = 1;

        if (newZoom != this.state.lastZoom) {
            this.setState({
                lastZoom: newZoom
            });
            webFrame.setZoomLevel(newZoom);
        }

    },

    onDrop(files,e) {
        if (files && files.length) {

            var newFiles = [];
            var queueParser = [];
            
            if (parser(files[0].name).shortSzEp()) {
                files = sorter.episodes(files, 2);
            } else {
                files = sorter.naturalSort(files, 2);
            }
            
            files.forEach( (file, ij) => {
                newFiles.push({
                    title: parser(file.name).name(),
                    uri: 'file:///'+file.path,
                    path: file.path
                });
                queueParser.push({
                    idx: ij,
                    url: 'file:///'+file.path,
                    filename: file.name
                });
            });
            
            PlayerActions.addPlaylist(newFiles);
            
            // start searching for thumbnails after 1 second
            _.delay(() => {
                queueParser.forEach( el => {
                    PlayerActions.parseURL(el);
                });
            },1000);
        } else {
            var droppedLink = e.dataTransfer.getData("text/plain");
            if (droppedLink) {

                ModalActions.open({
                    title: 'Thinking',
                    type: 'thinking'
                });

                linkUtil(droppedLink, error => {
                    ModalActions.thinking(false);
                    MessageActions.open(error);
                });

            }
        }
        document.querySelector('.wrapper .holder').classList.remove('holder-hover');
    },
    onDragEnter() {
        document.querySelector('.wrapper .holder').classList.add('holder-hover');
    },
    onDragLeave() {
        document.querySelector('.wrapper .holder').classList.remove('holder-hover');
    },
    render() {
        return (
            <div className="wrapper">
               <center>
                    <Dropzone ref="dropper" disableClick={true} className="holder" onDragEnter={this.onDragEnter} onDragLeave={this.onDragLeave} onDrop={this.onDrop} style={{}}>
                        <div>
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
                                <RaisedButton style={{float: 'left', width: '130px', height: '108px'}} onClick={MainMenuActions.openLocal.bind(this, 'torrent')} label="Add Torrent">
                                    <img src="images/icons/torrent-icon.png" style={{marginTop: '13px'}}/>
                                    <br/>
                                    <span className="fl_sl lbl" style={{marginTop: '11px'}}>
                                    Add Torrent
                                    </span>
                                </RaisedButton>
                                <RaisedButton style={{width: '130px', height: '108px'}} onClick={MainMenuActions.openLocal.bind(this, 'video')} label="Add Video">
                                    <img src="images/icons/video-icon.png" style={{marginTop: '18px'}}/>
                                    <br/>
                                    <span className="fl_sl lbl" style={{marginTop: '15px'}}>
                                    Add Video
                                    </span>
                                </RaisedButton>
                                <RaisedButton style={{float: 'right', width: '130px', height: '108px'}} onClick={MainMenuActions.openURL} label="Use a URL">
                                    <img src="images/icons/link-icon.png" style={{marginTop: '17px'}}/>
                                    <br/>
                                    <span className="fl_sl lbl" style={{marginTop: '10px'}}>
                                    Use a URL
                                    </span>
                                </RaisedButton>
                            </div>
                        </div>
                    </Dropzone>
               </center>
            </div>
        );
    }
});