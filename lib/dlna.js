var dlna = {};
dlna.clients = [];
dlna.checks = 0;
dlna.started = false;
var castData = {};

function resetDlnaGlobals() {
	if (dlna.controls) {
		dlna.controls.removeListener('status', onDlnaStatus);
		dlna.controls.removeListener('playing', onDlnaPlaying);
		dlna.controls.removeListener('paused', onDlnaPaused);
	}
	if (dlna.interval) {
		clearInterval(dlna.interval);
		delete dlna.interval;
	}
	dlna = {};
	dlna.clients = [];
	dlna.checks = 0;
	dlna.started = false;
	if (castData.casting) resetDlnaData();
}

function setDlnaOpts() {
	dlna.started = true;
	castData.casting = 1;
	wjs().emitJsMessage("[cast-data]"+JSON.stringify(castData));
	if (dlna.lastSecond > 0) {
		if (dlna.lastSecond > 30) {
			dlna.controls.seek(dlna.lastSecond);
			wjs().setOpeningText("Streaming to TV ...");
		}
		dlna.lastSecond = 0;
	}
}

function sendDlnaData(dlnaTime,dlnaLength) {
	castData.castTime = dlnaTime * 1000;
	castData.castLength = dlnaLength * 1000;
	castData.castPos = (dlnaTime / dlnaLength);
	wjs().emitJsMessage("[cast-data]"+JSON.stringify(castData));
}

function resetDlnaData() {
	castData.casting = 0;
	castData.castTime = 0;
	castData.castLength = 0;
	castData.castPos = 0;
	castData.castPaused = 2;
	wjs().emitJsMessage("[cast-data]"+JSON.stringify(castData));
}

function stopDlna() {
	if (castData.casting) resetDlnaData();
	wjs().setOpeningText("Stopped Streaming");
	dlna.controls.stop();
	letSleep();
}

// init
function startDlnaServer(httpServer) {
	wjs().setOpeningText("Starting DLNA Server ...");

	var MediaRendererClient = require('upnp-mediarenderer-client');
	
	dlna.controls = new MediaRendererClient(dlna.clients[0]);
	dlna.clients = [];
	dlna.checks = 0;
	dlna.paused = false;

	var options = { autoplay: true };
	
	dlna.controls.load(httpServer, options, onDlnaLoad);
	
	dlna.controls.on('status', onDlnaStatus);
	dlna.controls.on('playing', onDlnaPlaying);
	dlna.controls.on('paused', onDlnaPaused);
	
	dlna.interval = setInterval(function(){
		if (dlna.duration) {
			dlna.controls.getPosition(function(err, position) {
				if (position > 0) sendDlnaData(position,dlna.duration);
			});
		} else {
			dlna.controls.getDuration(function(err, duration) {
				dlna.duration = duration;
				if (dlna.duration > 0) {
					dlna.controls.getPosition(function(err, position) {
						if (position > 0) sendDlnaData(position,dlna.duration);
					});
				}
			});
		}
	},1000);
}

function prepareDlnaServer() {
	
	if (powGlobals.engine) dlna.mimeType = require('mime-types').lookup(powGlobals.engine.files[powGlobals.videos[dlna.lastIndex].index].path);
	else dlna.mimeType = require('mime-types').lookup(powGlobals.videos[dlna.lastIndex].path);

	require('dns').lookup(require('os').hostname(), function (err, add, fam) {
		if (add) {
			if (powGlobals.engine) {
				startDlnaServer(wjs().plugin.playlist.items[dlna.lastIndex].mrl.replace('localhost',add));
			} else {
				if (wjs().plugin.playlist.items[dlna.lastIndex].mrl.indexOf("file:///") == 0) {
					var http = require('http'),
						fs = require('fs'),
						util = require('util');
					 
					dlna.server = http.createServer(function (req, res) {
					  var path = powGlobals.videos[dlna.lastIndex].path;
					  var stat = fs.statSync(path);
					  var total = stat.size;
					  
					  if (req.headers['range']) {
						var range = req.headers.range;
						var parts = range.replace(/bytes=/, "").split("-");
						var partialstart = parts[0];
						var partialend = parts[1];
						var start = parseInt(partialstart, 10);
						var end = partialend ? parseInt(partialend, 10) : total-1;
						var chunksize = (end-start)+1;
					  
						var file = fs.createReadStream(path, {start: start, end: end});
						
						res.writeHead(206, { 'Content-Range': 'bytes ' + start + '-' + end + '/' + total, 'Accept-Ranges': 'bytes', 'Content-Length': chunksize, 'Content-Type': dlna.mimeType,'transferMode.dlna.org': 'Streaming','contentFeatures.dlna.org': 'DLNA.ORG_OP=01;DLNA.ORG_CI=0;DLNA.ORG_FLAGS=017000 00000000000000000000000000' });
						file.pipe(res);
					  } else {
						res.writeHead(200, { 'Content-Length': total, 'Content-Type': dlna.mimeType,'transferMode.dlna.org': 'Streaming','contentFeatures.dlna.org': 'DLNA.ORG_OP=01;DLNA.ORG_CI=0;DLNA.ORG_FLAGS=017000 00000000000000000000000000' });
						fs.createReadStream(path).pipe(res);
					  }
					}).listen();
					
					dlna.server.on('listening',function() {
						startDlnaServer('http://'+add+':'+dlna.server.address().port+'/',dlna.mimeType);
					});
				}
			}
		}
	});
}

function findDlnaClient() {
	if (wjs().state() == "playing" || wjs().state() == "paused") dlna.lastSecond = Math.floor(wjs().time()/1000);
	else dlna.lastSecond = 0;
	dlna.lastIndex = parseInt(wjs().currentItem());

	wjs().setOpeningText("Searching for Device ...");
	wjs().stopPlayer();

    var Client = require('node-ssdp').Client
      , client = new Client();

    client.on('response', function (headers, statusCode, rinfo) {
//		console.log(headers);
		if (headers["LOCATION"]) {
			dlna.clients.push(headers["LOCATION"]);
		}
		if (dlna.clients.length == 1) prepareDlnaServer(); // remove this line for select device menu
	});
	
// uncomment this line for select device menu
//	setTimeout(function() { checkClients(); },1000);

    client.search('urn:schemas-upnp-org:device:MediaRenderer:1');
}

function checkClients() {
	if (dlna.clients.length == 1) prepareDlnaServer();
	else {
		if (dlna.clients.length > 1) wjs().emitJsMessage("[select-dlna]"+dlna.clients.join(","));
		// [select-dlna] needs to be implemented in WebChimera Player for select device menu
		if (dlna.checks < 4) {
			dlna.checks++;
			setTimeout(function() { checkClients(); },1000);
		} else dlna.checks = 0;
	}
}
// end init

// listeners
function onDlnaLoad(err, result) {
	if(err) throw err;
	casrData = {};
	keepAwake();
	if (dlna.lastSecond > 30) wjs().setOpeningText("Updating playback position ...");
	else wjs().setOpeningText("Streaming to TV ...");
	setTimeout(function() { wjs().emitJsMessage("[refresh-playlist]"); },10);
}
function onDlnaStatus(status) {
//	console.log(status);
	if (status["CurrentTransportActions"] && status["CurrentTransportActions"].indexOf("DLNA_Seek") > -1) {
		setDlnaOpts();
	}
	if (powGlobals.engine && dlna.mimeType == "video/x-msvideo" && (!status["TransportState"] || status["TransportState"] == "PLAYING") && status["CurrentMediaDuration"]) {
		// failsafe for a avi streaming issue
		setDlnaOpts();
	}
	if (dlna.started && status["TransportState"] == "STOPPED") {
		if (castData.casting) {
//			if (dlna.lastIndex +1 < wjs().itemCount()) {
//				wjs().setOpeningText("Playback Ended");
				// implement change video in playlist
//			} else {
				if (wjs().itemCount() > 1) wjs().togglePlaylist(); // remove this line when adding playlist support
				wjs().setOpeningText("Playback Ended");
				if (dlna.server) {
					dlna.server.close(function() {
						dlna.controls.server.close(function() {
							resetDlnaGlobals();
						});
					});
				} else {
					dlna.controls.server.close(function() { resetDlnaGlobals(); });
				}
//			}
		}
	}
	if (status["TransportState"] == "ERROR_OCCURRED") {
		wjs().setOpeningText("Error Occurred");
	}
}
function onDlnaPlaying() {
	castData.castPaused = 0;
	wjs().emitJsMessage("[cast-data]"+JSON.stringify(castData));
	wjs().setOpeningText("Streaming to TV ...");
}
function onDlnaPaused() {
	castData.castPaused = 1;
	wjs().emitJsMessage("[cast-data]"+JSON.stringify(castData));
	wjs().setOpeningText("Playback Paused ...");
}
// end listeners