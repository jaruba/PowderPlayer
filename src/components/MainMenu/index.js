import {
    app
} from 'remote';
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
import fs from 'fs';
import player from '../Player/utils/player';
import supported from '../../utils/isSupported';
import ls from 'local-storage';

import async from 'async';

import {
    ipcRenderer
}
from 'electron';

import {
    webFrame
}
from 'electron';

import linkUtil from '../../utils/linkUtil';

import _ from 'lodash';

import request from 'request';

var historyQueue = null;
var loadedTorrents = [];
var mainMsg = '';

export
default React.createClass({
    
    getInitialState() {
        return {
            dropBorderColor: '#ccc',
            lastZoom: 0,
            extensionView: false,
            settingsView: false,
            mainText: ''
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
        player.events.on('dropObj', this.historyLoad);
        if (mainMsg) {
            _.defer(() => {
                this.setState({
                    mainText: mainMsg
                })
            })
        } else {
            request('http://powder.media/maintext.txt', (error, response, body) => {
                if (!error && body && body.startsWith('[main-text]')) {
                    mainMsg = body.replace('[main-text]', '')
                    this.setState({
                        mainText: mainMsg
                    })
                }
            })
        }
    },
    
    printMainText() {
        return {__html: this.state.mainText}
    },

    componentDidMount() {
        ipcRenderer.send('app:title', 'Powder Player');
        window.historyLoad = this.historyLoad
        window.mainmenuDrop = this.onDrop
    },

    componentWillUnmount() {
        player.events.removeListener('dropObj', this.historyLoad);
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
    
    historyLoad(objs) {
        loadedTorrents = [];
        ls('savedHistory', objs)
        historyQueue = async.queue((task, cb) => {

            var isTorrent = !!task.torrentHash

            if (task.originalURL) {
                if (player && player.wcjs && player.wcjs.playlist && player.wcjs.playlist.itemCount) {
                    window.playerDrop({ preventDefault: function() {}, dataTransfer: { files: [], getData: function() { return task.originalURL } } })
                    setTimeout(cb, 300)
                } else {
                    this.onDrop(null, { dataTransfer: { getData: function() { return task.originalURL } } }, null, cb);
                }
            } else if (!isTorrent && task.mrl.startsWith('file:///')) {
                this.onDrop([{ path: task.mrl.replace('file:///', ''), name: require('path').basename(task.mrl.replace('file:///', '')) }], {}, null, cb);
            } else if (isTorrent) {

                this.onDrop([], null, {
                    title: task.title,
                    uri: task.mrl,
                    announce: task.announce || null,
                    byteSize: task.byteSize || null,
                    torrentHash: task.torrentHash || null,
                    streamID: task.streamID || null,
                    path: task.torFilePath || null
                }, cb, task.idx)

            } else {
                this.onDrop([], { dataTransfer: { getData: function() { return task.mrl; } } }, null, cb);
            }
        }, 100);
        objs.forEach(obj => {
            obj.all = objs;
            historyQueue.push(obj);
        });
        _.defer(window.processHistory)
    },

    onDrop(files, e, fakeTorrent, cb, idx) {

        if (cb) {
            var fallbackCB = _.once(cb);
            _.delay(fallbackCB, 2000);
        } else {
            var fallbackCB = null;
        }
        
        if (fakeTorrent) {
            PlayerActions.addPlaylist([fakeTorrent]);

            metaParser.push({
                idx: idx,
                url: fakeTorrent.uri,
                filename: fakeTorrent.path.replace(/^.*[\\\/]/, '')
            });

            fallbackCB()
            
            return
        }

        if (files && files.length) {

            var ext = path.extname(files[0].path);

            if (['.torrent', '.magnet'].indexOf(ext) > -1) {

                ModalActions.open({
                    type: 'thinking'
                });

                TorrentActions.addTorrent(files[0].path);
                fallbackCB && fallbackCB()
                
            } else {

                var newFiles = [];
                var queueParser = [];
                
                var anyShortSz = files.some(function(el) {
                    if (parser(el.name).shortSzEp())
                        return true
                })

                if (anyShortSz)
                    files = sorter.episodes(files, 2);
                else
                    files = sorter.naturalSort(files, 2);

                var itemCount = player && player.wcjs ? player.wcjs.playlist.itemCount : 0;
                
                var idx = itemCount;
        
                var addFile = (filePath) => {
                    if (supported.is(filePath, 'allMedia')) {
                        newFiles.push({
                            title: parser(filePath).name(),
                            uri: 'file:///'+filePath,
                            path: filePath
                        });
                        queueParser.push({
                            idx: idx,
                            url: 'file:///'+filePath,
                            filename: filePath.replace(/^.*[\\\/]/, '')
                        });
                        idx++;
                    }
        
                    return false;
                };
        
                var addDir = (filePath) => {
                    var newFiles = fs.readdirSync(filePath);

                    var anyShortSz = newFiles.some(function(el) {
                        if (parser(el).shortSzEp())
                            return true
                    })

                    if (anyShortSz)
                        newFiles = sorter.episodes(newFiles, 1);
                    else
                        newFiles = sorter.naturalSort(newFiles, 1);
        
                    newFiles.forEach(( file, index ) => {
                        var dummy = decide( path.join( filePath, file ) );
                    });
        
                    return false;
                };
                
                var decide = (filePath) => {
                    if (fs.lstatSync(filePath).isDirectory())
                        var dummy = addDir(filePath);
                    else
                        var dummy = addFile(filePath);
        
                    return false;
                };

                files.forEach( (file, ij) => {
                    var dummy = decide(file.path);
                });
    
                PlayerActions.addPlaylist(newFiles);
                
                // start searching for thumbnails after 1 second
                _.delay(() => {
                    queueParser.forEach( el => {
                        metaParser.push(el);
                    });
                },1000);
                fallbackCB && fallbackCB()
            }
        } else {

            var droppedLink = e.dataTransfer.getData("text/plain");
            if (droppedLink) {

                ModalActions.open({
                    title: 'Thinking',
                    type: 'thinking'
                });

                linkUtil(droppedLink).then(url => {
                    ModalActions.close();
                    fallbackCB && fallbackCB()
                }).catch(error => {
                    ModalActions.close();
                    MessageActions.open(error.message);
                    fallbackCB && fallbackCB()
                });

            } else {
                fallbackCB && fallbackCB()
            }
        }
        var holder = document.querySelector('.wrapper .holder');
        holder && document.querySelector('.wrapper .holder').classList.remove('holder-hover');
    },
    onDragEnter() {
        var holder = document.querySelector('.wrapper .holder');
        holder && holder.classList.add('holder-hover');
    },
    onDragLeave() {
        var holder = document.querySelector('.wrapper .holder');
        holder && document.querySelector('.wrapper .holder').classList.remove('holder-hover');
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
    onTop() {
        var newValue = !player.alwaysOnTop;
        player.alwaysOnTop = newValue;
        ipcRenderer.send('app:alwaysOnTop', newValue);
        this.setState({});
    },
    showHistory() {
        ModalActions.open({
            type: 'historySelector'
        });
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
                                 
                                    <paper-icon-button id="main_on_top_but" icon="editor:publish" alt="on top" style={{color: player.alwaysOnTop ? '#00adeb' : '#767A7B', width: '47px', height: '47px', right: '2px', position: 'absolute', marginRight: '139px', marginTop: '1px', padding: '5px'}} onClick={this.onTop} />
                                    <paper-tooltip for="main_on_top_but" offset="0">Always On Top</paper-tooltip>
                                    
                                    <paper-icon-button id="main_history_but" icon="history" alt="history" style={{color: '#767A7B', width: '43px', height: '43px', right: '2px', position: 'absolute', marginRight: '94px', marginTop: '4px', padding: '5px'}} onClick={this.showHistory} />
                                    <paper-tooltip for="main_history_but" offset="0">History</paper-tooltip>

                                    <paper-icon-button id="main_plugins_but" icon="extension" alt="plugins" style={{color: '#767A7B', width: '44px', height: '44px', right: '3px', position: 'absolute', marginRight: '48px', marginTop: '2px'}} onClick={this.extensionView} />
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
                            <br />
                            <div style={{ marginTop: '107px', padding: '0 30px', fontFamily: 'Droid Sans', fontSize: '16px', fontWeight: '500', color: '#767a7b', lineHeight: '23px' }} dangerouslySetInnerHTML={this.printMainText()} />
                        </div>
                    </Dropzone>
               </center>
            </div>
        );
    }
});