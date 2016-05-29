import React from 'react';
import Dropzone from 'react-dropzone';

import sorter from './../Player/utils/sort';
import parser from './../Player/utils/parser';

import MainMenuActions from './actions';
import PlayerActions from '../../components/Player/actions';
import ModalActions from './../Modal/actions';
import MessageActions from '../Message/actions';
import TorrentActions from '../../actions/torrentActions';
import metaParser from '../../components/Player/utils/metaParser';
import Plugins from './components/Plugins';
import Settings from './components/Settings';
import remote from 'remote';
import path from 'path';

import {
    webFrame
}
from 'electron';

import linkUtil from '../../utils/linkUtil';

import _ from 'lodash';

export
default React.createClass({
    
    getInitialState() {
        return {
            dropBorderColor: '#ccc',
            lastZoom: 0,
            extensionView: false,
            settingsView: false
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

            var ext = path.extname(files[0].path);

            if (['.torrent', '.magnet'].indexOf(ext) > -1) {

                ModalActions.open({
                    type: 'thinking'
                });

                TorrentActions.addTorrent(files[0].path);
                
            } else {

                var newFiles = [];
                var queueParser = [];
                
                if (parser(files[0].name).shortSzEp())
                    files = sorter.episodes(files, 2);
                else
                    files = sorter.naturalSort(files, 2);
                
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
                        metaParser.push(el);
                    });
                },1000);
            }
        } else {
            var droppedLink = e.dataTransfer.getData("text/plain");
            if (droppedLink) {

                ModalActions.open({
                    title: 'Thinking',
                    type: 'thinking'
                });

                linkUtil(droppedLink).then(url => {
                    ModalActions.thinking(false);
                }).catch(error => {
                    ModalActions.thinking(false);
                    MessageActions.open(error.message);
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
    extensionView() {
        var viewHolder = window.document.querySelector(".wrapper");

        if (viewHolder.className.includes('settingsView'))
            viewHolder.className = viewHolder.className.replace(' settingsView', '');

        if (viewHolder.className.includes('extensionView')) {
            viewHolder.className = viewHolder.className.replace(' extensionView', '');
            this.setState({
                settingsView: false,
                extensionView: false
            });
        } else {
            viewHolder.className += ' extensionView';
            this.setState({
                settingsView: false,
                extensionView: true
            });
        }
    },
    settingsView() {
        var viewHolder = window.document.querySelector(".wrapper");

        if (viewHolder.className.includes('extensionView'))
            viewHolder.className = viewHolder.className.replace(' extensionView', '');

        if (viewHolder.className.includes('settingsView')) {
            viewHolder.className = viewHolder.className.replace(' settingsView', '');
            this.setState({
                extensionView: false,
                settingsView: false
            });
        } else {
            viewHolder.className += ' settingsView';
            this.setState({
                extensionView: false,
                settingsView: true
            });
        }
    },
    render() {
        var extensionView = this.state.extensionView ? (<Plugins />) : '';
        var settingsView = this.state.settingsView ? (<Settings />) : '';
        return (
            <div className="wrapper">
               {extensionView}
               {settingsView}
               <center>
                    <Dropzone ref="dropper" disableClick={true} className="holder" onDragEnter={this.onDragEnter} onDragLeave={this.onDragLeave} onDrop={this.onDrop} style={{}}>
                        <div>
                            <div className="mainButtonHolder">
                                 <div className="inButtonHolder">
                                    <paper-icon-button id="main_plugins_but" icon="extension" alt="plugins" style={{color: '#767A7B', width: '44px', height: '44px', right: '2px', position: 'absolute', marginRight: '48px', marginTop: '2px'}} onClick={this.extensionView} />
                                    <paper-tooltip for="main_plugins_but" offset="0">Plugins</paper-tooltip>
                                    <paper-icon-button id="main_settings_but" icon="settings" alt="settings" style={{color: '#767A7B', width: '48px', height: '48px', right: '2px', position: 'absolute'}} onClick={this.settingsView} />
                                    <paper-tooltip for="main_settings_but" offset="0">Settings</paper-tooltip>
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
                                <paper-button raised style={{float: 'left', width: '130px', height: '108px', background: '#00b850'}} onClick={MainMenuActions.openLocal.bind(this, 'torrent')}>
                                    <img src="images/icons/torrent-icon.png" style={{marginTop: '2px'}}/>
                                    <br/>
                                    <span className="fl_sl lbl" style={{marginTop: '11px', textTransform: 'none'}}>
                                    Add Torrent
                                    </span>
                                </paper-button>
                                <paper-button raised style={{float: 'left', width: '130px', height: '108px', background: '#1ca8ed', margin: '0 1.2em'}} onClick={MainMenuActions.openLocal.bind(this, 'video')}>
                                    <img src="images/icons/video-icon.png" style={{marginTop: '7px'}}/>
                                    <br/>
                                    <span className="fl_sl lbl" style={{marginTop: '15px', textTransform: 'none'}}>
                                    Add Video
                                    </span>
                                </paper-button>
                                <paper-button raised style={{float: 'left', width: '130px', height: '108px', background: '#f1664f'}} onClick={MainMenuActions.openURL}>
                                    <img src="images/icons/link-icon.png" style={{marginTop: '5px'}}/>
                                    <br/>
                                    <span className="fl_sl lbl" style={{marginTop: '11px', textTransform: 'none'}}>
                                    Use a URL
                                    </span>
                                </paper-button>
                            </div>
                        </div>
                    </Dropzone>
               </center>
            </div>
        );
    }
});