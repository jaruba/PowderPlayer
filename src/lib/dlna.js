var dlna = {},
	castData = {},
	oldDlnaData = {},
	oldHttpServer = false,
	pUrl = require('url'),
	samsungDlna = {},
	nextStartDlna = 0;

dlna.clients = [];
dlna.checks = 0;
dlna.started = false;
dlna.initiated = false;
samsungDlna.retries = 0;

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
	castData.castingPaused = 0;
	
	player.wrapper.find(".wcp-play").removeClass("wcp-play").addClass("wcp-pause");
	player.wrapper.find(".wcp-replay").removeClass("wcp-replay").addClass("wcp-pause");

	if (dlna.lastSecond > 0) {
		if (dlna.lastSecond > 30) {
			dlna.controls.seek(dlna.lastSecond);
			wjs().setOpeningText("Streaming to TV ...");
			samsungDlna.retries = 0;
		}
		dlna.lastSecond = 0;
	}
}

function sendDlnaData(dlnaTime,dlnaLength) {
	castData.castTime = dlnaTime * 1000;
	castData.castLength = dlnaLength * 1000;
	castData.castPos = (dlnaTime / dlnaLength);
	if (castData.castTime > 0 && castData.castLength > 0) {
		wjs().wrapper.find(".wcp-time-current").text(wjs().parseTime(castData.castTime,castData.castLength));
		wjs().wrapper.find(".wcp-time-total").text(" / "+wjs().parseTime(castData.castLength));
	}
	dlna.lastPos = castData.castPos;
	if (castData.castPos > 0) {
		wjs().wrapper.find(".wcp-progress-seen")[0].style.width = (castData.castPos*100)+"%";
	}
	if (castData.castTime > 0 && castData.casting == 0) {
		castData.casting = 1;
		castData.castingPaused = 0;

		player.wrapper.find(".wcp-play").removeClass("wcp-play").addClass("wcp-pause");
		player.wrapper.find(".wcp-replay").removeClass("wcp-replay").addClass("wcp-pause");
	}
}

function resetDlnaData(keepCasting,cb) {
	if (typeof keepCasting === 'function') {
		cb = keepCasting;
		keepCasting = false;
	} else keepCasting = typeof keepCasting !== 'undefined' ? keepCasting : false;
	
	if (keepCasting) {
		castData.casting = 1;
		castData.castingPaused = 0;

		player.wrapper.find(".wcp-play").removeClass("wcp-play").addClass("wcp-pause");
		player.wrapper.find(".wcp-replay").removeClass("wcp-replay").addClass("wcp-pause");
	}
	else castData.casting = 0;
	castData.castTime = 0;
	castData.castLength = 0;
	castData.castPos = 0;
	castData.castingPaused = 2;
	if (typeof cb === "function") cb();
}

function stopDlna(noSubs) {
	if (dlna.controls) dlna.controls.removeAllListeners();
	if (castData.casting) resetDlnaData();

	wjs().wrapper.find(".wcp-time-current").text("");
	wjs().wrapper.find(".wcp-time-total").text("");
	wjs().wrapper.find(".wcp-progress-seen")[0].style.width = "0%";
	wjs().wrapper.find(".wcp-vol-control")[0].style.borderRight = "1px solid #262626";

	wjs().setOpeningText("Stopped Streaming");
	if (dlna.controls) dlna.controls.stop();
	letSleep();
	dlna.initiated = false;
	player.wrapper.find(".wcp-vol-button").show(0);
	player.wrapper.find(".wcp-pause").removeClass("wcp-pause").addClass("wcp-play");
	if (typeof noSubs === 'undefined') {
		newSettings = wjs().plugin.playlist.items[dlna.lastIndex].setting;
		if (IsJsonString(newSettings)) {
			newSettings = JSON.parse(newSettings);
		} else newSettings = {};
		if (newSettings.subtitles) player.wrapper.find(".wcp-subtitle-but").show(0);
	}
}

// init
function startDlnaServer(httpServer,dlnaReconnect) {
	dlnaReconnect = typeof dlnaReconnect !== 'undefined' ? dlnaReconnect : false;

	var MediaRendererClient = require('upnp-mediarenderer-client');
	
	if (!dlnaReconnect) {
		wjs().setOpeningText("Starting DLNA Server ...");
		dlna.controls = new MediaRendererClient(dlna.clients[0]);
		dlna.controls.on('status', onDlnaStatus);
		dlna.controls.on('playing', onDlnaPlaying);
		dlna.controls.on('paused', onDlnaPaused);
	}
	dlna.casting = 0;
	dlna.checks = 0;
	dlna.paused = false;

	var options = {
		autoplay: true,
		metadata: {
			title: wjs().plugin.playlist.items[dlna.lastIndex].title.replace("[custom]","")
		}
	};
	
//	console.log(" - "+httpServer);
	if (!dlnaReconnect) { dlna.controls.load(httpServer, options, onDlnaLoad); }
	else dlna.controls.load(httpServer, options, function() {});
	
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

function prepareDlnaServer(dlnaReconnect) {
	dlna.lastPos = 0;
	dlnaReconnect = typeof dlnaReconnect !== 'undefined' ? dlnaReconnect : false;
	if (wjs().plugin.playlist.items[dlna.lastIndex].mrl.indexOf("pow://") == 0) {
		waitForNext = true;
		nextStartDlna = 1;
		nextTorrent = wjs().plugin.playlist.items[dlna.lastIndex].mrl.replace("pow://","");
		win.title = wjs().plugin.playlist.items[dlna.lastIndex].title.replace("[custom]","");
		winTitleLeft(wjs().plugin.playlist.items[dlna.lastIndex].title.replace("[custom]",""));
		if (nextTorrent.indexOf("/") > -1 && isNaN(nextTorrent.split("/")[1]) === false) {
			nextTorrent = nextTorrent.split("/")[0];
		}
		rememberPlaylist = retrievePlaylist();
		for (ijk = 0; ijk < wjs().itemCount(); ijk++) {
			if (isNaN(rememberPlaylist[ijk.toString()].mrl) === false) rememberPlaylist[ijk.toString()].mrl = "pow://"+powGlobals.engine.infoHash+"/"+rememberPlaylist[ijk.toString()].mrl;
		}
		wjs().setDownloaded(0);
//		console.log("magnet:?xt=urn:btih:"+nextTorrent);
		goBack("magnet:?xt=urn:btih:"+nextTorrent);
		return;
	}
//	console.log("local ip: "+dlna.localIp);
	if (dlna.localIp) {
		if (powGlobals.engine) dlna.mimeType = require('mime-types').lookup(powGlobals.engine.files[powGlobals.files[powGlobals.videos[dlna.lastIndex].index].index].path);
		else dlna.mimeType = require('mime-types').lookup(powGlobals.videos[dlna.lastIndex].path);

		if (wjs().plugin.playlist.items[dlna.lastIndex].mrl.indexOf("http://localhost") == 0) {
			startDlnaServer(wjs().plugin.playlist.items[dlna.lastIndex].mrl.replace('localhost',dlna.localIp),dlnaReconnect);
		} else {

			if (wjs().plugin.playlist.items[dlna.lastIndex].mrl.indexOf("file:///") == 0) {
				if (dlna.files && dlna.files[0]) {
					remIj = 0;
					if (wjs().plugin.playlist.items[dlna.lastIndex].mrl.indexOf("file:///") == 0) {
						isLoaded = dlna.files.some(function (el,ij) {
							if (el.filename == wjs().plugin.playlist.items[dlna.lastIndex].mrl.split("/").pop()) { remIj = ij; return true; }
						});
						if (!isLoaded) {
							if (!dlna.server) shouldStartServer = true;
							else { remIj = -1; shouldStartServer = false; }
						} else shouldStartServer = false;
					} else shouldStartServer = false;
				} else shouldStartServer = true;
				
				if (shouldStartServer) {
					var http = require('http'),
						fs = require('fs'),
						util = require('util');
						
					if (!dlna.files) {
					  dlna.files = [];
					  uig = 0;
					  for (i = 0; i < wjs().itemCount(); i++) {
						  if (wjs().plugin.playlist.items[i].mrl.indexOf("file:///") == 0) {
							  dlna.files[uig] = {};
							  dlna.files[uig].filename = powGlobals.videos[i].filename;
							  dlna.files[uig].videoIndex = i;
							  dlna.files[uig].mimeType = require('mime-types').lookup(powGlobals.videos[i].path);
							  uig++;
						  }
					  }
					}
					 
					dlna.server = http.createServer(function (req, res) {
					  var u = pUrl.parse(req.url);
					  dlna.files.forEach(function(el,ij) {
						  if (u.pathname.slice(1) === ij) {
							  u.pathname = '/' + ij;
							  if (!dlna.files[ij].pathname) dlna.files[ij].pathname = '/' + ij;
						  }
					  });
					  
					  var uig = Number(u.pathname.slice(1));
	
					  var path = powGlobals.videos[dlna.files[uig].videoIndex].path;
					  var stat = fs.statSync(path);
					  var total = stat.size;
					  
					  if (isNaN(uig) || uig >= dlna.files.length) {
						  res.statusCode = 404
						  res.end()
						  return
					  }
					  
						// Allow CORS requests to specify arbitrary headers, e.g. 'Range',
						// by responding to the OPTIONS preflight request with the specified
						// origin and requested headers.
						if (req.method === 'OPTIONS' && req.headers['access-control-request-headers']) {
						  res.setHeader('Access-Control-Allow-Origin', req.headers.origin)
						  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
						  res.setHeader(
							  'Access-Control-Allow-Headers',
							  req.headers['access-control-request-headers'])
						  res.setHeader('Access-Control-Max-Age', '1728000')
					
						  res.end()
						  return
						}
					  
					  if (req.headers.origin) res.setHeader('Access-Control-Allow-Origin', req.headers.origin)
					  
					  if (req.headers['range']) {
						var range = req.headers.range;
						var parts = range.replace(/bytes=/, "").split("-");
						var partialstart = parts[0];
						var partialend = parts[1];
						var start = parseInt(partialstart, 10);
						var end = partialend ? parseInt(partialend, 10) : total-1;
						var chunksize = (end-start)+1;
					  
						var file = fs.createReadStream(path, {start: start, end: end});
						
						res.statusCode = 206;
						res.setHeader('Content-Range', 'bytes ' + start + '-' + end + '/' + total);
						res.setHeader('Accept-Ranges', 'bytes');
						res.setHeader('Content-Length', chunksize);
						res.setHeader('Content-Type', dlna.files[uig].mimeType);
						res.setHeader('transferMode.dlna.org', 'Streaming');
						res.setHeader('contentFeatures.dlna.org', 'DLNA.ORG_OP=01;DLNA.ORG_CI=0;DLNA.ORG_FLAGS=017000 00000000000000000000000000');
						
						if (req.method === 'HEAD') return res.end();
						file.pipe(res);
					  } else {
						res.statusCode = 200;
						res.setHeader('Content-Length', total);
						res.setHeader('Content-Type', dlna.files[uig].mimeType);
						res.setHeader('transferMode.dlna.org', 'Streaming');
						res.setHeader('contentFeatures.dlna.org', 'DLNA.ORG_OP=01;DLNA.ORG_CI=0;DLNA.ORG_FLAGS=017000 00000000000000000000000000');
						if (res.method === 'HEAD') return res.end();
						fs.createReadStream(path).pipe(res);
					  }
					  
					}).listen();
					
					dlna.server.on('listening',function() {
						var remIj = 0;
						dlna.files.some(function(el,ij) {
							if (el.filename == wjs().plugin.playlist.items[dlna.lastIndex].mrl.split("/").pop()) { remIj = ij; return true; }
						});
						
						if (dlnaReconnect === true) startDlnaServer('http://'+dlna.localIp+':'+dlna.server.address().port+'/'+remIj.toString(),true);
						else startDlnaServer('http://'+dlna.localIp+':'+dlna.server.address().port+'/'+remIj.toString(),false);

					});
				} else {
					if (remIj == -1) {
						  uig = dlna.files.length;
						  dlna.files[uig] = {};
						  dlna.files[uig].filename = powGlobals.videos[dlna.lastIndex].filename;
						  dlna.files[uig].videoIndex = dlna.lastIndex;
						  dlna.files[uig].mimeType = require('mime-types').lookup(powGlobals.videos[dlna.lastIndex].path);
						  startDlnaServer('http://'+dlna.localIp+':'+dlna.server.address().port+'/'+uig);
					} else startDlnaServer('http://'+dlna.localIp+':'+dlna.server.address().port+'/'+remIj);
				}
			} else {
			  uig = dlna.files.length;
			  dlna.files[uig] = {};
			  dlna.files[uig].filename = powGlobals.videos[dlna.lastIndex].filename;
			  dlna.files[uig].videoIndex = dlna.lastIndex;
			  dlna.files[uig].mimeType = require('mime-types').lookup(powGlobals.videos[dlna.lastIndex].path);
			  startDlnaServer('http://'+dlna.localIp+':'+dlna.server.address().port+'/'+uig);
			}
		}
	}
}
function findMyIp() {
	require('dns').lookup(require('os').hostname(), function (err, add, fam) {
		if (add) {
			dlna.localIp = add;
			prepareDlnaServer();
		}
	});
}

function findDlnaClient() {
	if (wjs().state() == "playing" || wjs().state() == "paused") dlna.lastSecond = Math.floor(wjs().time()/1000);
	else dlna.lastSecond = 0;
	dlna.lastIndex = parseInt(wjs().currentItem());
	dlna.initiated = true;

	player.wrapper.find(".wcp-vol-button").hide(0);
	wjs().wrapper.find(".wcp-vol-control")[0].style.borderRight = "none";
	player.wrapper.find(".wcp-subtitle-but").hide(0);

	wjs().setOpeningText("Searching for Device ...");
	wjs().stopPlayer();
	wjs().wrapper.find(".wcp-splash-screen").show(0);
	dlna.clients = [];

    var Client = require('node-ssdp').Client
      , client = new Client();

    client.on('response', function (headers, statusCode, rinfo) {
//		console.log(headers);
		if (headers["LOCATION"]) {
			dlna.clients.push(headers["LOCATION"]);
		}
		if (dlna.clients.length == 1){
			if (headers["SERVER"]) dlna.serverName = headers["SERVER"]; // remember the server name
			findMyIp(); // remove this line for select device menu
		}
	});
	
// uncomment this line for select device menu
//	setTimeout(function() { checkClients(); },1000);

    client.search('urn:schemas-upnp-org:device:MediaRenderer:1');
}

function checkClients() {
	if (dlna.clients.length == 1) findMyIp();
	else {
//		select device menu needs to be implemented in WebChimera.js Player
//		if (dlna.clients.length > 1) 
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
	castData = {};
	keepAwake();
	if (dlna.lastSecond > 30) wjs().setOpeningText("Updating playback position ...");
	else wjs().setOpeningText("Streaming to TV ...");
	samsungDlna.retries = 0;
	castData.casting = 1;
	castData.castingPaused = 0;
	
	player.wrapper.find(".wcp-play").removeClass("wcp-play").addClass("wcp-pause");
	player.wrapper.find(".wcp-replay").removeClass("wcp-replay").addClass("wcp-pause");
}

function dlnaPlay(remIndex) {
	if (remIndex < wjs().itemCount()) {
		if (player.itemDesc(remIndex).disabled) {
			var noDisabled = true;
			for (i = remIndex +1; i < player.itemCount(); i++) {
				if (!player.itemDesc(i).disabled) {
					noDisabled = false;
					break;
				}
			}
			if (noDisabled) return;
			remIndex = i;
		}

		dlna.lastPos = 0;
		if (typeof remIndex !== 'undefined') {
			resetDlnaData(function() {
				if (dlna.interval) {
					clearInterval(dlna.interval);
					delete dlna.interval;
				}
				dlna.prevIndex = dlna.lastIndex
				dlna.lastIndex = remIndex;
				if (wjs().plugin.playlist.items[dlna.lastIndex]) {
					win.title = wjs().plugin.playlist.items[dlna.lastIndex].title.replace("[custom]","");
					winTitleLeft(wjs().plugin.playlist.items[dlna.lastIndex].title.replace("[custom]",""));
				}
				if (powGlobals.engine) {
					powGlobals.files.some(function(el,ij) { if (ij == powGlobals.videos[dlna.lastIndex].index) { playEl(ij); return true; } });
				}
				prepareDlnaServer(true);
			});
		} else dlna.controls.play();
	}
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
		if (castData.casting && dlna.lastPos > 0.9) {
			if (dlna.lastIndex +1 < wjs().itemCount()) {
				wjs().setOpeningText("Starting Next Video ...");
				castData.castingPaused = 1;
				dlnaPlay(dlna.lastIndex+1);
				// implement change video in playlist
			} else {
				// remove this line when adding playlist support
				wjs().setOpeningText("Playback Ended");
				if (dlna.controls) dlna.controls.server.close(function() { resetDlnaGlobals(); });
			}
		}
	}
	if (status["TransportStatus"] == "ERROR_OCCURRED") {
		wjs().setOpeningText("Error Occurred");
		if (dlna.serverName == "SHP, UPnP/1.0, Samsung UPnP SDK/1.0" && samsungDlna.retries < 3) {
			// reconnect if samsung and the previous or next file is mkv (this is a bug from samsung)
			wjs().setOpeningText("Reconnecting ...");
			if (dlna.controls) {
				dlna.controls.removeListener('status', onDlnaStatus);
				dlna.controls.removeListener('playing', onDlnaPlaying);
				dlna.controls.removeListener('paused', onDlnaPaused);
			}
			if (dlna.interval) {
				clearInterval(dlna.interval);
				delete dlna.interval;
			}
			if (samsungDlna.timeout) clearTimeout(samsungDlna.timeout);
			samsungDlna.timeout = setTimeout(function() {
				resetDlnaData(function() {
					dlna.controls.stop();
					if (dlna.controls.server) dlna.controls.server.close(function() {
						if (dlna.server) dlna.server.files = [];
						prepareDlnaServer(false);
					});
					else {
						if (dlna.server) dlna.server.files = [];
						prepareDlnaServer(false);
					}
					samsungDlna.retries++;
				});
			},500);
		} else {
			// unknown error, close dlna server
			if (dlna.controls) {
				dlna.controls.removeListener('status', onDlnaStatus);
				dlna.controls.removeListener('playing', onDlnaPlaying);
				dlna.controls.removeListener('paused', onDlnaPaused);
			}
			if (dlna.interval) {
				clearInterval(dlna.interval);
				delete dlna.interval;
			}
			resetDlnaData(function() { dlna.controls.stop(); });
		}
	}
}
function onDlnaPlaying() {
	wjs().setOpeningText("Streaming to TV ...");
	samsungRetries = 0;
	castData.casting = 1;
	castData.castingPaused = 0;
	
	player.wrapper.find(".wcp-play").removeClass("wcp-play").addClass("wcp-pause");
	player.wrapper.find(".wcp-replay").removeClass("wcp-replay").addClass("wcp-pause");
}
function onDlnaPaused() {
	castData.castingPaused = 1;
	wjs().setOpeningText("Playback Paused ...");
	
	player.wrapper.find(".wcp-pause").removeClass("wcp-pause").addClass("wcp-play");
}
// end listeners

function attachDlnaHandlers() {
	player.wrapper.find(".wcp-button").click(function(e) {
		buttonClass = this.className.replace("wcp-button","").replace("wcp-left","").replace("wcp-vol-button","").replace("wcp-right","").split(" ").join("");
		if (castData.casting == 1 && ["wcp-play","wcp-pause","wcp-replay","wcp-prev","wcp-next"].indexOf(buttonClass) > -1) {
			if (buttonClass == "wcp-play") {
				$(this).removeClass("wcp-play").addClass("wcp-pause");
				if (player.wrapper.find(".wcp-anim-basic").hasClass("wcp-anim-icon-pause")) {
					player.wrapper.find(".wcp-anim-basic").removeClass("wcp-anim-icon-pause").addClass("wcp-anim-icon-play");
				}
				player.animatePause();
				dlna.controls.play();
				castData.castingPaused = 0;
			} else if (buttonClass == "wcp-pause") {
				$(this).removeClass("wcp-pause").addClass("wcp-play");
				if (player.wrapper.find(".wcp-anim-basic").hasClass("wcp-anim-icon-play")) {
					player.wrapper.find(".wcp-anim-basic").removeClass("wcp-anim-icon-play").addClass("wcp-anim-icon-pause");
				}
				player.animatePause();
				dlna.controls.pause();
				castData.castingPaused = 1;
			} else if (buttonClass == "wcp-replay") {
				$(this).removeClass("wcp-replay").addClass("wcp-pause");
				if (player.wrapper.find(".wcp-anim-basic").hasClass("wcp-anim-icon-play")) {
					player.wrapper.find(".wcp-anim-basic").removeClass("wcp-anim-icon-play").addClass("wcp-anim-icon-pause");
				}
				player.animatePause();
				dlna.controls.play();
				castData.castingPaused = 0;
			} else if (buttonClass == "wcp-prev") {
				if (dlna.lastIndex > 0) {
					var noDisabled = true;
					for (i = dlna.lastIndex -1; i > -1; i--) {
						if (!player.itemDesc(i).disabled) {
							noDisabled = false;
							break;
						}
					}
					if (noDisabled) return;

					wjs().setOpeningText("Starting Previous Video ...");
					castData.castingPaused = 1;
					dlnaPlay(dlna.lastIndex-1);
				}
			} else if (buttonClass == "wcp-next") {
				if (dlna.lastIndex +1 < wjs().itemCount()) {
					var noDisabled = true;
					for (i = dlna.lastIndex +1; i < player.itemCount(); i++) {
						if (!player.itemDesc(i).disabled) {
							noDisabled = false;
							break;
						}
					}
					if (noDisabled) return;

					wjs().setOpeningText("Starting Next Video ...");
					castData.castingPaused = 1;
					dlnaPlay(dlna.lastIndex+1);
				}
			}
		}
	});
	player.wrapper.find(".wcp-surface").click(function() {
		if (castData.casting == 1) {
			if (castData.castingPaused == 0) {
				player.wrapper.find(".wcp-pause").removeClass("wcp-pause").addClass("wcp-play");
				if (player.wrapper.find(".wcp-anim-basic").hasClass("wcp-anim-icon-play")) {
					player.wrapper.find(".wcp-anim-basic").removeClass("wcp-anim-icon-play").addClass("wcp-anim-icon-pause");
				}
				player.animatePause();
				dlna.controls.pause();
				castData.castingPaused = 1;
			} else if (castData.castingPaused == 1) {
				player.wrapper.find(".wcp-play").removeClass("wcp-play").addClass("wcp-pause");
				$(this).removeClass("wcp-play").addClass("wcp-pause");
				if (player.wrapper.find(".wcp-anim-basic").hasClass("wcp-anim-icon-pause")) {
					player.wrapper.find(".wcp-anim-basic").removeClass("wcp-anim-icon-pause").addClass("wcp-anim-icon-play");
				}
				player.animatePause();
				dlna.controls.play();
				castData.castingPaused = 0;
			}
		}
	});
}