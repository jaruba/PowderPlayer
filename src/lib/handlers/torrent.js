
var torrent = {
	
	prebuf: 0,
	hold: false,
	stopPrebuf: false,
	isReady: false,
	pauseCache: false,
	updatePeers: -1,
	lastPeerUpdate: 0,
	
	queues: {
		pieces: 0,
		uiUpdate: 0
	},
	
	timers: {
		peers: false,
		down: false,
		setDownload: false
	},

	saveData: function() {
		var fetchData = powGlobals.torrent.allPieces+"||";
		fetchData += $('#all-download .progress-bar').attr('data-transitiongoal');
		for (ij = 0; ij < $(".circle").length; ij++) fetchData += "|"+$($(".circle")[ij]).circleProgress('value').toString();
		return fetchData;
	},
	
	setProgress: function(val) {
		if (val == 100) {
			if ($('#all-download .progress-bar').hasClass("progress-bar-warning")) $('#all-download .progress-bar').removeClass("progress-bar-warning");
			$('#all-download .progress-bar').addClass("progress-bar-danger");
			if (load.argData.silent) setTimeout(function() { win.closeProcedure(false); },60000);
		}
		$('#all-download .progress-bar').attr('data-transitiongoal', val).progressbar();
		
		if (remote.port && remote.secret && remote.socket && remote.auth) {
			remote.socket.emit('event', { name: 'TorrentProgress', value: val });
		}
		if ($('#downloadPercent').text() != val+'%') $('#downloadPercent').text(val+'%');


	},
	
	cachePiece: async.queue(function(task, cb) {
		
		if (!powGlobals.torrent.engine) {
			torrent.queues.pieces--;
			cb();
			return;
		}
		
		if (playerApi.tempSel > -1) _currentItem = playerApi.tempSel;
		else _currentItem = player.currentItem();
		
		if (powGlobals.lists.files[task.index].lastDownload && powGlobals.lists.files[task.index].lastDownload >= 100) {
			if (powGlobals.lists.files[task.index].parts.length > 1) {
				powGlobals.lists.files[task.index].parts = [powGlobals.lists.files[task.index].pieces.first,powGlobals.lists.files[task.index].pieces.last];
				if (typeof powGlobals.lists.files[task.index].vIndex !== 'undefined' && powGlobals.lists.files[task.index].vIndex == _currentItem) {
					powGlobals.current.playingPart = 0;
				}
			}
			torrent.queues.pieces--;
			cb();
			return;
		}
		
		async.someOf(powGlobals.lists.files[task.index].parts,function(ind,spc,curItem) {
			return function(el,ij,callback) {
				if (el[0] -1 == spc) {
					if (powGlobals.lists.files[ind].parts[ij-1] && powGlobals.lists.files[ind].parts[ij-1][1] +1 == spc) {
						powGlobals.lists.files[ind].parts.splice((ij-1),2,[powGlobals.lists.files[ind].parts[ij-1][0],el[1]]);
					} else powGlobals.lists.files[ind].parts[ij][0] = spc;
				} else if (el[1] +1 == spc) {
					if (powGlobals.lists.files[ind].parts[ij+1] && powGlobals.lists.files[ind].parts[ij+1][0] -1 == spc) {
						powGlobals.lists.files[ind].parts.splice(ij,2,[el[0],powGlobals.lists.files[ind].parts[ij+1][1]]);
					} else powGlobals.lists.files[ind].parts[ij][1] = spc;
				} else if (el[0] > spc) {
					powGlobals.lists.files[ind].parts.splice(ij,0,[spc,spc]);
				} else {
					callback(false);
					return;
				}

				if (typeof powGlobals.lists.files[ind].vIndex !== 'undefined' && powGlobals.lists.files[ind].vIndex == curItem) {
			
					if (player.state() == 'stopping' && dlna.castData.casting == 1) {
						playerPos = $(".wcp-progress-seen").width()/100;
					} else {
						playerPos = player.position();
					}

					targetPos = Math.floor(((powGlobals.current.lastPiece - powGlobals.current.firstPiece) * playerPos) + powGlobals.current.firstPiece);
					if ((targetPos >= el[0] && targetPos <= el[1]) || (powGlobals.lists.files[ind].parts[ij-1] && targetPos > powGlobals.lists.files[ind].parts[ij-1][1] && targetPos < el[0])) {
						powGlobals.current.playingPart = ij;
					}
				}
				
				callback(true);
			}
		}(task.index, task.piece, _currentItem),function(ind,spc,queueCb) {
			return function(truthy) {
				if (!truthy) {
					powGlobals.lists.files[ind].parts.push([spc,spc]);
				}
				setTimeout(function() {
					torrent.queues.pieces--;
					queueCb();
				}, powGlobals.torrent.hasVideo > 0 ? torrent.queues.pieces > 100 ? 50 : torrent.queues.pieces * 30 > 200 ? 200 : torrent.queues.pieces * 30 : 0);
			}
		}(task.index,task.piece,cb));

	}, 1),
	
	showCache: function() {
		
		if (!dlna.instance.initiated) {
			if (this.pauseCache) return;
			if (['error','ended','idle'].indexOf(player.state()) > -1) {
				player.setDownloaded(0);
				clearInterval(torrent.timers.setDownload);
				return;
			}
		} else if (this.pauseCache) this.pauseCache = false;

		if (playerApi.tempSel > -1) _currentItem = playerApi.tempSel;
		else _currentItem = player.currentItem();
		
		if (powGlobals.lists.media[_currentItem] && powGlobals.lists.files[powGlobals.lists.media[_currentItem].index]) {
			target = powGlobals.lists.files[powGlobals.lists.media[_currentItem].index];
			
			if (target.lastDownload && target.lastDownload >= 100) {
				player.setDownloaded(1);
				clearInterval(torrent.timers.setDownload);
				return;
			}
			
			if (player.state() == 'stopping' && dlna.castData.casting == 1) {
				playerPos = $(".wcp-progress-seen").width()/100;
			} else {
				playerPos = player.position();
			}
			
			targetPos = Math.floor(((target.pieces.last - target.pieces.first) * playerPos) + target.pieces.first);

			if (typeof powGlobals.current.playingPart !== 'undefined' && target.parts[powGlobals.current.playingPart]) {
				part = target.parts[powGlobals.current.playingPart];
				if ((targetPos >= part[0] && targetPos <= part[1]) || (target.parts[powGlobals.current.playingPart-1] && targetPos > target.parts[powGlobals.current.playingPart-1][1] && targetPos < part[0])) {
					player.setDownloaded( (part[1] - target.pieces.first) / (target.pieces.last - target.pieces.first) );
					return;
				}
			}
									
			async.someOf(target.parts,function(tar,tarPos) {
				return function(el,ij,callback) {
					if ((tarPos >= el[0] && tarPos <= el[1]) || (tar.parts[ij-1] && tarPos > tar.parts[ij-1][1] && tarPos < el[0])) {
						player.setDownloaded( (el[1] - tar.pieces.first) / (tar.pieces.last - tar.pieces.first) );
						powGlobals.current.playingPart = ij;
						callback(true);
					} else callback(false);
				}
			}(target,targetPos),function() {});
		}
	},
	
	hideCache: function(targetPos,newPos) {
		
		if (playerApi.tempSel > -1) _currentItem = playerApi.tempSel;
		else _currentItem = player.currentItem();
		
		if ((dlna.instance.initiated || ['playing','paused','buffering'].indexOf(player.state()) > -1) && powGlobals.lists.media[_currentItem] && powGlobals.lists.files[powGlobals.lists.media[_currentItem].index]) {
			target = powGlobals.lists.files[powGlobals.lists.media[_currentItem].index];
			
			if (target.lastDownload && target.lastDownload >= 100) {
				return;
			}

			targetPos = Math.floor(((target.pieces.last - target.pieces.first) * targetPos) + target.pieces.first);
			newPos = Math.floor(((target.pieces.last - target.pieces.first) * newPos) + target.pieces.first);
			
			if (typeof powGlobals.current.playingPart !== 'undefined' && target.parts[powGlobals.current.playingPart]) {
				part = target.parts[powGlobals.current.playingPart];
				if ((targetPos >= part[0] && targetPos <= part[1]) || (target.parts[powGlobals.current.playingPart-1] && targetPos > target.parts[powGlobals.current.playingPart-1][1] && targetPos < part[0])) {
					if (!((newPos >= part[0] && newPos <= part[1]) || (target.parts[powGlobals.current.playingPart-1] && newPos > target.parts[powGlobals.current.playingPart-1][1] && newPos < part[0]))) {
						player.setDownloaded(0);
						return;
					}
				}
			}
									
			async.someOf(target.parts,function(tar,tarPos,nPos) {
				return function(el,ij,callback) {
					if ((tarPos >= el[0] && tarPos <= el[1]) || (tar.parts[ij-1] && tarPos > tar.parts[ij-1][1] && tarPos < el[0])) {
						if (!((nPos >= el[0] && nPos <= el[1]) || (tar.parts[ij-1] && nPos > tar.parts[ij-1][1] && nPos < el[0]))) {
							player.setDownloaded(0);
						} else {
							powGlobals.current.playingPart = ij;
						}
						callback(true);
					} else callback(false);
				}
			}(target,targetPos,newPos),function() {});
		}
	},
	
	checkDownloaded: async.queue(function(task, cb) {
		
		if (!powGlobals.torrent.engine) {
			torrent.queues.uiUpdate--;
			cb();
			return;
		}

		piece = task.piece;
		if (powGlobals.torrent.engine.torrent) {
			_TS = powGlobals.torrent.engine.torrent;
			powGlobals.torrent.lastDownloadTime = Math.floor(Date.now() / 1000);
			powGlobals.torrent.allPieces++;
			if (powGlobals.torrent.allPieces * _TS.pieceLength <= _TS.length) {
				_downSize = powGlobals.torrent.allPieces * _TS.pieceLength;
			} else {
				_downSize = _TS.length;
			}

			setTimeout(function(downSizeSaved) {
				return function() {
					$("#downPart").text(utils.fs.getReadableSize(Math.floor(downSizeSaved)));
				}
			}(_downSize),0);

			updDownload = Math.floor((powGlobals.torrent.allPieces / (((_TS.length - _TS.lastPieceLength) / _TS.pieceLength) +1)) *100);
			if (updDownload != powGlobals.torrent.lastDownload) {
				powGlobals.torrent.lastDownload = updDownload;
				if (updDownload >= 100) {
					torrent.setProgress(100);
					if (!win.focused) {
						win.gui.setProgressBar(-0.1);
						if (player.state() != "playing" && !win.focused && !dlna.initiated) win.gui.requestAttention(true);
					}

				} else {
					torrent.setProgress(updDownload);
					if (win.focused === false && $('#main').css("display") != "table" && powGlobals.torrent.engine && powGlobals.torrent.hasVideo == 0) {
						win.gui.setProgressBar(parseInt(updDownload)/100);
					}
				}
			}
					
			async.forEachOf(powGlobals.lists.files,function(pc) {
				return function(el,ij,callback) {

					if (pc >= el.pieces.first && pc <= el.pieces.last && pc >= 0) {
						powGlobals.lists.files[ij].pieces.downloaded = el.pieces.downloaded = el.pieces.downloaded+1;
						updDownload = Math.floor((el.pieces.downloaded / (el.pieces.last - el.pieces.first)) *100);
						if (powGlobals.lists.media[player.currentItem()] && el.vIndex == player.currentItem() && player.state() == "opening") {
							if (!playerApi.firstTime) {
								tempPrebuf = Math.floor((el.pieces.downloaded / (el.pieces.last - el.pieces.first)) *100*45);
								if (tempPrebuf <= 100 && tempPrebuf > torrent.prebuf) {
									torrent.prebuf = tempPrebuf;
									if (playerApi.loaded && !torrent.stopPrebuf) player.setOpeningText("Prebuffering "+torrent.prebuf+"%");
								} else if (tempPrebuf > 100 && !torrent.stopPrebuf) {
									if (powGlobals.lists && powGlobals.lists.media && powGlobals.lists.media[player.currentItem()] && powGlobals.lists.media[player.currentItem()].isAudio) {
										player.setOpeningText("Loading Audio");
									} else {
										player.setOpeningText("Opening Video");
									}
								}
							}
						}
						
						if (powGlobals.torrent.hasVideo > 0 && el.isMedia) {
							if (!powGlobals.lists.files[ij].parts) {
								powGlobals.lists.files[ij].parts = [];
								powGlobals.lists.files[ij].parts.push([pc,pc]);
							} else {
								torrent.queues.pieces++;
								torrent.cachePiece.push({ index: ij, piece: pc });
							}
						}
						
						if (updDownload != el.lastDownload) {
							if (powGlobals.torrent.savedData && typeof powGlobals.torrent.savedData[ij+1] !== 'undefined') {
								updDownload += parseFloat(powGlobals.torrent.savedData[ij+1])*100;
							}
							newFileSize = Math.floor(el.byteLength * (updDownload /100));
							if (newFileSize > el.byteLength) {
								_downSize = el.byteLength;
							} else {
								_downSize = el.byteLength * (updDownload /100);
							}

							setTimeout(function(ijSaved,downSizeSaved) {
								return function() {
									$("#down-fl"+ijSaved).text(utils.fs.getReadableSize(Math.floor(downSizeSaved)));
								}
							}(ij,_downSize),0);
							powGlobals.lists.files[ij].lastDownload = el.lastDownload = updDownload;
							if (updDownload >= 100) {
								
								// give some time for the file to write then declare the video as finished
								setTimeout(utils.delayer(ij,function(dln) {
									if (powGlobals.lists.files && powGlobals.lists.files[dln]) {
										powGlobals.lists.files[dln].finished = true;
										if (powGlobals.lists.files[dln].isMedia && powGlobals.lists.media[powGlobals.lists.files[dln].vIndex].isVideo) {
											if (localStorage.noSubs == "0") {
												clearTimeout(subtitles.findHashTime);
												subtitles.findHash();
											}
										}
									}
								}),20000);
								
								setTimeout(function(ijSaved) {
									return function() {
										if ($("#action"+ijSaved).hasClass("pause")) {
											$("#action"+ijSaved).removeClass("pause").addClass("settings").attr("onClick","ui.buttons.settings("+ijSaved+")");
										} else if ($("#action"+ijSaved).hasClass("play")) {
											$("#action"+ijSaved).removeClass("play").addClass("settings").attr("onClick","ui.buttons.settings("+ijSaved+")");
										}
										$('#p-file'+ijSaved).circleProgress('value', 1);
										if (powGlobals.lists.files[ijSaved].isMedia && player.itemDesc(powGlobals.lists.files[ijSaved].vIndex).mrl.indexOf('http://localhost') == 0 && !(dlna.instance && dlna.instance.initiated)) {
											
											if (powGlobals.lists.files[ijSaved].vIndex != player.currentItem()) {
												cloneData = {
													url: utils.parser(powGlobals.lists.media[powGlobals.lists.files[ijSaved].vIndex].path).webize(),
													title: player.itemDesc(powGlobals.lists.files[ijSaved].vIndex).title,
													streamLink: player.itemDesc(powGlobals.lists.files[ijSaved].vIndex).mrl
												};
												player.replaceMRL(powGlobals.lists.files[ijSaved].vIndex, cloneData);
											}

										}
									}
								}(ij),0);
							} else {
								setTimeout(function(ijSaved,updDownloadSaved) {
									return function() {
										$('#p-file'+ijSaved).circleProgress('value', updDownloadSaved/100);
									}
								}(ij,updDownload),0);
								if (localStorage.useVLC == "1") {
									if (updDownload >= 5 && !powGlobals.torrent.engine.files[el.index].selected) {
										ui.buttons.play(ij);
									} else if (updDownload < 5 && powGlobals.torrent.engine.files[el.index].selected && $("#action"+ij).hasClass("play")) {
										setTimeout(function(ijSaved) {
											return function() {
												$("#action"+ijSaved).removeClass("play").addClass("pause").css("background-color","#F6BC24").attr("onClick","ui.buttons.pause("+ijSaved+")");
											}
										}(ij),0);
									}
								}
							}
						}
					}
					callback();
				}
			}(piece),function() {
				setTimeout(function() {
					torrent.queues.uiUpdate--;
					cb();
				}, powGlobals.torrent.hasVideo > 0 ? torrent.queues.uiUpdate * 30 > 200 ? 200 : torrent.queues.uiUpdate * 30 : 0);
			});
		} else {
			torrent.queues.uiUpdate--;
			cb();
		}
	}, powGlobals.torrent.hasVideo > 0 ? 1 : 4),
	
	checkSpeed: function() {
		if ($('#all-download .progress-bar').attr('data-transitiongoal') < 100) {
			if (powGlobals.torrent.speedPiece < powGlobals.torrent.allPieces) {
				$("#speed").text(utils.fs.getReadableSize(powGlobals.torrent.engine.swarm.downloadSpeed())+"/s");
				powGlobals.torrent.speedUpdate = Math.floor(Date.now() / 1000);
			} else if (Math.floor(Date.now() / 1000) - powGlobals.torrent.speedUpdate > 9) {
				$("#speed").text("0.0 kB/s");
			}
			powGlobals.torrent.speedPiece = powGlobals.torrent.allPieces;
			downSpeed = setTimeout(function(){ torrent.checkSpeed(); }, 3000);
		} else $("#speed").text("0.0 kB/s");
	},
	
	peerCheck: function() {
		if (!torrent.isReady && powGlobals.torrent.engine.swarm.wires.length > 0) {
			powGlobals.torrent.seeds = powGlobals.torrent.engine.swarm.wires.length;
			if (playerApi.loaded) player.setOpeningText("Connected to "+powGlobals.torrent.seeds+" peers");
		}
		
		if (Date.now() - powGlobals.torrent.lastPeerUpdate > 1000) {
			powGlobals.torrent.lastPeerUpdate = Date.now();
			if (powGlobals.torrent.updatePeers != -1) clearTimeout(powGlobals.torrent.updatePeers);
			$("#nrPeers").text(powGlobals.torrent.engine.swarm.wires.length);
		} else {
			if (powGlobals.torrent.updatePeers != -1) clearTimeout(powGlobals.torrent.updatePeers);
			powGlobals.torrent.updatePeers = setTimeout(function() {
				powGlobals.torrent.lastPeerUpdate = Date.now();
				$("#nrPeers").text(powGlobals.torrent.engine.swarm.wires.length);
			},500);
		}
		
		// if more then 1 minute has past since last downloaded piece, restart peer discovery
		if (Math.floor(Date.now() / 1000) - powGlobals.torrent.lastDownloadTime > 60) {
			if ($(".pause:visible").length > 0) {
				if (powGlobals.torrent.engine && powGlobals.torrent.engine.amInterested) {
					if (player.state() != "opening") {
						powGlobals.torrent.lastDownloadTime = Math.floor(Date.now() / 1000);
						powGlobals.torrent.engine.discover();
					}
				}
			}
		}
	},
	
	announceNoPeers: function() {
		if (player.currentItem() == 0 && player.state() == "opening") {
			if (powGlobals.torrent.engine.swarm.wires.length == 0) player.setOpeningText("No Peers Found");
			setTimeout(function() { torrent.announceNoPeers(); },5000);
		}
	},
	
	engine: {
		kill: function(targetEngine) {
			targetEngine.server.close(function(dyingEngine) {
				return function() {
					dyingEngine.remove(function(deadEngine) {
						return function() {
							deadEngine.destroy(function() {
								playerApi.waitForNext = false;
							});
						}
					}(dyingEngine));
				}
			}(targetEngine));
		},
	
		start: function(targetHistory,remPlaylist,remSel) {
			if (torrent.hold) {
				torrent.hold = false;
				torrent.engine.kill(powGlobals.torrent.engine);
				return;
			}
		
			$("#filesList").css("display","block");
			
			targetHistory = typeof targetHistory !== 'undefined' ? targetHistory : 0;
			
			if (remPlaylist && remPlaylist["0"]) playerApi.playlist.saved = playerApi.playlist.integrity(remPlaylist);
			
			if (remSel && remSel > -1 && playerApi.tempSel != remSel) playerApi.tempSel = remSel;
			
			powGlobals.torrent.speedPiece = 0;
			powGlobals.torrent.speedUpdate = Math.floor(Date.now() / 1000);
			
			torrent.timers.down = setTimeout(function(){ torrent.checkSpeed(); }, 3000);
			
			$("#headerText").text(powGlobals.torrent.engine.torrent.name);
			
			var localHref = 'http://localhost:' + powGlobals.torrent.engine.server.address().port + '/'
			powGlobals.torrent.hash = powGlobals.torrent.engine.infoHash;
			powGlobals.torrent.downloaded = 0;
			powGlobals.torrent.pulse = 0;
			
			$("#downAll").text(utils.fs.getReadableSize(Math.floor(powGlobals.torrent.engine.torrent.length)));
		
			powGlobals.torrent.hasVideo = 0;
			$("#filesList").empty();
		
			powGlobals.torrent.engine.files.forEach(function(el,ij) {
				var fileStart = el.offset;
				if (el.offset > 0) fileStart++;
				var fileEnd = fileStart + el.length;
				eli = { pieces: {} };
				eli.pieces.first = Math.floor(fileStart / powGlobals.torrent.engine.torrent.pieceLength)
				eli.pieces.last = Math.floor((fileEnd -1) / powGlobals.torrent.engine.torrent.pieceLength)
				eli.pieces.downloaded = 0;
				eli.lastDownload = 0;
				eli.index = ij;
				eli.byteLength = el.length;
				eli.name = el.name;
				if (playerApi.supportedTypes.indexOf(utils.parser(eli.name).extension()) > -1 && eli.name.toLowerCase().replace("sample","") == eli.name.toLowerCase() && eli.name != "ETRG.mp4" && eli.name.toLowerCase().substr(0,5) != "rarbg") {
					eli.isMedia = true;
				} else eli.isMedia = false;
				
				powGlobals.lists.indexes[ij] = ij;
				powGlobals.lists.files[ij] = eli;
			});
			
			if (utils.parser(powGlobals.lists.files[0].name).shortSzEp()) powGlobals.lists.files = utils.sorting.episodes(powGlobals.lists.files,2);
			else powGlobals.lists.files = utils.sorting.naturalSort(powGlobals.lists.files,2);
		
			if (!playerApi.loaded) playerApi.playlist.async.addPlaylist = [];
		
			var kj = 0;
		
			if (playerApi.playlist.saved["0"]) {
				player.plugin.playlist.clear();
				if (isNaN(playerApi.playlist.saved["0"].mrl) === true) {
					while (playerApi.playlist.saved[kj.toString()] && isNaN(playerApi.playlist.saved[kj.toString()].mrl) === true && playerApi.playlist.saved[kj.toString()].mrl.toLowerCase().indexOf("pow://"+powGlobals.torrent.engine.infoHash.toLowerCase()) == -1 && playerApi.playlist.saved[kj.toString()].mrl.toLowerCase().indexOf("magnet:?xt=urn:btih:"+powGlobals.torrent.engine.infoHash.toLowerCase()) == -1) {
						var set = {
							url: playerApi.playlist.saved[kj.toString()].mrl,
							title: playerApi.playlist.saved[kj.toString()].title,
							disabled: playerApi.playlist.saved[kj.toString()].disabled
						};
						if (playerApi.playlist.saved[kj.toString()].contentType) set.contentType = playerApi.playlist.saved[kj.toString()].contentType;
		
						player.addPlaylist(set);
						
						powGlobals.lists.media[kj] = {};
						powGlobals.lists.media[kj].path = "unknown";
						powGlobals.lists.media[kj].filename = "unknown";
						kj++;
					}
				}
			}
			
			var kla = kj;
		
			if (localStorage.useVLC != "1") {
				powGlobals.lists.files.forEach(function(el,ij) {
					if (el.isMedia) {
						var thisName = el.name;
						if (!load.argData.silent) powGlobals.torrent.hasVideo++;
						if (typeof savedIj === 'undefined') savedIj = ij;
		
						powGlobals.lists.media[kj] = {};
		
						powGlobals.lists.files[ij].vIndex = kj;
						powGlobals.lists.media[kj].checkHashes = [];
						powGlobals.lists.media[kj].index = ij;
						powGlobals.lists.media[kj].filename = utils.parser(thisName).filename();

						if (playerApi.supportedVideos.indexOf(utils.parser(thisName).extension()) > -1) {
							powGlobals.lists.media[kj].isVideo = true;
						} else if (playerApi.supportedAudio.indexOf(utils.parser(thisName).extension()) > -1) {
							powGlobals.lists.media[kj].isAudio = true;
						}

						var fileStart = powGlobals.torrent.engine.files[el.index].offset;
						var fileEnd = powGlobals.torrent.engine.files[el.index].offset + powGlobals.torrent.engine.files[el.index].length;
						powGlobals.lists.media[kj].path = "" + powGlobals.torrent.engine.path + pathBreak + powGlobals.torrent.engine.files[el.index].path;
						powGlobals.lists.media[kj].byteLength = powGlobals.torrent.engine.files[el.index].length;
						if (powGlobals.torrent.hasVideo == 1) {
							var filename = utils.parser(thisName).filename();
							powGlobals.current.filename = filename;
							powGlobals.current.path = powGlobals.lists.media[kj].path;
							powGlobals.current.firstPiece = powGlobals.lists.files[ij].pieces.first;
							powGlobals.current.lastPiece = powGlobals.lists.files[ij].pieces.last;
							if (powGlobals.lists.media[kj].byteLength) powGlobals.current.byteLength = powGlobals.lists.media[kj].byteLength;
							else if (powGlobals.current.byteLength) delete powGlobals.current.byteLength;
							
		//					if (targetHistory == 0) win.gui.title = utils.parser(filename).name();
		
							if (playerApi.loaded) {
								if (powGlobals.torrent.engine.swarm.wires.length == 0) player.setOpeningText("No Peers Found");
								else player.setOpeningText("Prebuffering ...");
								setTimeout(function() { torrent.announceNoPeers(); },3000);
							}
							else playerApi.playlist.async.preBufZero = true;
							
							if (powGlobals.torrent.engine.files[el.index].offset != powGlobals.torrent.engine.server.index.offset) {
								for (as = 0; powGlobals.torrent.engine.files[powGlobals.lists.files[as].index]; as++) {
									if (powGlobals.torrent.engine.files[powGlobals.lists.files[as].index].offset == powGlobals.torrent.engine.server.index.offset) {
										powGlobals.torrent.engine.files[powGlobals.lists.files[as].index].deselect();
										break;
									}
								}
							}
		
						}
						if (targetHistory == 0) {
							if (playerApi.lastPlaylist) {
								var set = playerApi.lastPlaylist;
								set.url = localHref+el.index;
								delete playerApi.lastPlaylist;
							} else {
								var set = {
									 url: localHref+el.index,
									 title: utils.parser(el.name).name(),
									 contentType: require('mime-types').lookup(powGlobals.lists.media[el.vIndex].path)
								};
							}
							set = load.pushArgs(set);
							if (playerApi.loaded) player.addPlaylist(set);
							else playerApi.playlist.async.addPlaylist.push(set);
						}
						kj++;
					}
				});
			} else if (utils.fs.paths.vlc()) {
				var os = require('os');
				var newM3U = "#EXTM3U";
				powGlobals.lists.files.forEach(function(el,ij) {
					var thisName = el.name;
					if (el.isMedia) {
						if (newM3U == "#EXTM3U") powGlobals.torrent.engine.files[el.index].select();
						newM3U += os.EOL+"#EXTINF:0,"+utils.parser(el.name).name()+os.EOL+localHref+el.index;
					}
				});
				fs.exists(gui.App.dataPath+pathBreak+'vlc_playlist.m3u', function(exists) {
					if (exists) fs.unlink(gui.App.dataPath+pathBreak+'vlc_playlist.m3u', function() {
						fs.writeFile(gui.App.dataPath+pathBreak+'vlc_playlist.m3u', newM3U, function() {
							require('child_process').exec('"'+utils.fs.paths.vlc()+'" "'+gui.App.dataPath+pathBreak+'vlc_playlist.m3u"');
						});
					});
					else fs.writeFile(gui.App.dataPath+pathBreak+'vlc_playlist.m3u', newM3U, function() {
						require('child_process').exec('"'+utils.fs.paths.vlc()+'" "'+gui.App.dataPath+pathBreak+'vlc_playlist.m3u"');
					});
					$(window).trigger('resize');
				});
			}
			
			if (playerApi.playlist.saved[kj.toString()]) {
				if (isNaN(playerApi.playlist.saved[kj.toString()].mrl) === true) {
					while (playerApi.playlist.saved[kj.toString()]) {
						var set = {
							 url: playerApi.playlist.saved[kj.toString()].mrl,
							 title: playerApi.playlist.saved[kj.toString()].title,
							 disabled: playerApi.playlist.saved[kj.toString()].disabled
						};
						if (playerApi.playlist.saved[kj.toString()].contentType) set.contentType = playerApi.playlist.saved[kj.toString()].contentType;
						
						player.addPlaylist(set);
		
						powGlobals.lists.media[kj] = {};
						powGlobals.lists.media[kj].path = "unknown";
						powGlobals.lists.media[kj].filename = "unknown";
						kj++;
					}
				}
			}
			
			if (targetHistory != 0) {
				for (oi = 0; targetHistory.playlist[oi.toString()]; oi++) {
					if (targetHistory.playlist[oi.toString()].mrl || targetHistory.playlist[oi.toString()].mrl == 0) if (targetHistory.playlist[oi.toString()].title) {
						var set = { title: targetHistory.playlist[oi.toString()].title };
						if (targetHistory.playlist[oi.toString()].contentType) set.contentType = targetHistory.playlist[oi.toString()].contentType;
						if (!isNaN(targetHistory.playlist[oi.toString()].mrl)) set.url = localHref+targetHistory.playlist[oi.toString()].mrl;
						else set.url = targetHistory.playlist[oi.toString()].mrl;
						player.addPlaylist(set);
					}
					setTimeout(utils.delayer(targetHistory,function(dln) {
						player.playItem(dln.currentItem);
						clean = utils.parser(dln.playlist[player.currentItem()].title);
						win.title.left(clean.name());
					}),200);
				}
			}
		
			// Force Peer Discovery and Reconnection
			setTimeout(function() {
				if (powGlobals.torrent.engine) {
					powGlobals.torrent.engine.discover();
					powGlobals.torrent.engine.swarm.reconnectAll();
				}
			},1000);
			
			if (powGlobals.torrent.hasVideo == 0) {
				$("#menu-back-video").hide();
				if (playerApi.loaded) {
					player.fullscreen(false);
					player.clearPlaylist();
				} else playerApi.playlist.async.noPlaylist = true;
				if (localStorage.useVLC != "1") powGlobals.torrent.engine.server.close();
				$('#player_wrapper').css("min-height","1px").css("height","1px").css("width","1px");
				$('#inner-in-content').css("overflow-y","visible");
				win.title.left(powGlobals.torrent.engine.torrent.name);
				$(window).trigger('resize');
				setTimeout(function() { $(window).trigger('resize'); },50);
				powGlobals.torrent.pulse = 1000000; // 1 Mbps pulse for non-video torrents
				if (localStorage.pulseRule == "always" || (localStorage.pulseRule == "auto" && !win.focused)) {
					powGlobals.torrent.engine.setPulse(powGlobals.torrent.pulse);
				}
				remote.updateVal("mediaFiles",powGlobals.lists.media);
			} else $("#menu-back-video").show();
						
			$("#filesList").append($('<div style="width: 100%; height: 79px; text-align: center; line-height: 79px; font-family: \'Droid Sans Bold\'; font-size: 19px; border-bottom: 1px solid #353535; background: #4d4d4d">Scroll up to Start Video Mode</div>'));
			
			powGlobals.lists.files.forEach(function(el,ij) {
				
				setPaused = '<i id="action'+ij+'" onClick="ui.buttons.play('+ij+')" class="glyphs play hf" style="background-color: #FF704A"></i>';
				if (typeof savedIj !== 'undefined' && savedIj == ij) setPaused = '<i id="action'+ij+'" onClick="ui.buttons.pause('+ij+')" class="glyphs pause hf" style="background-color: #F6BC24"></i>';
				if (powGlobals.torrent.hasVideo == 0 && localStorage.useVLC != "1") {
					setPaused = '<i id="action'+ij+'" onClick="ui.buttons.pause('+ij+')" class="glyphs pause hf" style="background-color: #F6BC24"></i>';
					powGlobals.torrent.engine.swarm.paused = false;
					ui.buttons.play(ij);
				}
				
				if (ij%2 !== 0) backColor = '#3e3e3e';
				else backColor = '#444';
				
				$("#filesList").append($('<div class="fileHolder hf" style="background-color: '+backColor+'"><div style="width: 70px; text-align: right; position: absolute; right: 0px; font-size: 240%; margin-top: 14px; margin-right: 19px;">'+setPaused+'</div><div onClick="ui.buttons.settings('+ij+')" id="file'+ij+'" class="files" data-index="'+ij+'" style="text-align: left; padding-bottom: 8px; padding-top: 8px; width: 100%" data-color="'+backColor+'"><div id="p-file'+ij+'" class="circle"><strong></strong></div><div style="width: calc(100% - 89px); text-align: left"><span class="filenames">'+powGlobals.torrent.engine.files[el.index].name+'</span><span class="infos">Downloaded: <span id="down-fl'+ij+'">0 kB</span> / '+utils.fs.getReadableSize(powGlobals.torrent.engine.files[el.index].length)+'</span><div style="clear: both"></div></div></center></div></div>'));
		
			});
			
			$('.hf').mouseenter(function() {
				$(this).addClass('hover');
			}).mouseleave(function() {
				$(this).removeClass('hover');
			});
			
			$('.circle').circleProgress({
				value: 0,
				size: 64,
				thickness: 6,
				fill: { gradient: [['#0681c4', .5], ['#4ac5f8', .5]], gradientAngle: Math.PI / 4 }
			}).on('circle-animation-progress', function(event, progress, stepValue) {
				$(this).find('strong').html(parseInt(100 * stepValue) + '<i>%</i>');
			});
			var savePath = gui.App.dataPath+pathBreak+'interrupted'+pathBreak+powGlobals.torrent.engine.infoHash.toLowerCase();
			fs.exists(savePath, function(exists) {
				if (exists) {
					fs.readFile(savePath, {encoding: 'utf-8'}, function(err,data){
						if (!err){
							fs.unlinkSync(savePath);
							if (!powGlobals.torrent.allPieces) powGlobals.torrent.allPieces = 0;
							powGlobals.torrent.allPieces = powGlobals.torrent.allPieces + parseInt(data.split("||")[0]);
							powGlobals.torrent.savedData = data.split("||")[1].split("|");
							newDownloadVar = parseInt($('#all-download .progress-bar').attr('data-transitiongoal'))+parseInt(powGlobals.torrent.savedData[0]);
							torrent.setProgress(newDownloadVar);
							if (newDownloadVar >= 100) {
								$("#downPart").text(utils.fs.getReadableSize(Math.floor(powGlobals.torrent.engine.torrent.length)));
							} else {
								$("#downPart").text(utils.fs.getReadableSize(Math.floor(powGlobals.torrent.allPieces * powGlobals.torrent.engine.torrent.pieceLength)));
							}
							for (mij=1; typeof powGlobals.torrent.savedData[mij] !== 'undefined'; mij++) {
								if ($($(".circle")[mij-1]).length > 0) {
									newDownloadVar = parseFloat($($(".circle")[mij-1]).circleProgress('value'))+parseFloat(powGlobals.torrent.savedData[mij]);
									$($(".circle")[mij-1]).circleProgress('value',newDownloadVar);
									if (newDownloadVar >= 1) {
										$("#down-fl"+(mij-1)).text(utils.fs.getReadableSize(Math.floor(powGlobals.lists.files[mij-1].byteLength)));
										if ($("#action"+(mij-1)).hasClass("pause")) {
											$("#action"+(mij-1)).removeClass("pause").addClass("settings").attr("onClick","ui.buttons.settings("+(mij-1)+")");
										} else if ($("#action"+(mij-1)).hasClass("play")) {
											$("#action"+(mij-1)).removeClass("play").addClass("settings").attr("onClick","ui.buttons.settings("+(mij-1)+")");
										}
									} else {
										$("#down-fl"+(mij-1)).text(utils.fs.getReadableSize(Math.floor(powGlobals.lists.files[mij-1].byteLength * (newDownloadVar /100))));
									}
								}
							}
						}
					
					});
				}
			});
			if (powGlobals.torrent.hasVideo == 0 && localStorage.useVLC != "1") {
				// reselect all files
				setTimeout(function() {
					powGlobals.torrent.engine.files.forEach(function(el) {
						el.select();
					});
				},1000);
			}
			
			if (playerApi.playlist.saved["0"]) {
				if (typeof kla !== 'undefined') playerApi.nextPlay += kla;
				if (player.state() == "error") player.stop(true);
				if (dlna.params.nextStartDlna == 1) {
					dlna.params.nextStartDlna = 0;
					dlna.instance.initiated = true;
					player.setOpeningText("Starting DLNA Server ...");
					if (powGlobals.torrent.hasVideo > 1) dlna.play(playerApi.nextPlay);
					else {
						if (playerApi.waitForNext && playerApi.tempSel > -1) dlna.play(playerApi.tempSel);
						else dlna.play(playerApi.nextPlay);
					}
				} else {
					if (powGlobals.torrent.hasVideo > 1) player.playItem(nextPlay);
					else {
						if (playerApi.waitForNext && playerApi.tempSel > -1) player.playItem(playerApi.tempSel);
						else player.playItem(playerApi.nextPlay);
					}
				}
				playerApi.nextPlay = 0;
				playerApi.playlist.saved = {};
			}
			
			if (load.autoPlay) {
				load.autoPlay = false;
				player.playItem(0);
			}
		},

	
	},
	
	flood: {
			
		pause: function() {
			if (powGlobals.torrent.engine && powGlobals.torrent.pulse && ["always","auto"].indexOf(localStorage.pulseRule) > -1) {
				powGlobals.torrent.engine.setPulse(powGlobals.torrent.pulse);
			}
		},
		
		start: function() {
			if (powGlobals.torrent.engine && powGlobals.torrent.pulse) {
				if (localStorage.pulseRule == "auto" && !win.focused) powGlobals.torrent.engine.flood();
				else if (localStorage.pulseRule == "always") powGlobals.torrent.engine.flood();
			}
		}
		
	}
}

var onmagnet = function () { torrent.peerCheck(); }
