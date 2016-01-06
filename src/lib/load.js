/*****************************************************************************
* Copyright (c) 2015 Branza Victor-Alexandru <branza.alex[at]gmail.com>
*
* This program is free software; you can redistribute it and/or modify it
* under the terms of the GNU Lesser General Public License as published by
* the Free Software Foundation; either version 2.1 of the License, or
* (at your option) any later version.
*
* This program is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
* GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License
* along with this program; if not, write to the Free Software Foundation,
* Inc., 51 Franklin Street, Fifth Floor, Boston MA 02110-1301, USA.
*****************************************************************************/

var load = {
	
	autoPlay: false,
	argData: {},
	_setOnlyFirst: 0,
	_peerflix: require('peerflix'),
	
	pushArgs: function(set) {
		if (!$.isEmptyObject(load.argData)) {
			if (load.argData.title) {
				set.title = load.argData.title;
				delete load.argData.title;
			}
			if (load.argData.subFile) {
				set.defaultSub = "Custom Subtitle";
				set.subtitles = { "Custom Subtitle": load.argData.subFile };
				delete load.argData.subFile;
			}
		}
		return set;
	},
	
	args: function() {
		if (gui.App.argv.length > 0) {
			$('#main').css("display","none");
			$('#player_wrapper').css("min-height","100%").css("height","100%").css("width","auto");
			
			if (!$("#open-url").hasClass("dark-add-url")) {
				$("#magnetSubmit").text("Add");
				$("#open-url").addClass("dark-add-url");
			}
			
			if (playerApi.playlist.async.preBufZero) player.setOpeningText("Prebuffering ...");
			if (playerApi.playlist.async.addPlaylist && playerApi.playlist.async.addPlaylist.length > 0 && playerApi.playlist.async.noPlaylist === false) {
				playerApi.playlist.async.addPlaylist.forEach(function(e) { player.addPlaylist(e); });
			}
			
			if (playerApi.playlist.async.loadLocal) {
				player.setOpeningText("Loading resource");
				player.playItem(0);
			}
	
			playerApi.playlist.async = {};
	
			$("#loading").hide(0);
		}
	},
	
	url: function(torLink,noAutoStart,direct) {
		
		// let's find out what type of link we're dealing with
		if (typeof direct === 'undefined') {

			// convert pow protocol to magnet link
			if (torLink.toLowerCase().match(/pow:\?xt=urn:btih:[a-z0-9]{20,50}/i) != null) {
				torLink = torLink.replace('pow:','magnet:');
			} else if (torLink.toLowerCase().substr(0,6) == 'pow://') {
				torLink = torLink.replace('pow://','magnet:?xt=urn:btih:');
			}

			if (torLink.toLowerCase().replace(".torrent","") != torLink.toLowerCase()) {
				// torrent file
				load.url(torLink,undefined,'torrent');
			} else if (torLink.toLowerCase().match(/magnet:\?xt=urn:btih:[a-z0-9]{20,50}/i) != null || torLink.toLowerCase().match(/magnet:\?xt=urn:sha1:[a-z0-9]{20,50}/i) != null) {
				// magnet link
				load.url(torLink,undefined,'magnet');
			} else {
				// not a torrent, let's find out what you are
				if (torLink.startsWith('http') && new RegExp(playerApi.supportedLinks.join("|")).test(torLink)) {
					// a VLC supported external link
					load.url(torLink,undefined,'media');
				} else if (torLink.indexOf('.') > -1 && playerApi.supportedTypes.indexOf(torLink.split('.').pop().toLowerCase()) > -1) {
					// a known video or audio file
					load.url(torLink,undefined,'media');
				} else {
					// we got no idea what it is
					// so we're gonna read the headers
					if (!plugins['powder-multipass']) load.url(torLink,undefined,'media');
					else plugins['powder-multipass'].load(torLink);
				}
			}
			return;

		} else {
		
			if ($('#main').css("display") == "table") {
					
				if (direct == 'torrent') {
					var readTorrent = require('read-torrent');
					
					readTorrent(utils.validateUrl(torLink), function(err, torrent) { load.torrent(torrent); });
				} else if (direct == 'magnet') {				
					load.torrent(utils.validateUrl(torLink));
				} else if (direct == 'media') {
					
					$("#filesList").css("display","none");
					$('#main').css("display","none");
					$('#player_wrapper').css("min-height","100%").css("height","100%").css("width","auto");
		
					if (!$("#open-url").hasClass("dark-add-url")) {
						$("#magnetSubmit").text("Add");
						$("#open-url").addClass("dark-add-url");
					}
		
					if (player) {
						player.showSplashScreen();
						player.wrapper.find(".wcp-subtitle-text").text("");
						player.wrapper.find(".wcp-subtitle-but").hide(0);
					}
				
					load.playlistItem(torLink);
	
					if (this._setOnlyFirst == 2) this._setOnlyFirst = 1;
				}
			
				if (playerApi.loaded) {
					player.setOpeningText("Loading resource");
					if (typeof noAutoStart === 'undefined') player.playItem(0);
				} else playerApi.playlist.async.loadLocal = true;
			
				win.gui.setMinimumSize(372, 210);
				
				$("#header_container").show();
				
			} else {
				if (['torrent','magnet'].indexOf(direct) > -1) {

					var readTorrent = require('read-torrent');
					
					readTorrent(utils.validateUrl(torLink), function(err, data) {
						
						var set = {
							url: "pow://"+data.infoHash,
							title: utils.parser(data.name).name()
						};
	
						player.addPlaylist(set);
		
					});
				} else if (direct == 'media') load.playlistItem(torLink);
			}
		}
		
	},
	
	multiple: function(fileArray) {
		this._setOnlyFirst = 2;
		if (utils.parser(fileArray[0]).shortSzEp()) fileArray = utils.sorting.episodes(fileArray);
		else fileArray = utils.sorting.naturalSort(fileArray);
		
		ranURL = false;
		if (!powGlobals.lists.media) powGlobals.lists.media = [];
		keepMedia = powGlobals.lists.media;
		fileArray.forEach(function(el) {
			if (utils.parser(el).extension() == 'torrent') {
				var readTorrent = require('read-torrent');
					
				readTorrent(el, function(err, data) {
					var set = {
						url: "pow://"+data.infoHash,
						title: utils.parser(data.name).name()
					};
					set = load.pushArgs(set);
					player.addPlaylist(set);
				});
			} else {
				ranURL = true;
				load.url(el);
			}
		});
		powGlobals.lists.media = keepMedia;
		fileArray.forEach(function(e) {
			ij = powGlobals.lists.length;
			powGlobals.lists.media[ij] = {};
			if (utils.parser(e).extension() == 'torrent') {
				powGlobals.lists.media[ij].filename = "unknown";
				powGlobals.lists.media[ij].path = "unknown";
			} else {
				powGlobals.lists.media[ij].filename = utils.parser(e).filename();
				powGlobals.lists.media[ij].path = e;
				powGlobals.lists.media[ij].byteLength = utils.fs.size(e);
				
				if (e.indexOf("://") == -1) powGlobals.lists.media[ij].local = 1;
						
				if (playerApi.supportedVideos.indexOf(utils.parser(e).extension()) > -1) {
					powGlobals.lists.media[ij].isVideo = true;
				} else if (playerApi.supportedAudio.indexOf(utils.parser(e).extension()) > -1) {
					powGlobals.lists.media[ij].isAudio = true;
				}
		
			}
		});
		if (!ranURL) player.playItem(0);
		$('#main').css("display","none");
		$('#player_wrapper').css("min-height","100%").css("height","100%").css("width","auto");
		if (!$("#open-url").hasClass("dark-add-url")) {
			$("#magnetSubmit").text("Add");
			$("#open-url").addClass("dark-add-url");
		}
		this._setOnlyFirst = 0;
		
		return false;
	},
	
	directory: function(dir) {
		fs.readdir(dir,function(rootPath) {
			return function(err,files){
				if(err) throw err;
				for (var i = 0; i < files.length; i++) {
					fullPath = rootPath + pathBreak + files[i];
					if (fs.lstatSync(fullPath).isDirectory()) {
						load.directory(fullPath);
						files.splice(i,1);
						i--;
					} else if (playerApi.supportedTypes.indexOf(utils.parser(files[i]).extension()) > -1) {
						files[i] = fullPath;
					} else {
						files.splice(i,1);
						i--;
					}
				}
				if (files.length) load.multiple(files);
			}
		}(dir));
	},
	
	dropped: function(devFiles) {
		var newFiles = [];
		for (var i = 0; i < devFiles.length; ++i) {
			if (fs.lstatSync(devFiles[i].path).isDirectory()) {
				load.directory(devFiles[i].path);
			} else newFiles.push(devFiles[i].path);
		}
		if (newFiles.length) load.multiple(newFiles);
	},
	
	torrent: function(torLink,isHistory) {
		
		if (typeof torLink === 'string') {
			// convert pow protocol to magnet link
			if (torLink.toLowerCase().match(/pow:\?xt=urn:btih:[a-z0-9]{20,50}/i) != null) {
				torLink = torLink.replace('pow:','magnet:');
			} else if (torLink.toLowerCase().substr(0,6) == 'pow://') {
				torLink = torLink.replace('pow://','magnet:?xt=urn:btih:');
			}
		}

		if ($('#main').css("display") == "table") {
			$('#filesList').css("display","none");
			$('#main').css("display","none");
			$('#player_wrapper').css("min-height","100%").css("height","100%").css("width","auto");
			
			if (!$("#open-url").hasClass("dark-add-url")) {
				$("#magnetSubmit").text("Add");
				$("#open-url").addClass("dark-add-url");
			}
			
			if (player) {
				player.showSplashScreen();
				player.wrapper.find(".wcp-subtitle-text").text("");
				player.wrapper.find(".wcp-subtitle-but").hide(0);
			}
			load.autoPlay = true;
		}
		
		isHistory = typeof isHistory !== 'undefined' ? isHistory : false;
		
		if (isHistory) {
			targetHistory = torLink;
			torLink = "magnet:?xt=urn:btih:"+torLink.infoHash;
			powGlobals.lists.media = [];
			powGlobals.lists.indexes = [];
			powGlobals.lists.files = [];
		}
		powGlobals.torrent.allPieces = 0;
		powGlobals.torrent.lastDownload = 0;
		powGlobals.torrent.lastDownloadTime = Math.floor(Date.now() / 1000);
		
		torrent.prebuf = 0;
		
		// reset values in Torrent Data mode
		$('.progress .progress-bar').removeClass("progress-bar-danger").addClass("progress-bar-warning").attr('data-transitiongoal', 0).progressbar({display_text: 'center'});
		$('#downPart').text("0 kB");
		$('#downAll').text("0 kB");
		$('#speed').text("0.0 kB/s");
		$('#nrPeers').text("0");
		// end reset values in Torrent Data mode
		
		if (typeof torLink !== 'undefined' && (typeof torLink === 'object' || Buffer.isBuffer(torLink) || torLink.toLowerCase().match(/magnet:\?xt=urn:sha1:[a-z0-9]{20,50}/i) != null || torLink.toLowerCase().match(/magnet:\?xt=urn:btih:[a-z0-9]{20,50}/i) != null || utils.parser(torLink).extension() == "torrent")) {
		
			if (typeof torLink !== 'object' && Buffer.isBuffer(torLink) === false && utils.parser(torLink).extension() == "torrent") torLink = fs.readFileSync(torLink);
			
			// load the torrent with peerflix
			var opts = { connections: localStorage.maxPeers, trackers: ['udp://tracker.openbittorrent.com:80', 'udp://tracker.publicbt.com:80', 'udp://tracker.istole.it:6969', 'udp://open.demonii.com:1337' ] };
			if (localStorage.peerPort != 6881) opts.port = localStorage.peerPort;
			if (localStorage.tmpDir != 'Temp') opts.path = localStorage.tmpDir;
			
			powGlobals.torrent.engine = this._peerflix(torLink,opts);
							
			powGlobals.torrent.engine.swarm.on('wire', onmagnet);
			torrent.timers.peers = setInterval(function(){ torrent.peerCheck() }, 2000);
			
			if (!isHistory) powGlobals.torrent.engine.server.on('listening', function(remSel,remPlaylist,remEngine) {
				return function() {
					if (playerApi.tempSel != remSel) {
						torrent.engine.kill(remEngine);
						return;
					}
					powGlobals.torrent.engine = remEngine;
					if (remPlaylist["0"]) torrent.engine.start(0,remPlaylist,remSel);
					else torrent.engine.start();
					powGlobals.torrent.serverReady = 1;
				}
			}(playerApi.tempSel,playerApi.playlist.saved,powGlobals.torrent.engine));
			else if (isHistory) powGlobals.torrent.engine.server.on('listening', function(remSel,remHistory,remEngine) {
				return function() {
					if (playerApi.tempSel != remSel) {
						torrent.engine.kill(remEngine);
						return;
					}
					powGlobals.torrent.engine = remEngine;
					torrent.engine.start(remHistory);
					powGlobals.torrent.serverReady = 1;
				}
			}(playerApi.tempSel,targetHistory,powGlobals.torrent.engine));
					
			powGlobals.torrent.engine.on('download',function(pc) {
				torrent.queues.uiUpdate++;
				torrent.checkDownloaded.push({ piece: pc });
			});
			
			powGlobals.torrent.engine.on('ready', function () { torrent.isReady = true; });
			
			onmagnet();
		}
	
		return this;
	},
	
	history: function(targetHistory) {
		player.setOpeningText("Loading resource");
	
		win.gui.setMinimumSize(372, 210);
	
		$('#main').css("display","none");
		$('#player_wrapper').css("min-height","100%").css("height","100%").css("width","auto");
		if (!$("#open-url").hasClass("dark-add-url")) {
			$("#magnetSubmit").text("Add");
			$("#open-url").addClass("dark-add-url");
		}
		
		$('.history-animated-close').trigger("click");
		
		$("#header_container").show();
		
		if (targetHistory.infoHash) load.torrent(targetHistory,true);
		else {
			powGlobals.lists.media = [];
			
			var thisVideoId = powGlobals.lists.media.length;
			load.playlistItem(targetHistory.mrl);
	
			for (oi = 0; targetHistory.playlist[oi.toString()]; oi++) {
				if (targetHistory.playlist[oi.toString()].mrl) if (targetHistory.playlist[oi.toString()].title) {
					thisVideoId++;
					torLink = targetHistory.playlist[oi.toString()].mrl;
					load.playlistItem(torLink,thisVideoId);
				}
			}
			setTimeout(utils.delayer(targetHistory,function(dln) {
				player.playItem(dln.currentItem);
				clean = utils.parser(dln.playlist[player.currentItem()].title);
				win.title.left(clean.name());
			}),200);
		}
		return this;
	},
	
	playlistItem: function(torLink,videoId,torName) {
		videoId = typeof videoId === 'number' ? videoId : typeof powGlobals.lists.media !== 'undefined' ? powGlobals.lists.media.length : 0;

		if (!powGlobals.lists) powGlobals.lists = {};
		if (!powGlobals.lists.media) powGlobals.lists.media = [];

		powGlobals.lists.media[videoId] = {};
		powGlobals.lists.media[videoId].local = 1;
		
		if (torName) powGlobals.lists.media[videoId].filename = utils.parser(torName).filename();
		else powGlobals.lists.media[videoId].filename = utils.parser(torLink).filename();
		powGlobals.lists.media[videoId].path = utils.parser(torLink).deWebize();
		powGlobals.lists.media[videoId].byteLength = utils.fs.size(powGlobals.lists.media[videoId].path);
		
		if (playerApi.supportedVideos.indexOf(utils.parser(torLink).extension()) > -1) {
			powGlobals.lists.media[videoId].isVideo = true;
		} else if (playerApi.supportedAudio.indexOf(utils.parser(torLink).extension()) > -1) {
			powGlobals.lists.media[videoId].isAudio = true;
		}
		
		torLink = utils.parser(torLink).webize();
	
		if (!powGlobals.lists.media[videoId].filename) {
			powGlobals.lists.media[videoId].filename = "0";
			powGlobals.lists.media[videoId].isVideo = true;
		}
		if (powGlobals.lists.media[videoId].filename) {

			var set = {
				title: utils.parser(powGlobals.lists.media[videoId].filename).name(),
				url: torLink
			};
			
			if (videoId == 0) set = load.pushArgs(set);
	
			if (!playerApi.loaded && !playerApi.playlist.async.addPlaylist) playerApi.playlist.async.addPlaylist = [];
			
			if (playerApi.loaded) player.addPlaylist(set);
			else playerApi.playlist.async.addPlaylist.push(set);

		}
	}
	
}