import React from 'react';
import {
    clipboard, shell
} from 'electron';

import {
    app
} from 'remote';

import ModalActions from '../actions';
import ModalStore from '../store';

import PlayerStore from '../../../store';

import player from '../../../utils/player';

import QRCode from 'rc-qrcode';
import ip from 'my-local-ip';

import _ from 'lodash';

var playlistServer = false;
var lastUrl = false;
var urlPattern = '';

export
default React.createClass({

    getInitialState() {
        var itemDesc = player.itemDesc();
        return {
            url: ''
        }
    },
    
    componentDidMount() {
        this.refs.dialog.open();
		console.log('mounted')
		
    },
    
    componentDidUpdate() {
        this.refs.dialog.open();
		console.log('updated')
    },
    
    update() {
    },
    	copyLink() {
		clipboard.writeText(this.state.url);
		player.notifier.info('Done', '', 4000);
	},
	
	startBrowser() {
		shell.openExternal(this.state.url);
		player.notifier.info('Starting Browser', '', 4000);
	},
	
	extPlayer() {
		var ModalState = ModalStore.getState().data;
		ModalState.type = 'CastingPlayer';
		ModalState.prevType = 'StreamLAN';
		ModalState.prevExtIp = this.state.extIp;
		ModalState.urlForPlayer = this.state.url;
		ModalActions.close();
		_.defer(() => {
			ModalActions.open(ModalState);
		});
	},

	closeModal() {
		playlistServer.close(() => {
			console.log('server now closed')
			playlistServer = false
		});
		ModalActions.close();
	},


    componentWillMount() {

		if (player.wcjs.playing)
			player.wcjs.togglePause()

		if (playlistServer) {
			_.defer(() => {
				var extIp = false;
				var ModalState = ModalStore.getState().data;
				if (ModalState.prevExtIp) extIp = ModalState.prevExtIp;
				this.setState({
					url: lastUrl,
					extIp: extIp
				});
			})
			return
		}

		var http = require("http"),
			url = require("url"),
			path = require("path"),
			fs = require("fs"),
			port = 11475;
		
		
		var os = require('os');
		var newM3U = "#EXTM3U";
		var fs = require('fs');
		
		player.files.forEach((el) => {
			newM3U += os.EOL+"#EXTINF:0,"+el.title+os.EOL+el.uri.replace('127.0.0.1', ip()).replace('localhost', ip());
		})
		
		var playlistPath = path.join(app.getPath('userData'), 'vlc_playlist.m3u');
		
		fs.exists(playlistPath, (exists) => {
			if (exists) fs.unlink(playlistPath, () => {
				fs.writeFile(playlistPath, newM3U, () => {
					startServer(playlistPath)
				});
			});
			else fs.writeFile(playlistPath, newM3U, () => {
				startServer()
			});
		});
		
		var startServer = (playlistPath) => {
			playlistServer = http.createServer((request, response) => {
			  
				fs.readFile(playlistPath, "binary", (err, file) => {
					if(err) {        
						response.writeHead(500, {"Content-Type": "text/plain"});
						response.write(err + "\n");
						response.end();
						return;
					}
					
					response.writeHead(200, {"Content-Type": "audio/x-mpegurl"});
					response.write(file, "binary");
					response.end();
				});
			})
			playlistServer.listen(parseInt(port, 10));
		
			urlPattern = 'http://%ip%:' + port + '/playlist.m3u'
			lastUrl = 'http://'+ ip() +':' + port + '/playlist.m3u'
			this.setState({
				url: 'http://'+ ip() +':' + port + '/playlist.m3u',
				extIp: false
			});
			console.log("Static file server running at\n  => http://" + ip() + ":" + port)
		}

    },
	
	externalIp() {
		require('request')('http://icanhazip.com/', (error, response, body) => {
		  if (!error && response.statusCode == 200) {
			  try {
				this.setState({
					url: urlPattern.replace('%ip%', body),
					extIp: true
				})
			  } catch(e) { }
		  }
		})
	},
	
	lanIp() {
		this.setState({
			url: urlPattern.replace('%ip%', ip()),
			extIp: false
		})
	},

    render() {
		var modalState = ModalStore.getState().data;
	    return (
			<div style={{ position: 'absolute', top: '0', bottom: '0', left: '0', right: '0' }}>
				<paper-dialog
					ref="dialog"
					style={{width: '400px', textAlign: 'left', borderRadius: '3px', maxWidth: '90%', backgroundColor: '#303030', padding: '20px', overflowX: 'auto'}}
					opened={false}
					className="trakt-info-dialog"
					modal={true} >
	
					<center style={{ color: 'white' }}>
						{this.state.url}
						<br />
						<br />
						<QRCode renderer="canvas" content={this.state.url} scale="4" margin="10" background="white" foreground="black" />
					</center>
	
					<div style={{clear:'both', height: '20px', margin: '0'}} />
	
					<center style={{margin: '0', padding: '0'}}>
						<div style={{display: 'inline-block'}}>
							<paper-button
								raised
								onClick={this.copyLink}
								style={{ marginBottom: '0', marginRight: '15px !important' }}
								className='playerButtons-primary' >
							Copy Link
							</paper-button>
		
							<paper-button
								raised
								onClick={this.startBrowser}
								style={{ marginBottom: '0', marginRight: '0' }}
								className='playerButtons-primary' >
							Browser
							</paper-button>
	
							<paper-button
								raised
								onClick={this.extPlayer}
								style={{ marginBottom: '0', marginTop: '0 !important', marginLeft: '15px !important', marginRight: '0' }}
								className='playerButtons-primary' >
							Player
							</paper-button>
	
						</div>
					</center>
	
					<div style={{clear:'both', height: '20px', margin: '0'}} />
	
					<center style={{margin: '0', padding: '0'}}>
						<div style={{display: 'inline-block'}}>
							<paper-button
								raised
								onClick={this.externalIp}
								style={{ marginBottom: '0', marginTop: '0 !important', marginRight: '15px !important', display: !this.state.extIp ? 'inline-block' : 'none' }}
								className='playerButtons trakt-not-correct' >
							External IP
							</paper-button>
	
							<paper-button
								raised
								onClick={this.lanIp}
								style={{ marginBottom: '0', marginTop: '0 !important', marginRight: '15px !important', display: this.state.extIp ? 'inline-block' : 'none' }}
								className='playerButtons trakt-not-correct' >
							LAN IP
							</paper-button>
	
							<paper-button
								raised
								onClick={this.closeModal}
								style={{ marginBottom: '0', marginRight: '0' }}
								className='playerButtons trakt-not-correct' >
							Stop
							</paper-button>
						</div>
					</center>
	
				</paper-dialog>
				</div>
        );
    }
});