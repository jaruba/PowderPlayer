import React from 'react';
import Dropzone from 'react-dropzone';
import {
    RaisedButton, Paper, IconButton
}
from 'material-ui';
import MainMenuActions from './actions';
import torrentActions from '../../actions/torrentActions';


export
default React.createClass({
    getInitialState() {
        return {
            dropBorderColor: '#ccc'
        }
    },
    onDrop(files,e) {
		if (files && files.length) {
	        console.log('Received files:', files);
		} else {
			var droppedLink = e.dataTransfer.getData("text/plain");
			if (droppedLink) {
				console.log('Received link:', droppedLink);
				torrentActions.addTorrent(droppedLink);
			}
		}
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
                    </Dropzone>
               </center>
            </div>
        );
    }
});