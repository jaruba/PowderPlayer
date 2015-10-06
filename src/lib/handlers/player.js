
var playerApi = {
	
	supportedTypes: ["mkv", "avi", "mp4", "mpg", "mpeg", "webm", "flv", "ogg", "ogv", "mov", "wmv", "3gp", "3g2", "m4a", "mp3", "flac"],
	supportedVideos: ["mkv", "avi", "mp4", "mpg", "mpeg", "webm", "flv", "ogg", "ogv", "mov", "wmv", "3gp", "3g2"],
	supportedAudio: ["m4a", "mp3", "flac"],
	firstTimeEver: true,
	firstTime: false,
	firstSize: true,
	doSubsLocal: false,
	loaded: false,
	savedHistory: false,
	lastItem: 0,
	lastState: "",
	waitForNext: false,
	nextPlay: 0,
	tempSel: -1,
	
	init: function() {
		setTimeout(function() {
			player = new wcp("#player_wrapper").addPlayer({ autoplay: 1, progressCache: 1, pausePolicy: localStorage.clickPause });
			player.onPlaying(playerApi.listeners.isPlaying);
			player.onOpening(playerApi.listeners.isOpening);
			player.onPosition(playerApi.listeners.changedPosition);
			player.onTime(function (ms) {
				if (remote.port && remote.secret && remote.socket) remote.socket.emit('event', { name: 'Time', value: ms });
			});
			player.onPaused(function() {
				if (remote.port && remote.secret && remote.socket) remote.socket.emit('event', { name: 'Paused' });
			});
			player.onState(playerApi.listeners.changedState);
			player.onError(playerApi.listeners.handleErrors);
			player.onFrameSetup(playerApi.listeners.gotVideoSize);
			player.onMediaChanged(function() {
				if (remote.port && remote.secret && remote.socket) remote.socket.emit('event', { name: 'MediaChanged', value: player.currentItem() });
				if (powGlobals.current.playingPart) delete powGlobals.current.playingPart;
				// reset checked items in context menu
				ctxMenu.reset([4,5,6]);
			});
			
			player.onEnded(function() {
				if (remote.port && remote.secret && remote.socket) remote.socket.emit('event', { name: 'Ended' });
				if (torrent.timers.setDownload) clearInterval(torrent.timers.setDownload);
				ctxMenu.disable();
			});
			player.onStopped(function() {
				if (remote.port && remote.secret && remote.socket) remote.socket.emit('event', { name: 'Stopped' });
				if (torrent.timers.setDownload) clearInterval(torrent.timers.setDownload);
				ctxMenu.disable();
			});
			
			dlna.attachHandlers();
			
			playerApi.loaded = true;
			
			load.args();

		},1);
	},
	
	isYoutube: function(plItem) {
		// detect if playlist item is a youtube link
		if (player.vlc.playlist.items[plItem].mrl.indexOf("googlevideo.com") > -1 || player.vlc.playlist.items[plItem].mrl.indexOf("youtube.com/watch") > -1) return true;
		else return false;
	},

	listeners: {
		
		isPlaying: function() {
			if (remote.port && remote.secret && remote.socket) remote.socket.emit('event', { name: 'Playing' });
			if (playerApi.waitForNext) {
				playerApi.waitForNext = false;
				playerApi.nextPlay = 0;
		//		if (player.zoom() == 0) player.zoom(1);
				if (player.length()) player.find(".wcp-time-total").text(" / "+player.parseTime(player.length()));
			}
			if (!allowScrollHotkeys) setTimeout(function() { allowScrollHotkeys = true; },1000);
			clearTimeout(frameTimer);
			frameHidden = false;
			if (playerApi.doSubsLocal && typeof powGlobals.torrent.engine === 'undefined') {
				player.setDownloaded(0);
				playerApi.doSubsLocal = false;
				if (powGlobals.lists.media[player.currentItem()] && powGlobals.lists.media[player.currentItem()].isVideo) {
					if (localStorage.noSubs == "0") {
						clearTimeout(subtitles.findHashTime);
						subtitles.findHash();
					}
				}
			}
			if (!playerApi.firstTime && win.focused === false && !player.fullscreen()) win.gui.requestAttention(true);
			if (!playerApi.firstTime) {
				player.vlc.playlist.mode = 1;
				if (playerApi.tempSel > -1) playerApi.tempSel = -1;
				if (typeof powGlobals.current.duration !== 'undefined') player.setTotalLength(powGlobals.current.duration);
				playerApi.firstTime = true;
				player.vlc.subtitles.track = 0;
				
				ctxMenu.refresh(); // refresh context menu
				
				if (powGlobals.torrent.engine && player.length() > 0 && powGlobals.lists.media[player.currentItem()] && powGlobals.lists.media[player.currentItem()].byteLength) {
					powGlobals.torrent.pulse = Math.round(powGlobals.lists.media[player.currentItem()].byteLength / (player.length() /1000) *2);
					if (localStorage.pulseRule == "always" || (localStorage.pulseRule == "auto" && !win.focused)) {
						powGlobals.torrent.engine.setPulse(powGlobals.torrent.pulse);
					}
				}
			}
			if (playerApi.firstTimeEver) {
				playerApi.firstTimeEver = false;
				if (typeof localStorage.savedVolume !== 'undefined') setTimeout(function() { player.volume(localStorage.savedVolume); },100);
				setTimeout(function() { player.onVolume(function() { if (player.volume() > 0) localStorage.savedVolume = player.volume(); }); },101);
				if (!player.fullscreen()) {
					if (player.width() == 0 && player.height() == 0) playerApi.firstTimeEver = true;
					else if (playerApi.isYoutube(0)) setTimeout(function() { player.refreshPlaylist(); },500); // fix youtube playlist titles
				}
				remote.updateVal("fullscreen",player.fullscreen());
			}
		//	if (playerApi.isYoutube(player.currentItem()) && win.gui.title != player.vlc.playlist.items[player.currentItem()].title.replace("[custom]","")) win.gui.title = player.vlc.playlist.items[player.currentItem()].title.replace("[custom]","");
			if ($("#inner-in-content").css("overflow-y") == "visible" || $("#inner-in-content").css("overflow-y") == "auto") $("#inner-in-content").animate({ scrollTop: 0 }, 'slow');
		},
		
		gotVideoSize: function(width,height) {
			if (playerApi.firstSize) {
				playerApi.firstSize = false;
				win.gui.setTransparent(false);
				win.position.resizeInBounds((player.width() + 12),(player.height() + 40));
				win.gui.setTransparent(true);
				remHeight = player.height() + 40;
				remote.updateVal("width",player.width())
                      .updateVal("height",player.height())
                      .updateVal("fps",player.fps())
                      .updateVal("subCount",player.subCount())
                      .updateVal("audioCount",player.audioCount());
			}
		},
		
		handleErrors: function() {
			if (remote.port && remote.secret && remote.socket) remote.socket.emit('event', { name: 'Error' });
			ctxMenu.disable();
		},
		
		isOpening: function() {
			if (torrent.timers.setDownload) clearInterval(torrent.timers.setDownload);
			if (powGlobals.torrent.engine) {
				if (powGlobals.lists.media[player.currentItem()] && powGlobals.lists.files[powGlobals.lists.media[player.currentItem()].index]) {
					if (powGlobals.lists.files[powGlobals.lists.media[player.currentItem()].index].lastDownload) {
						if (powGlobals.lists.files[powGlobals.lists.media[player.currentItem()].index].lastDownload < 100) {
							torrent.timers.setDownload = setInterval(function() { torrent.showCache(); },3000);
						}
					} else {
						torrent.timers.setDownload = setInterval(function() { torrent.showCache(); },3000);
					}
				}
			}
			if (remote.port && remote.secret && remote.socket) remote.socket.emit('event', { name: 'Opening' });
			if (playerApi.waitForNext && playerApi.tempSel != player.currentItem()) {
				player.stop(true);
				return;
			}
			if (powGlobals.lists.currentIndex != player.currentItem() && !playerApi.waitForNext) {
				if (dlna.castData.casting) dlna.stop();
				if (player.vlc.playlist.items[player.currentItem()].mrl.indexOf("pow://") == 0 || player.vlc.playlist.items[player.currentItem()].mrl.indexOf("magnet:?xt=urn:btih:") == 0) {
					if (playerApi.savedPlaylists) {
						if (playerApi.lastPlaylist) delete playerApi.lastPlaylist;
						playerApi.savedPlaylists.forEach(function(el,ij) {
							if (el.url == player.vlc.playlist.items[player.currentItem()].mrl) {
								playerApi.lastPlaylist = el;
							}
						});
					}
					player.vlc.playlist.mode = 0;
					player.find(".wcp-status").text("");
					player.stop(true);
					playerApi.waitForNext = true;
					playerApi.tempSel = player.currentItem();
					player.refreshPlaylist();
					
					if (player.vlc.playlist.items[player.currentItem()].mrl.indexOf("pow://") == 0) {
						nextTorrent = "magnet:?xt=urn:btih:"+player.vlc.playlist.items[player.currentItem()].mrl.replace("pow://","");
						if (nextTorrent.indexOf("/") > -1 && isNaN(nextTorrent.split("/")[1]) === false) {
							nextTorrent = nextTorrent.split("/")[0];
						}
					} else nextTorrent = player.vlc.playlist.items[player.currentItem()].mrl;
					playerApi.playlist.saved = playerApi.playlist.retrieve();
					for (ijk = 0; ijk < player.itemCount(); ijk++) {
						if (isNaN(playerApi.playlist.saved[ijk.toString()].mrl) === false) {
							playerApi.playlist.saved[ijk.toString()].mrl = "pow://"+powGlobals.torrent.engine.infoHash+"/"+playerApi.playlist.saved[ijk.toString()].mrl;
						}
					}
					player.setDownloaded(0);
					ui.goto.mainMenu(nextTorrent);
					return;
				} else {
					win.title.left(player.itemDesc(player.currentItem()).title);
				}
				delete powGlobals.current.duration;
				delete powGlobals.current.fileHash;
				playerApi.savedHistory = false;
				powGlobals.lists.currentIndex = player.currentItem();
				if (powGlobals.torrent.engine) {
					if (player.vlc && !load.argData.dlna) player.setOpeningText("Prebuffering ...");
					if (typeof powGlobals.lists.media[player.currentItem()] !== 'undefined' && typeof powGlobals.lists.media[player.currentItem()].local === 'undefined') {
						powGlobals.lists.files.some(function(el,ij) {
							if (ij == powGlobals.lists.media[player.currentItem()].index) {
								ui.buttons.play(ij);
								return true;
							}
						});
					}
		//			if (powGlobals.lists.media[player.currentItem()]) {
		//				win.gui.title = utils.parser(powGlobals.lists.media[player.currentItem()].filename).name();
		//			}
					player.setDownloaded(0);
					
					if (powGlobals.lists.media && powGlobals.lists.media[player.currentItem()]) {
						powGlobals.current.filename = powGlobals.lists.media[player.currentItem()].filename;
						powGlobals.current.path = powGlobals.lists.media[player.currentItem()].path;
						if (typeof powGlobals.lists.media[player.currentItem()].byteLength !== 'undefined') {
							powGlobals.current.byteLength = powGlobals.lists.media[player.currentItem()].byteLength;
						} else {
							if (powGlobals.current.byteLength) delete powGlobals.current.byteLength;
						}
						if (typeof powGlobals.lists.media[player.currentItem()].local === 'undefined') {
							curIndex = powGlobals.lists.media[player.currentItem()].index;
							powGlobals.current.firstPiece = powGlobals.lists.files[curIndex].pieces.first;
							powGlobals.current.lastPiece = powGlobals.lists.files[curIndex].pieces.last;
						}
					} else {
						var fetchItem = player.currentItem(),
							fetchMRL = player.itemDesc(fetchItem).mrl;
		
						if (!powGlobals.lists.media) powGlobals.lists.media = [];
						
						powGlobals.current.filename = utils.parser(fetchMRL).filename();
						powGlobals.current.path = utils.parser(fetchMRL).deWebize();
		
						powGlobals.lists.media[fetchItem] = {};
						powGlobals.lists.media[fetchItem].filename = powGlobals.current.filename;
						powGlobals.lists.media[fetchItem].path = powGlobals.current.path;
						if (fetchMRL.indexOf("file:///") > -1) powGlobals.lists.media[fetchItem].local = 1;
						powGlobals.lists.media[fetchItem].byteLength = utils.fs.size(powGlobals.lists.media[fetchItem].path);
		//				win.gui.title = utils.parser(powGlobals.lists.media[fetchItem].filename).name();
						torrent.hold = true;
						playerApi.tempSel = fetchItem;
						player.refreshPlaylist();
					}
					playerApi.firstTime = false;
					
					if (powGlobals.lists.media[player.currentItem()] && powGlobals.lists.media[player.currentItem()].isVideo) {
						if (localStorage.noSubs == "0") {
							utils.checkInternet(function(isConnected) {
								if (isConnected && powGlobals.current.byteLength) $.ajax({ type: 'GET', url: window.atob("aHR0cDovL3Bvd2Rlci5tZWRpYS9tZXRhRGF0YS9nZXQucGhwP2Y9")+encodeURIComponent(powGlobals.current.filename)+window.atob("Jmg9")+encodeURIComponent(powGlobals.current.hash)+window.atob("JnM9")+encodeURIComponent(powGlobals.current.byteLength), global: false, cache: false, success: subtitles.readData });
							});
						}
					}
				} else {
					if (player.vlc && !load.argData.dlna) player.setOpeningText("Loading resource");
					if (player.currentItem() > -1 && powGlobals.lists.media) {
		//				if (!playerApi.isYoutube(player.currentItem())) {
		//					win.gui.title = new parser(powGlobals.lists.media[player.currentItem()].filename).name(); // if not youtube, set window title
		//				}
						powGlobals.current.filename = powGlobals.lists.media[player.currentItem()].filename;
						powGlobals.current.path = powGlobals.lists.media[player.currentItem()].path;
						playerApi.doSubsLocal = true;
					}
				}
			}
			if (load.argData.dlna) {
				delete load.argData.dlna;
				dlna.findClient();
			}
		},
		
		changedPosition: function(position) {
			if (torrent.pauseCache) {
				torrent.pauseCache = false;
			}
			if (remote.port && remote.secret && remote.socket) remote.socket.emit('event', { name: 'Position', value: position });
			// start downloading next episode after watching more then 70% of a video
			if (position > 0.7) {
				if (player.currentItem() < (player.itemCount() -1)) {
					if (typeof powGlobals.lists.media[player.currentItem()+1] !== 'undefined' && typeof powGlobals.lists.media[player.currentItem()+1].local === 'undefined') {
						powGlobals.lists.files.some(function(el,ij) {
							if (ij == powGlobals.lists.media[player.currentItem()+1].index) {
								ui.buttons.play(ij);
								return false;
							}
						});
					}
				}
				
			}
			if (position > 0.7 && !playerApi.savedHistory) {
				playerApi.savedHistory = true;
				historyObject = JSON.parse(localStorage.history);
				isSafe = 1;
				for (oi = 0; historyObject[oi.toString()]; oi++) { if (historyObject[oi.toString()].title == player.vlc.playlist.items[player.currentItem()].title.replace("[custom]","")) isSafe = 0; }
				if (isSafe == 1) {
					for (oii = oi; oii > 0; oii--) if (historyObject[(oii -1).toString()]) historyObject[oii.toString()] = historyObject[(oii -1).toString()];
					historyObject["0"] = {};
					if (powGlobals.torrent.engine) {
						historyObject["0"].infoHash = powGlobals.torrent.engine.infoHash;
					}
					historyObject["0"].currentItem = player.currentItem();
					historyObject["0"].title = player.vlc.playlist.items[player.currentItem()].title.replace("[custom]","");
					historyObject["0"].playlist = playerApi.playlist.retrieve();
					for (oi = 0; historyObject[oi.toString()]; oi++) { if (oi > 19) delete historyObject[oi.toString()]; }
					localStorage.history = JSON.stringify(historyObject);
				}
			}
		},
		
		changedState: function() {
			if (player.state() != playerApi.lastState) {
				if (remote.port && remote.secret && remote.socket) remote.socket.emit('event', { name: 'State', value: player.state() });
		
				// detect unsupported media types
				if ((["opening","playing",""].indexOf(playerApi.lastState) > -1) && (player.state() == "ended" && player.itemCount() == 1 && playerApi.firstTimeEver) && (!playerApi.isYoutube(player.currentItem()))) {
					ui.goto.mainMenu();
					$("#open-unsupported").trigger("click");
				}
		
				if (player.state() == "opening") playerApi.lastItem = player.currentItem();
				else if (playerApi.lastState == "opening" && player.state() == "ended") {
					if (powGlobals.torrent.engine) {
						if (player.vlc.playlist.items[playerApi.lastItem].mrl.substr(0,17) == "http://localhost:") {
							player.replaceMRL(playerApi.lastItem,{
								url: utils.parser(powGlobals.lists.media[playerApi.lastItem].path).webize(),
								title: player.itemDesc(playerApi.lastItem).title
							});
							setTimeout(function() { player.playItem(playerApi.lastItem); },1000);
						}
					}
				}
				playerApi.lastState = player.state();
			}
		}
	},

	playlist: {
		
		saved: {},
		correct: {},
		async: {
			noPlaylist: false
		},

		retrieve: function() {
			var plObject = {};
			for (ijk = 0; ijk < player.itemCount(); ijk++) {
				plObject[ijk.toString()] = {};
				plObject[ijk.toString()].title = player.vlc.playlist.items[ijk].title.replace("[custom]","");
				plObject[ijk.toString()].disabled = player.vlc.playlist.items[ijk].disabled;
				if (powGlobals.torrent.engine && powGlobals.lists.media[ijk] && powGlobals.lists.media[ijk].path) {
					plObject[ijk.toString()].contentType = require('mime-types').lookup(powGlobals.lists.media[ijk].path);
				}
				if (player.vlc.playlist.items[ijk].mrl.substr(0,17) == "http://localhost:" && isNaN(utils.parser(player.vlc.playlist.items[ijk].mrl).filename()) === false) {
					plObject[ijk.toString()].mrl = parseInt(utils.parser(player.vlc.playlist.items[ijk].mrl).filename());
				} else {
					plObject[ijk.toString()].mrl = player.vlc.playlist.items[ijk].mrl;
				}
			}
			if (!playerApi.playlist.correct["0"]) playerApi.playlist.correct = plObject;
			return plObject;
		},
	
		integrity: function(remPlaylist) {
			var integrity = true;
			var allTitles = [],
				allMRLs = [],
				allHashes = [],
				kj = 0;
			
			while (remPlaylist[kj.toString()]) {
				var thisHash = false;
				if (remPlaylist[kj.toString()].mrl.indexOf("pow://") == 0) {
					thisHash = remPlaylist[kj.toString()].mrl.replace("pow://","").toLowerCase();
					if (thisHash.indexOf("/") > -1) thisHash = thisHash.substr(0,thisHash.indexOf("/"));
				}
				if (kj == 0 || (allTitles.indexOf(remPlaylist[kj.toString()].title) == -1 && allMRLs.indexOf(remPlaylist[kj.toString()].mrl) == -1)) {
					if (thisHash && allHashes.length == 0) allHashes.push(thisHash);
					else {
						if (thisHash && allHashes.indexOf(thisHash) == -1) allHashes.push(thisHash);
						else {
							integrity = false;
							break;
						}
					}
					allTitles.push(remPlaylist[kj.toString()].title);
					allMRLs.push(remPlaylist[kj.toString()].mrl); 
				} else {
					integrity = false;
					break;
				}
				kj++;
			}
			if (integrity) {
				playerApi.playlist.correct = remPlaylist;
				return remPlaylist;
			} else {
				if (playerApi.playlist.correct["0"]) return playerApi.playlist.correct;
				else return playerApi.playlist.saved;
			}
		},
	}

}
