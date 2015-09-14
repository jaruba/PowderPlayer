
var dlna = {
	
	instance: {
		clients: [],
		checks: 0,
		started: false,
		initiated: false
	},

	params: {
		oldDlnaData: {},
		oldHttpServer: false,
		pUrl: require('url'),
		samsungDlna: {},
		nextStartDlna: 0
	},
	
	castData: {},
	saved: {},
	notFoundTimer: false,
	
	setOpts: function() {
		dlna.instance.started = true;
		dlna.castData.casting = 1;
		dlna.castData.castingPaused = 0;
		
		player.wrapper.find(".wcp-play").removeClass("wcp-play").addClass("wcp-pause");
		player.wrapper.find(".wcp-replay").removeClass("wcp-replay").addClass("wcp-pause");
	
		if (dlna.instance.lastSecond > 0) {
			if (dlna.instance.lastSecond > 30) {
				dlna.instance.controls.seek(dlna.instance.lastSecond);
				player.setOpeningText("Streaming to TV ...");
				if (dlna.notFoundTimer) clearTimeout(dlna.notFoundTimer);
				$(".wcp-dlna-buttons").hide(0);
				dlna.params.samsungDlna.retries = 0;
			}
			dlna.instance.lastSecond = 0;
		} else {
			if (dlna.saved.allowOnce) {
				if (player.itemDesc(dlna.instance.lastIndex).title == dlna.saved.title && dlna.saved.time) {
					dlna.instance.controls.seek(dlna.saved.time);
					player.setOpeningText("Streaming to TV ...");
				}
				dlna.saved = {};
			}
		}
		if (dlna.saved.allowOnce) dlna.saved = {};
	},

	resetGlobals: function() {
		if (dlna.instance.controls) {
			dlna.instance.controls.removeListener('status', dlna.listeners.onStatus);
			dlna.instance.controls.removeListener('playing', dlna.listeners.onPlaying);
			dlna.instance.controls.removeListener('paused', dlna.listeners.onPaused);
		}
		if (dlna.instance.interval) {
			clearInterval(dlna.instance.interval);
			delete dlna.instance.interval;
		}
		dlna.instance = {};
		dlna.instance.clients = [];
		dlna.instance.checks = 0;
		dlna.instance.started = false;
		if (dlna.castData.casting) dlna.resetData();
	},
	
	sendData: function(dlnaTime,dlnaLength) {
		dlna.castData.castTime = dlnaTime * 1000;
		dlna.castData.castLength = dlnaLength * 1000;
		dlna.castData.castPos = (dlnaTime / dlnaLength);
		if (dlna.castData.castPos < 0.94 && !dlna.saved.allowOnce) {
			dlna.saved.time = dlnaTime;
			if (!dlna.saved.title && typeof dlna.instance.lastIndex !== 'undefined') {
				dlna.saved.title = player.itemDesc(dlna.instance.lastIndex).title;
			}
		} else if (dlna.castData.castPos > 0.94) {
			if (dlna.saved.time) {
				// giving it 3 chances before removal to avoid data loss from errors that trigger the Endded State
				if (!dlna.saved.removal) dlna.saved.removal = 1;
				else dlna.saved.removal++;
				if (dlna.saved.removal == 3) dlna.saved = {};
			}
		}
		if (dlna.castData.castTime > 0 && dlna.castData.castLength > 0) {
			player.wrapper.find(".wcp-time-current").text(player.parseTime(dlna.castData.castTime,dlna.castData.castLength));
			player.wrapper.find(".wcp-time-total").text(" / "+player.parseTime(dlna.castData.castLength));
		}
		dlna.instance.lastPos = dlna.castData.castPos;
		if (dlna.castData.castPos > 0) {
			player.wrapper.find(".wcp-progress-seen")[0].style.width = (dlna.castData.castPos*100)+"%";
		}
		if (dlna.castData.castTime > 0 && dlna.castData.casting == 0) {
			dlna.castData.casting = 1;
			dlna.castData.castingPaused = 0;
	
			player.wrapper.find(".wcp-play").removeClass("wcp-play").addClass("wcp-pause");
			player.wrapper.find(".wcp-replay").removeClass("wcp-replay").addClass("wcp-pause");
		}
	},
	
	resetData: function(keepCasting,cb) {
		if (typeof keepCasting === 'function') {
			cb = keepCasting;
			keepCasting = false;
		} else keepCasting = typeof keepCasting !== 'undefined' ? keepCasting : false;
		
		if (keepCasting) {
			dlna.castData.casting = 1;
			dlna.castData.castingPaused = 0;
	
			player.wrapper.find(".wcp-play").removeClass("wcp-play").addClass("wcp-pause");
			player.wrapper.find(".wcp-replay").removeClass("wcp-replay").addClass("wcp-pause");
		}
		else dlna.castData.casting = 0;
		dlna.castData.castTime = 0;
		dlna.castData.castLength = 0;
		dlna.castData.castPos = 0;
		dlna.castData.castingPaused = 2;
		if (typeof cb === "function") cb();
	},
	
	stop: function(noSubs) {
		win.gui.setMinimumSize(372, 210);
		if (dlna.notFoundTimer) clearTimeout(dlna.notFoundTimer);
		if (dlna.bestMatches && dlna.bestMatches.length) dlna.bestMatches = [];
		if (dlna.instance.controls) dlna.instance.controls.removeAllListeners();
		if (dlna.castData.casting) dlna.resetData();
	
		player.find(".wcp-time-current").text("");
		player.find(".wcp-time-total").text("");
		player.find(".wcp-progress-seen")[0].style.width = "0%";
		player.find(".wcp-vol-control")[0].style.borderRight = "1px solid #262626";
		$(".wcp-dlna-buttons").hide(0);
	
		player.setOpeningText("Stopped Streaming");
		if (dlna.instance.controls) dlna.instance.controls.stop();
		utils.sleep.allow();
		dlna.instance.initiated = false;
		dlna.castData.casting = 0;
		player.find(".wcp-vol-button").show(0);
		player.find(".wcp-pause").removeClass("wcp-pause").addClass("wcp-play");
		if (typeof noSubs === 'undefined') {
			newSettings = player.vlc.playlist.items[dlna.instance.lastIndex].setting;
			if (utils.isJsonString(newSettings)) {
				newSettings = JSON.parse(newSettings);
			} else newSettings = {};
			if (newSettings.subtitles) player.wrapper.find(".wcp-subtitle-but").show(0);
		}
	},
	
	startServer: function(httpServer,dlnaReconnect) {
		dlnaReconnect = typeof dlnaReconnect !== 'undefined' ? dlnaReconnect : false;
	
		dlna.saved.allowOnce = true;
	
		var MediaRendererClient = require('upnp-mediarenderer-client');
		
		if (!dlnaReconnect) {
			player.setOpeningText("Starting DLNA Server ...");
			clearTimeout(dlna.notFoundTimer);
			dlna.instance.controls = new MediaRendererClient(dlna.instance.clients[0]);
			oldClients = JSON.parse(localStorage.dlnaClients);
			var votedClient = false;
			for (var k in oldClients) if (oldClients.hasOwnProperty(k)) {
				if (k == dlna.instance.clients[0]) {
					oldClients[k] = oldClients[k] +1;
					votedClient = true;
					break;
				}
			}
			if (!votedClient) oldClients[dlna.instance.clients[0]] = 1;
			localStorage.dlnaClients = JSON.stringify(oldClients);
			localStorage.lastDlna = dlna.instance.clients[0];
			dlna.instance.controls.on('status', dlna.listeners.onStatus);
			dlna.instance.controls.on('playing', dlna.listeners.onPlaying);
			dlna.instance.controls.on('paused', dlna.listeners.onPaused);
		}
		dlna.castData.casting = 0;
		dlna.instance.checks = 0;
		dlna.instance.paused = false;
	
		var options = {
			autoplay: true,
			metadata: {
				title: player.vlc.playlist.items[dlna.instance.lastIndex].title.replace("[custom]","")
			}
		};
		
	//	console.log(" - "+httpServer);
		if (!dlnaReconnect) { dlna.instance.controls.load(httpServer, options, dlna.listeners.onLoad); }
		else dlna.instance.controls.load(httpServer, options, function() {});
		
		dlna.instance.interval = setInterval(function(){
			if (dlna.instance.duration) {
				dlna.instance.controls.getPosition(function(err, position) {
					if (position > 0) dlna.sendData(position,dlna.instance.duration);
				});
			} else {
				dlna.instance.controls.getDuration(function(err, duration) {
					dlna.instance.duration = duration;
					if (dlna.instance.duration > 0) {
						dlna.instance.controls.getPosition(function(err, position) {
							if (position > 0) dlna.sendData(position,dlna.instance.duration);
						});
					}
				});
			}
		},1000);
	},
	
	prepareServer: function(dlnaReconnect) {
		player.refreshPlaylist();
		dlna.instance.lastPos = 0;
		dlnaReconnect = typeof dlnaReconnect !== 'undefined' ? dlnaReconnect : false;
		if (dlna.instance.lastIndex == -1 && typeof playerApi.tempSel !== 'undefined' && playerApi.tempSel > -1) {
			dlna.instance.lastIndex = playerApi.tempSel;
		}
		if (player.itemDesc(dlna.instance.lastIndex).mrl.indexOf("pow://") == 0 || player.itemDesc(dlna.instance.lastIndex).mrl.indexOf("magnet:?xt=urn:btih:") == 0) {
			playerApi.waitForNext = true;
			dlna.params.nextStartDlna = 1;
			if (player.itemDesc(player.currentItem()).mrl.indexOf("pow://") == 0) {
				nextTorrent = "magnet:?xt=urn:btih:"+player.itemDesc(dlna.instance.lastIndex).mrl.replace("pow://","");
				if (nextTorrent.indexOf("/") > -1 && isNaN(nextTorrent.split("/")[1]) === false) {
					nextTorrent = nextTorrent.split("/")[0];
				}
			} else nextTorrent = player.itemDesc(dlna.instance.lastIndex).mrl;
			win.title.left(player.itemDesc(dlna.instance.lastIndex).title.replace("[custom]",""));
			playerApi.playlist.saved = playerApi.playlist.retrieve();
			for (ijk = 0; ijk < player.itemCount(); ijk++) {
				if (isNaN(playerApi.playlist.saved[ijk.toString()].mrl) === false) {
					playerApi.playlist.saved[ijk.toString()].mrl = "pow://"+powGlobals.torrent.engine.infoHash+"/"+playerApi.playlist.saved[ijk.toString()].mrl;
				}
			}
			player.setDownloaded(0);
	//		console.log("magnet:?xt=urn:btih:"+nextTorrent);
			ui.goto.mainMenu(nextTorrent);
			return;
		}
	//	console.log("local ip: "+dlna.localIp);
		if (dlna.instance.localIp) {
			if (powGlobals.lists.media[dlna.instance.lastIndex] && powGlobals.lists.media[dlna.instance.lastIndex].path) {
				dlna.mimeType = require('mime-types').lookup(powGlobals.lists.media[dlna.instance.lastIndex].path);
			}
	
			if (player.itemDesc(dlna.instance.lastIndex).mrl.indexOf("http://localhost") == 0) {
				dlna.startServer(player.itemDesc(dlna.instance.lastIndex).mrl.replace('localhost',dlna.instance.localIp),dlnaReconnect);
			} else {
	
				if (player.itemDesc(dlna.instance.lastIndex).mrl.indexOf("file:///") == 0) {
					if (dlna.instance.files && dlna.instance.files[0]) {
						remIj = 0;
						if (player.itemDesc(dlna.instance.lastIndex).mrl.indexOf("file:///") == 0) {
							isLoaded = dlna.instance.files.some(function (el,ij) {
								if (el.filename == utils.parser(player.itemDesc(dlna.instance.lastIndex).mrl).filename()) {
									remIj = ij;
									return true;
								}
							});
							if (!isLoaded) {
								if (!dlna.instance.server) shouldStartServer = true;
								else { remIj = -1; shouldStartServer = false; }
							} else shouldStartServer = false;
						} else shouldStartServer = false;
					} else shouldStartServer = true;
					
					if (shouldStartServer) {
						var http = require('http'),
							fs = require('fs'),
							util = require('util');
							
						if (!dlna.instance.files) {
						  dlna.instance.files = [];
						  uig = 0;
						  for (i = 0; i < player.itemCount(); i++) {
							  if (player.itemDesc(i).mrl.indexOf("file:///") == 0) {
								  dlna.instance.files[uig] = {};
								  dlna.instance.files[uig].filename = powGlobals.lists.media[i].filename;
								  dlna.instance.files[uig].videoIndex = i;
								  dlna.instance.files[uig].mimeType = require('mime-types').lookup(powGlobals.lists.media[i].path);
								  uig++;
							  }
						  }
						}
						 
						dlna.instance.server = http.createServer(function (req, res) {
						  var u = dlna.params.pUrl.parse(req.url);
						  dlna.instance.files.forEach(function(el,ij) {
							  if (u.pathname.slice(1) === ij) {
								  u.pathname = '/' + ij;
								  if (!dlna.instance.files[ij].pathname) dlna.instance.files[ij].pathname = '/' + ij;
							  }
						  });
						  
						  var uig = Number(u.pathname.slice(1));
		
						  var path = powGlobals.lists.media[dlna.instance.files[uig].videoIndex].path;
						  var total = utils.fs.size(path);
						  
						  if (isNaN(uig) || uig >= dlna.instance.files.length) {
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
							res.setHeader('Content-Type', dlna.instance.files[uig].mimeType);
							res.setHeader('transferMode.dlna.org', 'Streaming');
							res.setHeader('contentFeatures.dlna.org', 'DLNA.ORG_OP=01;DLNA.ORG_CI=0;DLNA.ORG_FLAGS=017000 00000000000000000000000000');
							
							if (req.method === 'HEAD') return res.end();
							file.pipe(res);
						  } else {
							res.statusCode = 200;
							res.setHeader('Content-Length', total);
							res.setHeader('Content-Type', dlna.instance.files[uig].mimeType);
							res.setHeader('transferMode.dlna.org', 'Streaming');
							res.setHeader('contentFeatures.dlna.org', 'DLNA.ORG_OP=01;DLNA.ORG_CI=0;DLNA.ORG_FLAGS=017000 00000000000000000000000000');
							if (res.method === 'HEAD') return res.end();
							fs.createReadStream(path).pipe(res);
						  }
						  
						}).listen();
						
						dlna.instance.server.on('listening',function() {
							var remIj = 0;
							dlna.instance.files.some(function(el,ij) {
								if (el.filename == utils.parser(player.itemDesc(dlna.instance.lastIndex).mrl).filename()) {
									remIj = ij;
									return true;
								}
							});
							
							if (typeof dlnaReconnect === 'undefined') dlnaReconnect = false;
							dlna.startServer('http://'+dlna.instance.localIp+':'+dlna.instance.server.address().port+'/'+remIj.toString(),dlnaReconnect);
	
						});
					} else {
						if (remIj == -1) {
							  uig = dlna.instance.files.length;
							  dlna.instance.files[uig] = {};
							  dlna.instance.files[uig].filename = powGlobals.lists.media[dlna.instance.lastIndex].filename;
							  dlna.instance.files[uig].videoIndex = dlna.instance.lastIndex;
							  dlna.instance.files[uig].mimeType = require('mime-types').lookup(powGlobals.lists.media[dlna.instance.lastIndex].path);
							  dlna.startServer('http://'+dlna.instance.localIp+':'+dlna.instance.server.address().port+'/'+uig);
						} else dlna.startServer('http://'+dlna.instance.localIp+':'+dlna.instance.server.address().port+'/'+remIj);
					}
				} else {
				  uig = dlna.instance.files.length;
				  dlna.instance.files[uig] = {};
				  dlna.instance.files[uig].filename = powGlobals.lists.media[dlna.instance.lastIndex].filename;
				  dlna.instance.files[uig].videoIndex = dlna.instance.lastIndex;
				  dlna.instance.files[uig].mimeType = require('mime-types').lookup(powGlobals.lists.media[dlna.instance.lastIndex].path);
				  dlna.startServer('http://'+dlna.instance.localIp+':'+dlna.instance.server.address().port+'/'+uig);
				}
			}
		}
	},
	
	findMyIp: function() {
		
		var ips = [],
			ifaces = require('os').networkInterfaces();
		
		for (var dev in ifaces) {
			ifaces[dev].forEach(function (details) {
				if (!details.internal) {
					ips.push(details.address);
				}
			});
		}
		
		var bestIp,
			bestRatio = 0;
			
		ips.forEach(function(el,ij) {
			newRatio = dlna.compareIps('http://'+el,dlna.instance.clients[0]);
			if (newRatio > bestRatio) {
				bestIp = el;
				bestRatio = newRatio;
			}
		});

		if (bestIp) {
			dlna.instance.localIp = bestIp;
			dlna.prepareServer();
		} else player.setOpeningText("Failed to Detect Local IP");
	},

	compareIps: function(strA,strB){
		for(var result = 0, i = strA.length; i--;){
			if(typeof strB[i] == 'undefined' || strA[i] == strB[i]);
			else if(strA[i].toLowerCase() == strB[i].toLowerCase())
				result++;
			else
				result += 4;
		}
		return 1 - (result + 4*Math.abs(strA.length - strB.length))/(2*(strA.length+strB.length));
	},

	tryKnown: function() {
		if (dlna.bestMatches.length) {
			
			parsedUrl = require('url').parse(dlna.bestMatches[0]);
			
			if (!parsedUrl.port) parsedUrl.port = '80';
			
			dlna.checkPort(parsedUrl.hostname,parsedUrl.port,function(inUse) {
				
				if (inUse) {

					var options = {
					  hostname: parsedUrl.hostname,
					  port: parsedUrl.port,
					  path: parsedUrl.path
					};
					
					var req = require('http').request(options, function(res) {
//					  console.log('STATUS: ' + res.statusCode);
//					  console.log('HEADERS: ' + JSON.stringify(res.headers));
					  window.dlna.instance.clients[0] = dlna.bestMatches[0];
					  window.dlna.findMyIp();
					});
					
					req.on('socket', function (socket) {
						socket.setTimeout(3000);
						socket.on('timeout', function() {
//							console.log("aborting");
							req.abort();
						});
					});
					
					req.on('error', function(e) {
					  if (!dlna.castData.casting) {
//						  console.log('failed with: '+dlna.bestMatches[0]);
//						  console.log('problem with request: ' + e.message);
						  dlna.bestMatches.shift();
//						  console.log("current array length: "+dlna.bestMatches.length);
						  if (dlna.bestMatches.length) dlna.tryKnown();
						  else player.setOpeningText("Error: Nothing Found");
					  }
					});
					
					req.end();
					
				} else if (!dlna.castData.casting) {
//					console.log('failed with: '+dlna.bestMatches[0]);
//					console.log('problem with request: port not open on dlna device');
					dlna.bestMatches.shift();
//				    console.log("current array length: "+dlna.bestMatches.length);
				    if (dlna.bestMatches.length) dlna.tryKnown();
				    else player.setOpeningText("Error: Nothing Found");
				}
				
			});
		}
	},
	
	checkPort: function(devIp,devPort,cb) {
		if (dlna.checkedPorts && dlna.checkedPorts.length) {
			devResult = dlna.checkedPorts.some(function(el,ij) {
				if (el[0] == devIp && el[1] == devPort) {
//					console.log('Refound: '+devIp+' Port '+devPort+' usage: '+el[2]);
					if (el[2]) cb(true);
					else cb(false);
					return true;
				}
			});
			if (devResult) return;
		}

		if (!dlna.checkedPorts) dlna.checkedPorts = [];

		require('tcp-port-used').check(parseInt(devPort), devIp)
		.then(function(inUse) {
//			console.log('Ip: '+devIp+' Port '+devPort+' usage: '+inUse);
			dlna.checkedPorts.push([devIp,devPort,true]);
			cb(true);
		}, function(err) {
//			console.log('Ip: '+devIp+' Port '+devPort+' Error: '+err.message);
			dlna.checkedPorts.push([devIp,devPort,false]);
			cb(false);
		});
	},
	
	findClient: function() {
		win.gui.setMinimumSize(448, 348);
		if (['playing','paused'].indexOf(player.state()) > -1) dlna.instance.lastSecond = Math.floor(player.time()/1000);
		else dlna.instance.lastSecond = 0;
		dlna.instance.lastIndex = parseInt(player.currentItem());
		dlna.instance.initiated = true;
	
		player.find(".wcp-vol-button").hide(0);
		player.find(".wcp-vol-control")[0].style.borderRight = "none";
		player.find(".wcp-subtitle-but").hide(0);
	
		player.setOpeningText("Searching for Device ...");
		player.stop(true);
		player.find(".wcp-splash-screen").show(0);
		dlna.instance.clients = [];
		clearTimeout(dlna.notFoundTimer);
		dlna.notFoundTimer = setTimeout(function() {
			if (!dlna.castData.casting) {
//				console.log("starting search by known connections");

				dlna.bestMatches = [];

				if (localStorage.lastDlna) {
			        dlna.bestMatches.push(localStorage.lastDlna);
				}
				
				oldClients = JSON.parse(localStorage.dlnaClients);
				var voteClients = [];
				for (var k in oldClients) if (oldClients.hasOwnProperty(k)) {
					if (!localStorage.lastDlna || k != localStorage.lastDlna) {
						oldClients[k] = oldClients[k] +1;
						voteClients.push([k,oldClients[k]]);
					}
				}
    
				if (voteClients.length > 0) {
					var perfect = false;
					while (!perfect) {
						perfect = true;
						for (ij = 0; voteClients[ij]; ij++) {
							if (ij +1 < voteClients.length && voteClients[ij][1] < voteClients[ij+1][1]) {
								perfect = false;
								var tempClient = voteClients[ij];
								voteClients[ij] = voteClients[ij+1];
								voteClients[ij+1] = tempClient;
							}
						}
					}
				}
				
				voteClients.some(function(el,ij) {
					if (el[0] != localStorage.lastDlna) {
						dlna.bestMatches.push(el[0]);
//						if (ij == 3) return true;
					}
				});
				
				if (dlna.bestMatches.length) {
					dlna.checkedPorts = [];
					dlna.tryKnown();
				} else player.setOpeningText("Error: Nothing Found");

			}
		},10000);
		$(".wcp-dlna-buttons").show(0);
	
		var Client = require('node-ssdp').Client
		  , client = new Client();
	
		client.on('response', function (headers, statusCode, rinfo) {
	//		console.log(headers);
			if (headers["LOCATION"]) {
				dlna.instance.clients.push(headers["LOCATION"]);
			}
			if (dlna.instance.clients.length == 1){
				if (headers["SERVER"]) dlna.instance.serverName = headers["SERVER"]; // remember the server name
//				console.log(headers["SERVER"]);
				dlna.findMyIp(); // remove this line for select device menu
			}
		});
		
	// uncomment this line for select device menu
	//	setTimeout(function() { checkClients(); },1000);
	
		client.search('urn:schemas-upnp-org:device:MediaRenderer:1');
	},
	
	checkClients: function() {
		if (dlna.instance.clients.length == 1) dlna.findMyIp();
		else {
	//		select device menu needs to be implemented in WebChimera.js Player
	//		if (dlna.clients.length > 1) 
			if (dlna.instance.checks < 4) {
				dlna.instance.checks++;
				setTimeout(function() { dlna.checkClients(); },1000);
			} else dlna.instance.checks = 0;
		}
	},
	
	play: function(remIndex) {
		if (remIndex < player.itemCount()) {
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
	
			dlna.instance.lastPos = 0;
			if (typeof remIndex !== 'undefined') {
				dlna.resetData(function() {
					if (dlna.instance.controls) {
						dlna.instance.controls.removeListener('status', dlna.listeners.onStatus);
						dlna.instance.controls.removeListener('playing', dlna.listeners.onPlaying);
						dlna.instance.controls.removeListener('paused', dlna.listeners.onPaused);
					}
					if (dlna.instance.interval) {
						clearInterval(dlna.instance.interval);
						delete dlna.instance.interval;
					}
					dlna.instance.prevIndex = dlna.instance.lastIndex
					dlna.instance.lastIndex = remIndex;
					if (player.vlc.playlist.items[dlna.instance.lastIndex]) {
						win.title.left(player.vlc.playlist.items[dlna.instance.lastIndex].title.replace("[custom]",""));
					}
					if (powGlobals.torrent.engine) {
						powGlobals.lists.files.some(function(el,ij) {
							if (powGlobals.lists.media && powGlobals.lists.media[dlna.instance.lastIndex] && powGlobals.lists.media[dlna.instance.lastIndex].index == ij) {
								ui.buttons.play(ij);
								return true;
							}
						});
					}
					playerApi.tempSel = remIndex;
					dlna.instance.duration = 0;
					player.find(".wcp-vol-button").hide(0);
					player.find(".wcp-vol-control")[0].style.borderRight = "none";
					player.find(".wcp-subtitle-but").hide(0);
					player.find(".wcp-time-current").text("");
					player.find(".wcp-time-total").text("");
					player.find(".wcp-progress-seen")[0].style.width = "0%";
					$(".wcp-dlna-buttons").show(0);
	
	// this is a bit faster but it's highly unstable
	//				prepareDlnaServer(true);
					dlna.prepareServer();
					
				});
			} else dlna.instance.controls.play();
		}
	},
	
	attachHandlers: function() {
		player.wrapper.find(".wcp-button").click(function(e) {
			buttonClass = this.className.replace("wcp-button","").replace("wcp-left","").replace("wcp-vol-button","").replace("wcp-right","").split(" ").join("");
			if (dlna.castData.casting == 1 && ["wcp-play","wcp-pause","wcp-replay","wcp-prev","wcp-next"].indexOf(buttonClass) > -1) {
//				console.log("dlna casting? "+dlna.castData.casting);
				if (buttonClass == "wcp-play") {
					$(this).removeClass("wcp-play").addClass("wcp-pause");
					if (player.wrapper.find(".wcp-anim-basic").hasClass("wcp-anim-icon-pause")) {
						player.wrapper.find(".wcp-anim-basic").removeClass("wcp-anim-icon-pause").addClass("wcp-anim-icon-play");
					}
					player.animatePause();
					dlna.instance.controls.play();
					dlna.castData.castingPaused = 0;
				} else if (buttonClass == "wcp-pause") {
					$(this).removeClass("wcp-pause").addClass("wcp-play");
					if (player.wrapper.find(".wcp-anim-basic").hasClass("wcp-anim-icon-play")) {
						player.wrapper.find(".wcp-anim-basic").removeClass("wcp-anim-icon-play").addClass("wcp-anim-icon-pause");
					}
					player.animatePause();
					dlna.instance.controls.pause();
					dlna.castData.castingPaused = 1;
				} else if (buttonClass == "wcp-replay") {
					$(this).removeClass("wcp-replay").addClass("wcp-pause");
					if (player.wrapper.find(".wcp-anim-basic").hasClass("wcp-anim-icon-play")) {
						player.wrapper.find(".wcp-anim-basic").removeClass("wcp-anim-icon-play").addClass("wcp-anim-icon-pause");
					}
					player.animatePause();
					dlna.instance.controls.play();
					dlna.castData.castingPaused = 0;
				} else if (buttonClass == "wcp-prev") {
					if (dlna.instance.lastIndex > 0) {
						var noDisabled = true;
						for (i = dlna.instance.lastIndex -1; i > -1; i--) {
							if (!player.itemDesc(i).disabled) {
								noDisabled = false;
								break;
							}
						}
						if (noDisabled) return;
	
						player.setOpeningText("Starting Previous Video ...");
						dlna.castData.castingPaused = 1;
						dlna.play(i);
					}
				} else if (buttonClass == "wcp-next") {
					if (dlna.instance.lastIndex +1 < player.itemCount()) {
						var noDisabled = true;
						for (i = dlna.instance.lastIndex +1; i < player.itemCount(); i++) {
							if (!player.itemDesc(i).disabled) {
								noDisabled = false;
								break;
							}
						}
						if (noDisabled) return;
	
						player.setOpeningText("Starting Next Video ...");
						dlna.castData.castingPaused = 1;
						dlna.play(i);
					}
				}
			}
		});
		player.wrapper.find(".wcp-surface").click(function() {
			if (dlna.castData.casting == 1) {
				if (dlna.castData.castingPaused == 0) {
					player.wrapper.find(".wcp-pause").removeClass("wcp-pause").addClass("wcp-play");
					if (player.wrapper.find(".wcp-anim-basic").hasClass("wcp-anim-icon-play")) {
						player.wrapper.find(".wcp-anim-basic").removeClass("wcp-anim-icon-play").addClass("wcp-anim-icon-pause");
					}
					player.animatePause();
					dlna.instance.controls.pause();
					dlna.castData.castingPaused = 1;
				} else if (dlna.castData.castingPaused == 1) {
					player.wrapper.find(".wcp-play").removeClass("wcp-play").addClass("wcp-pause");
					$(this).removeClass("wcp-play").addClass("wcp-pause");
					if (player.wrapper.find(".wcp-anim-basic").hasClass("wcp-anim-icon-pause")) {
						player.wrapper.find(".wcp-anim-basic").removeClass("wcp-anim-icon-pause").addClass("wcp-anim-icon-play");
					}
					player.animatePause();
					dlna.instance.controls.play();
					dlna.castData.castingPaused = 0;
				}
			}
		});
	},
	
	listeners: {

		onLoad: function(err, result) {
			if(err) {
				player.setOpeningText(err);
				throw err;
			}
			dlna.castData = {};
			utils.sleep.prevent();
			if (dlna.instance.lastSecond > 30) player.setOpeningText("Updating playback position ...");
			else player.setOpeningText("Streaming to TV ...");
			clearTimeout(dlna.notFoundTimer);
			$(".wcp-dlna-buttons").hide(0);
			dlna.params.samsungDlna.retries = 0;
			dlna.castData.casting = 1;
			dlna.castData.castingPaused = 0;
			
			player.wrapper.find(".wcp-play").removeClass("wcp-play").addClass("wcp-pause");
			player.wrapper.find(".wcp-replay").removeClass("wcp-replay").addClass("wcp-pause");
		},
			
		onStatus: function(status) {
		//	console.log(status);
			if (status["CurrentTransportActions"] && status["CurrentTransportActions"].indexOf("DLNA_Seek") > -1) {
				dlna.setOpts();
			}
			if (powGlobals.torrent.engine && dlna.instance.mimeType == "video/x-msvideo" && (!status["TransportState"] || status["TransportState"] == "PLAYING") && status["CurrentMediaDuration"]) {
				// failsafe for a avi streaming issue
				dlna.setOpts();
			}
			if (dlna.instance.started && status["TransportState"] == "STOPPED") {
				if (dlna.castData.casting && dlna.instance.lastPos > 0.9) {
					if (dlna.instance.lastIndex +1 < player.itemCount()) {
						player.setOpeningText("Starting Next Video ...");
						dlna.castData.castingPaused = 1;
						dlna.play(dlna.instance.lastIndex+1);
						// implement change video in playlist
					} else {
						// remove this line when adding playlist support
						player.setOpeningText("Playback Ended");
						$(".wcp-dlna-buttons").show(0);
						if (dlna.instance.controls) dlna.instance.controls.server.close(function() { dlna.resetGlobals(); });
					}
				}
			}
			if (status["TransportStatus"] == "ERROR_OCCURRED") {
				player.setOpeningText("Error Occurred");
				$(".wcp-dlna-buttons").show(0);
				if (dlna.instance.serverName == "SHP, UPnP/1.0, Samsung UPnP SDK/1.0" && samsungDlna.retries < 3) {
					// reconnect if samsung and the previous or next file is mkv (this is a bug from samsung)
					player.setOpeningText("Reconnecting ...");
					if (dlna.instance.controls) {
						dlna.instance.controls.removeListener('status', dlna.listeners.onStatus);
						dlna.instance.controls.removeListener('playing', dlna.listeners.onPlaying);
						dlna.instance.controls.removeListener('paused', dlna.listeners.onPaused);
					}
					if (dlna.instance.interval) {
						clearInterval(dlna.instance.interval);
						delete dlna.instance.interval;
					}
					if (samsungDlna.timeout) clearTimeout(samsungDlna.timeout);
					samsungDlna.timeout = setTimeout(function() {
						dlna.resetData(function() {
							dlna.instance.controls.stop();
							if (dlna.instance.controls.server) dlna.instance.controls.server.close(function() {
								if (dlna.instance.server) dlna.instance.server.files = [];
								dlna.prepareServer(false);
							});
							else {
								if (dlna.instance.server) dlna.instance.server.files = [];
								dlna.prepareServer(false);
							}
							samsungDlna.retries++;
						});
					},500);
				} else {
					// unknown error, close dlna server
					if (dlna.instance.controls) {
						dlna.instance.controls.removeListener('status', dlna.listeners.onStatus);
						dlna.instance.controls.removeListener('playing', dlna.listeners.onPlaying);
						dlna.instance.controls.removeListener('paused', dlna.listeners.onPaused);
					}
					if (dlna.instance.interval) {
						clearInterval(dlna.instance.interval);
						delete dlna.instance.interval;
					}
					dlna.resetData(function() { dlna.instance.controls.stop(); });
				}
			}
		},

		onPlaying: function() {
			player.setOpeningText("Streaming to TV ...");
			clearTimeout(dlna.notFoundTimer);
			$(".wcp-dlna-buttons").hide(0);
			samsungRetries = 0;
			dlna.castData.casting = 1;
			dlna.castData.castingPaused = 0;
			
			player.wrapper.find(".wcp-play").removeClass("wcp-play").addClass("wcp-pause");
			player.wrapper.find(".wcp-replay").removeClass("wcp-replay").addClass("wcp-pause");
		},
		
		onPaused: function() {
			dlna.castData.castingPaused = 1;
			player.setOpeningText("Playback Paused ...");
			
			player.wrapper.find(".wcp-pause").removeClass("wcp-pause").addClass("wcp-play");
		}
	}
	
}