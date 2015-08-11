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

var peerflix = require('peerflix');

function engage(targetHistory,remPlaylist,remSel) {
	if (holdTorrent) {
		holdTorrent = false;
		killEngine(powGlobals.engine);
		return;
	}

	$("#filesList").css("display","block");
	
	targetHistory = typeof targetHistory !== 'undefined' ? targetHistory : 0;
	
	if (remPlaylist && remPlaylist["0"]) rememberPlaylist = playlistIntegrity(remPlaylist);
	
	if (remSel && remSel > -1 && tempSel != remSel) tempSel = remSel;
	
	powGlobals.speedPiece = 0;
	powGlobals.speedUpdate = Math.floor(Date.now() / 1000);
	
	downSpeed = setTimeout(function(){ checkSpeed(); }, 3000);
	
	$("#headerText").text(powGlobals.engine.torrent.name);
	
	var localHref = 'http://localhost:' + powGlobals.engine.server.address().port + '/'
	powGlobals.hash = powGlobals.engine.infoHash;
	powGlobals.downloaded = 0;
	powGlobals.pulse = 0;
	
	$("#downAll").text(getReadableFileSizeString(Math.floor(powGlobals.engine.torrent.length)));

	powGlobals.hasVideo = 0;
	$("#filesList").html("");

	powGlobals.engine.files.forEach(function(el,ij) {
		var fileStart = el.offset;
		if (el.offset > 0) fileStart++;
		var fileEnd = fileStart + el.length;
		eli = [];
		eli.firstPiece = Math.floor(fileStart / powGlobals.engine.torrent.pieceLength)
		eli.lastPiece = Math.floor((fileEnd -1) / powGlobals.engine.torrent.pieceLength)
		eli.lastDownload = 0;
		eli.downloaded = 0;
		eli.index = ij;
		eli.byteLength = el.length;
		eli.name = el.name;
		if (supportedVideo.indexOf(eli.name.split('.').pop().toLowerCase()) > -1 && eli.name.toLowerCase().replace("sample","") == eli.name.toLowerCase() && eli.name != "ETRG.mp4" && eli.name.toLowerCase().substr(0,5) != "rarbg") {
			eli.isVideo = true;
		} else eli.isVideo = false;
		powGlobals.indexes[ij] = ij;
		powGlobals.files[ij] = eli;
	});
	
	if (getShortSzEp(powGlobals.files[0].name)) powGlobals.files = sortEpisodes(powGlobals.files,2);
	else powGlobals.files = naturalSort(powGlobals.files,2);

	if (!playerLoaded) asyncPlaylist.addPlaylist = [];

	var kj = 0;

	if (rememberPlaylist["0"]) {
		wjs().plugin.playlist.clear();
		if (isNaN(rememberPlaylist["0"].mrl) === true) {
			while (rememberPlaylist[kj.toString()] && isNaN(rememberPlaylist[kj.toString()].mrl) === true && rememberPlaylist[kj.toString()].mrl.toLowerCase().indexOf("pow://"+powGlobals.engine.infoHash.toLowerCase()) == -1 && rememberPlaylist[kj.toString()].mrl.toLowerCase().indexOf("magnet:?xt=urn:btih:"+powGlobals.engine.infoHash.toLowerCase()) == -1) {
				var set = {
					url: rememberPlaylist[kj.toString()].mrl,
					title: rememberPlaylist[kj.toString()].title,
					disabled: rememberPlaylist[kj.toString()].disabled
				};
				if (rememberPlaylist[kj.toString()].contentType) set.contentType = rememberPlaylist[kj.toString()].contentType;

				wjs().addPlaylist(set);
				
				powGlobals.videos[kj] = {};
				powGlobals.videos[kj].path = "unknown";
				powGlobals.videos[kj].filename = "unknown";
				kj++;
			}
		}
	}
	
	var kla = kj;

	if (localStorage.useVLC != "1") {
		powGlobals.files.forEach(function(el,ij) {
			if (el.isVideo) {
				var thisName = el.name;
				powGlobals.hasVideo++;
				if (typeof savedIj === 'undefined') savedIj = ij;

				powGlobals.videos[kj] = [];

				powGlobals.files[ij].vIndex = kj;
				powGlobals.videos[kj].checkHashes = [];
				powGlobals.videos[kj].lastSent = 0;
				powGlobals.videos[kj].index = ij;
				powGlobals.videos[kj].filename = thisName.split('/').pop().replace(/\{|\}/g, '');
				var fileStart = powGlobals.engine.files[el.index].offset;
				var fileEnd = powGlobals.engine.files[el.index].offset + powGlobals.engine.files[el.index].length;
				powGlobals.videos[kj].firstPiece = Math.floor(fileStart / powGlobals.engine.torrent.pieceLength);
				powGlobals.videos[kj].lastPiece = Math.floor((fileEnd -1) / powGlobals.engine.torrent.pieceLength);
				powGlobals.videos[kj].path = "" + powGlobals.engine.path + pathBreak + powGlobals.engine.files[el.index].path;
				powGlobals.videos[kj].byteLength = powGlobals.engine.files[el.index].length;
				powGlobals.videos[kj].downloaded = 0;
				if (powGlobals.hasVideo == 1) {
					var filename = thisName.split('/').pop().replace(/\{|\}/g, '')
					powGlobals.filename = filename;
					powGlobals.path = powGlobals.videos[kj].path;
					powGlobals.firstPiece = powGlobals.videos[kj].firstPiece;
					powGlobals.lastPiece = powGlobals.videos[kj].lastPiece;
					if (powGlobals.videos[kj].byteLength) powGlobals.byteLength = powGlobals.videos[kj].byteLength;
					else if (powGlobals.byteLength) delete powGlobals.byteLength;
					
//					if (targetHistory == 0) win.title = getName(filename);

					if (playerLoaded) {
						if (powGlobals.engine.swarm.wires.length == 0) wjs().setOpeningText("No Peers Found");
						else wjs().setOpeningText("Prebuffering ...");
						setTimeout(function() { announceNoPeers(); },3000);
					}
					else asyncPlaylist.preBufZero = true;
					
					if (powGlobals.engine.files[el.index].offset != powGlobals.engine.server.index.offset) {
						for (as = 0; powGlobals.engine.files[powGlobals.files[as].index]; as++) {
							if (powGlobals.engine.files[powGlobals.files[as].index].offset == powGlobals.engine.server.index.offset) {
								powGlobals.engine.files[powGlobals.files[as].index].deselect();
								break;
							}
						}
					}

				}
				if (targetHistory == 0) {
					var set = {
						 url: localHref+el.index,
						 title: getName(el.name),
						 contentType: require('mime-types').lookup(powGlobals.engine.files[el.index].path)
					};
					if (argData.title) {
						set.title = argData.title;
						delete argData.title;
					}
					if (argData.subFile) {
						set.defaultSub = "Custom Subtitle";
						set.subtitles = { "Custom Subtitle": argData.subFile };
						delete argData.subFile;
					}
					if (playerLoaded) wjs().addPlaylist(set);
					else asyncPlaylist.addPlaylist.push(set);
				}
				kj++;
			}
		});
	} else if (vlcPath) {
		var os = require('os');
		var newM3U = "#EXTM3U";
		powGlobals.files.forEach(function(el,ij) {
			var thisName = el.name;
			if (el.isVideo) {
				if (newM3U == "#EXTM3U") powGlobals.engine.files[el.index].select();
				newM3U += os.EOL+"#EXTINF:0,"+getName(el.name)+os.EOL+localHref+el.index;
			}
		});
		fs.exists(gui.App.dataPath+pathBreak+'vlc_playlist.m3u', function(exists) {
			if (exists) fs.unlink(gui.App.dataPath+pathBreak+'vlc_playlist.m3u', function() {
				fs.writeFile(gui.App.dataPath+pathBreak+'vlc_playlist.m3u', newM3U, function() {
					require('child_process').exec('"'+vlcPath+'" "'+gui.App.dataPath+pathBreak+'vlc_playlist.m3u"');
				});
			});
			else fs.writeFile(gui.App.dataPath+pathBreak+'vlc_playlist.m3u', newM3U, function() {
				require('child_process').exec('"'+vlcPath+'" "'+gui.App.dataPath+pathBreak+'vlc_playlist.m3u"');
			});
			$(window).trigger('resize');
		});
	}
	
	if (rememberPlaylist[kj.toString()]) {
		if (isNaN(rememberPlaylist[kj.toString()].mrl) === true) {
			while (rememberPlaylist[kj.toString()]) {
				var set = {
					 url: rememberPlaylist[kj.toString()].mrl,
					 title: rememberPlaylist[kj.toString()].title,
					 disabled: rememberPlaylist[kj.toString()].disabled
				};
				if (rememberPlaylist[kj.toString()].contentType) set.contentType = rememberPlaylist[kj.toString()].contentType;
				wjs().addPlaylist(set);

				powGlobals.videos[kj] = {};
				powGlobals.videos[kj].path = "unknown";
				powGlobals.videos[kj].filename = "unknown";
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
				wjs().addPlaylist(set);
			}
			setTimeout(delayLoadHistory(targetHistory),200);
		}
	}

	// Force Peer Discovery and Reconnection
	setTimeout(function() { if (powGlobals.engine) { powGlobals.engine.discover(); powGlobals.engine.swarm.reconnectAll(); } },1000);
	
	if (powGlobals.hasVideo == 0) {
		if (playerLoaded) {
			wjs().fullscreen(false);
			wjs().clearPlaylist();
		} else asyncPlaylist.noPlaylist = true;
		if (localStorage.useVLC != "1") powGlobals.engine.server.close();
		$('#player_wrapper').css("min-height","1px").css("height","1px").css("width","1px");
		$('#inner-in-content').css("overflow-y","visible");
		win.title = powGlobals.engine.torrent.name;
		winTitleLeft(powGlobals.engine.torrent.name);
		$(window).trigger('resize');
		powGlobals.pulse = 1000000; // 1 Mbps pulse for non-video torrents
		if (localStorage.pulseRule == "always" || (localStorage.pulseRule == "auto" && !focused)) powGlobals.engine.setPulse(powGlobals.pulse);
	}
				
	$("#filesList").append($('<div style="width: 100%; height: 79px; text-align: center; line-height: 79px; font-family: \'Droid Sans Bold\'; font-size: 19px; border-bottom: 1px solid #353535; background: #4d4d4d">Scroll up to Start Video Mode</div>'));
	
	powGlobals.files.forEach(function(el,ij) {
		setPaused = '<i id="action'+ij+'" onClick="playEl('+ij+')" class="glyphs play" style="background-color: #FF704A"></i>';
		if (typeof savedIj !== 'undefined' && savedIj == ij) setPaused = '<i id="action'+ij+'" onClick="pauseEl('+ij+')" class="glyphs pause" style="background-color: #F6BC24"></i>';
		if (powGlobals.hasVideo == 0 && localStorage.useVLC != "1") {
			setPaused = '<i id="action'+ij+'" onClick="pauseEl('+ij+')" class="glyphs pause" style="background-color: #F6BC24"></i>';
			powGlobals.engine.swarm.paused = false;
			playEl(ij);
		}
		
		if (ij%2 !== 0) backColor = '#3e3e3e';
		else backColor = '#444';
		
		$("#filesList").append($('<div style="width: 70px; text-align: right; position: absolute; right: 0px; font-size: 240%; margin-top: 14px; margin-right: 19px;">'+setPaused+'</div><div onClick="settingsEl('+ij+')" id="file'+ij+'" class="files" data-index="'+ij+'" style="text-align: left; padding-bottom: 8px; padding-top: 8px; width: 100%; background-color: '+backColor+'" data-color="'+backColor+'"><div id="p-file'+ij+'" class="circle"><strong></strong></div><div style="width: calc(100% - 89px); text-align: left"><span class="filenames">'+powGlobals.engine.files[el.index].name+'</span><span class="infos">Downloaded: <span id="down-fl'+ij+'">0 kB</span> / '+getReadableFileSizeString(powGlobals.engine.files[el.index].length)+'</span><div style="clear: both"></div></div></center></div>'));

	});
	$('.circle').circleProgress({
		value: 0,
		size: 64,
		thickness: 6,
		fill: { gradient: [['#0681c4', .5], ['#4ac5f8', .5]], gradientAngle: Math.PI / 4 }
	}).on('circle-animation-progress', function(event, progress, stepValue) {
		$(this).find('strong').html(parseInt(100 * stepValue) + '<i>%</i>');
	});
	if (powGlobals.hasVideo == 0 && localStorage.useVLC != "1") {
		// reselect all files
		setTimeout(function() { powGlobals.engine.files.forEach(function(el) { el.select(); }); },1000);
	}
	
	if (rememberPlaylist["0"]) {
		if (typeof kla !== 'undefined') nextPlay += kla;
		if (wjs().state() == "error") wjs().stop(true);
		if (nextStartDlna == 1) {
			nextStartDlna = 0;
			dlna.initiated = true;
			wjs().setOpeningText("Starting DLNA Server ...");
			if (powGlobals.hasVideo > 1) dlnaPlay(nextPlay);
			else {
				if (waitForNext && tempSel > -1) dlnaPlay(tempSel);
				else dlnaPlay(nextPlay);
			}
		} else {
			if (powGlobals.hasVideo > 1) wjs().playItem(nextPlay);
			else {
				if (waitForNext && tempSel > -1) wjs().playItem(tempSel);
				else wjs().playItem(nextPlay);
			}
		}
		nextPlay = 0;
		rememberPlaylist = {};
	}
	
	if (autoPlay) {
		autoPlay = false;
		wjs().playItem(0);
	}
}

function runURL(torLink,noAutoStart) {
	
	if ($('#main').css("display") == "table") {
		if (torLink.toLowerCase().replace(".torrent","") != torLink.toLowerCase()) {
			var readTorrent = require('read-torrent');
			readTorrent(torLink, function(err, torrent) { addTorrent(torrent); });
		} else if (torLink.toLowerCase().match(/magnet:\?xt=urn:btih:[a-z0-9]{20,50}/i) != null || torLink.toLowerCase().match(/magnet:\?xt=urn:sha1:[a-z0-9]{20,50}/i) != null) {									
			addTorrent(torLink);
		} else {
			$("#filesList").css("display","none");
			$('#main').css("display","none");
			$('#player_wrapper').css("min-height","100%").css("height","100%").css("width","auto");

			if (!$("#open-url").hasClass("dark-add-url")) {
				$("#magnetSubmit").text("Add");
				$("#open-url").addClass("dark-add-url");
			}

			if (typeof wjs !== 'undefined') {
				wjs().showSplashScreen();
				wjs().wrapper.find(".wcp-subtitle-text").text("");
				wjs().wrapper.find(".wcp-subtitle-but").hide(0);
			}
		
			var thisVideoId = powGlobals.videos.length;
			
			powGlobals.videos[thisVideoId] = [];
			powGlobals.videos[thisVideoId].local = 1;
	
			if (torLink.substr(0,4) != "http" && torLink.substr(0,8) != "file:///") {
				powGlobals.videos[thisVideoId].path = torLink;
				
				if (torLink.indexOf('\\') > -1) powGlobals.videos[thisVideoId].filename = torLink.split('\\').pop();
				else if (torLink.indexOf('/') > -1) powGlobals.videos[thisVideoId].filename = torLink.split('/').pop();
				
				powGlobals.videos[thisVideoId].byteLength = fs.statSync(powGlobals.videos[thisVideoId].path).size;
				torLink = "file:///"+torLink.split("\\").join("/");
			} else if (torLink.indexOf("file:///") > -1) {
				
				if (!isWin) powGlobals.videos[thisVideoId].path = torLink.replace("file:///","");
				else powGlobals.videos[thisVideoId].path = torLink.replace("file:///","").split("/").join("\\");

				powGlobals.videos[thisVideoId].filename = torLink.split('/').pop();
				powGlobals.videos[thisVideoId].byteLength = fs.statSync(powGlobals.videos[thisVideoId].path).size;
			} else if (torLink.substr(0,4) == "http") {
				powGlobals.videos[thisVideoId].path = torLink;
				powGlobals.videos[thisVideoId].filename = torLink.split('/').pop();
			} else {
				powGlobals.videos[thisVideoId].path = torLink;
				
				if (torLink.indexOf("/") > -1) powGlobals.videos[thisVideoId].filename = torLink.split('/').pop();
				else if (torLink.indexOf("\\") > -1) powGlobals.videos[thisVideoId].filename = torLink.split('\\').pop();
			}
	
			if (powGlobals.videos[thisVideoId].filename) {
				
				if (!playerLoaded) asyncPlaylist.addPlaylist = [];
				var set = {
					 url: torLink,
					 title: getName(powGlobals.videos[thisVideoId].filename)
				};
				if (argData.title) {
					set.title = argData.title;
					delete argData.title;
				}
				if (argData.subFile) {
					set.defaultSub = "Custom Subtitle";
					set.subtitles = { "Custom Subtitle": argData.subFile };
					delete argData.subFile;
				}
				
				if (playerLoaded) wjs().addPlaylist(set);
				else asyncPlaylist.addPlaylist.push(set);

			}
	
			if (setOnlyFirst == 0 || setOnlyFirst == 2) {
				if (setOnlyFirst == 2) setOnlyFirst = 1;
//				win.title = getName(powGlobals.videos[thisVideoId].filename);
			}
		}
	
		if (playerLoaded) {
			wjs().setOpeningText("Loading resource");
			if (typeof noAutoStart === 'undefined') wjs().startPlayer();
		} else asyncPlaylist.loadLocal = true;
	
		win.setMinimumSize(372, 210);
		
		$("#header_container").show();
		
	} else {
		if (torLink.toLowerCase().replace(".torrent","") != torLink.toLowerCase() || torLink.toLowerCase().match(/magnet:\?xt=urn:btih:[a-z0-9]{20,50}/i) != null || torLink.toLowerCase().match(/magnet:\?xt=urn:sha1:[a-z0-9]{20,50}/i) != null) {
			var readTorrent = require('read-torrent');
			readTorrent(torLink, function(err, torrent) {
				
				if (!playerLoaded) asyncPlaylist.addPlaylist = [];
				
				var set = { url: "pow://"+torrent.infoHash };
				if (argData.title) {
					set.title = argData.title;
					delete argData.title;
				} else if (torrent.name) set.title = getName(torrent.name);
				if (argData.subFile) {
					set.defaultSub = "Custom Subtitle";
					set.subtitles = { "Custom Subtitle": argData.subFile };
					delete argData.subFile;
				}

				wjs().addPlaylist(set);

			});
		} else {
			var thisVideoId = powGlobals.videos.length;
			
			powGlobals.videos[thisVideoId] = [];
			powGlobals.videos[thisVideoId].local = 1;
	
			if (torLink.substr(0,4) != "http" && torLink.substr(0,8) != "file:///") {
				powGlobals.videos[thisVideoId].path = torLink;
				
				if (torLink.indexOf("/") > -1) powGlobals.videos[thisVideoId].filename = torLink.split('/').pop();
				else if (torLink.indexOf("\\") > -1) powGlobals.videos[thisVideoId].filename = torLink.split('\\').pop();

				powGlobals.videos[thisVideoId].byteLength = fs.statSync(powGlobals.videos[thisVideoId].path).size;
				torLink = "file:///"+torLink.split("\\").join("/");
			} else if (torLink.indexOf("file:///") > -1) {
				
				if (torLink.indexOf("/") > -1) powGlobals.videos[thisVideoId].path = torLink.replace("file:///","").split("/").join("\\");
				else powGlobals.videos[thisVideoId].path = torLink.replace("file:///","");

				powGlobals.videos[thisVideoId].filename = torLink.split('/').pop();
				powGlobals.videos[thisVideoId].byteLength = fs.statSync(powGlobals.videos[thisVideoId].path).size;
			} else if (torLink.substr(0,4) == "http") {
				powGlobals.videos[thisVideoId].path = torLink;
				powGlobals.videos[thisVideoId].filename = torLink.split('/').pop();
			} else {
				powGlobals.videos[thisVideoId].path = torLink;

				if (torLink.indexOf("/") > -1) powGlobals.videos[thisVideoId].filename = torLink.split('/').pop();
				else if (torLink.indexOf("\\") > -1) powGlobals.videos[thisVideoId].filename = torLink.split('\\').pop();
			}

			if (powGlobals.videos[thisVideoId].filename) {
				var set = {
					 url: torLink,
					 title: getName(powGlobals.videos[thisVideoId].filename)
				};
				if (argData.title) {
					set.title = argData.title;
					delete argData.title;
				}
				if (argData.subFile) {
					set.defaultSub = "Custom Subtitle";
					set.subtitles = { "Custom Subtitle": argData.subFile };
					delete argData.subFile;
				}
				wjs().addPlaylist(set);
			}
		}
	}
	
}

function runMultiple(fileArray) {
	setOnlyFirst = 2;
	if (getShortSzEp(fileArray[0])) fileArray = sortEpisodes(fileArray);
	else fileArray = naturalSort(fileArray);
	
	ranURL = false;
	fileArray.forEach(function(el) {
		if (el.split('.').pop().toLowerCase() == 'torrent') {
			var readTorrent = require('read-torrent');
			readTorrent(el, function(err, torrent) {
				var set = {
					url: "pow://"+torrent.infoHash,
					title: getName(torrent.name)
				};
				if (argData.title) {
					set.title = argData.title;
					delete argData.title;
				}
				if (argData.subFile) {
					set.defaultSub = "Custom Subtitle";
					set.subtitles = { "Custom Subtitle": argData.subFile };
					delete argData.subFile;
				}

				wjs().addPlaylist(set);
			});
		} else {
			ranURL = true;
			runURL(el);
		}
	});
	powGlobals.videos = [];
	fileArray.forEach(function(e,ij) {
		powGlobals.videos[ij] = [];
		if (e.split('.').pop().toLowerCase() == 'torrent') {
			powGlobals.videos[ij].filename = "unknown";
			powGlobals.videos[ij].path = "unknown";
		} else {
			if (isWin) powGlobals.videos[ij].filename = e.split('\\').pop();
			else powGlobals.videos[ij].filename = e.split('/').pop();
			powGlobals.videos[ij].path = e;
		}
	});
	if (!ranURL) wjs().startPlayer();
	$('#main').css("display","none");
	$('#player_wrapper').css("min-height","100%").css("height","100%").css("width","auto");
	if (!$("#open-url").hasClass("dark-add-url")) {
		$("#magnetSubmit").text("Add");
		$("#open-url").addClass("dark-add-url");
	}
	setOnlyFirst = 0;
	
	return false;
}

function addTorrent(torLink,isHistory) {
	
	if ($('#main').css("display") == "table") {
		$('#filesList').css("display","none");
		$('#main').css("display","none");
		$('#player_wrapper').css("min-height","100%").css("height","100%").css("width","auto");
		
		if (typeof wjs !== 'undefined') {
			wjs().showSplashScreen();
			wjs().wrapper.find(".wcp-subtitle-text").text("");
			wjs().wrapper.find(".wcp-subtitle-but").hide(0);
		}
		autoPlay = true;
	}
	
	isHistory = typeof isHistory !== 'undefined' ? isHistory : false;
	
	if (isHistory) {
		targetHistory = torLink;
		torLink = "magnet:?xt=urn:btih:"+torLink.infoHash;
		powGlobals.videos = [];
		powGlobals.indexes = [];
		powGlobals.files = [];
	}
	powGlobals.allPieces = 0;
	powGlobals.lastDownload = 0;
	powGlobals.lastDownloadTime = Math.floor(Date.now() / 1000);
	
	prebuf = 0;
	
	// reset values in Torrent Data mode
	$('.progress .progress-bar').removeClass("progress-bar-danger").addClass("progress-bar-warning").attr('data-transitiongoal', 0).progressbar({display_text: 'center'});
	$('#downPart').text("0 kB");
	$('#downAll').text("0 kB");
	$('#speed').text("0.0 kB/s");
	$('#nrPeers').text("0");
	// end reset values in Torrent Data mode
	
	if (typeof torLink !== 'undefined' && (typeof torLink === 'object' || Buffer.isBuffer(torLink) || torLink.toLowerCase().match(/magnet:\?xt=urn:sha1:[a-z0-9]{20,50}/i) != null || torLink.toLowerCase().match(/magnet:\?xt=urn:btih:[a-z0-9]{20,50}/i) != null || torLink.split('.').pop().toLowerCase() == "torrent")) {
	
		if (typeof torLink !== 'object' && Buffer.isBuffer(torLink) === false && torLink.split('.').pop().toLowerCase() == "torrent") torLink = fs.readFileSync(torLink);
		
		// load the torrent with peerflix
		if (localStorage.tmpDir == 'Temp') var opts = { connections: localStorage.maxPeers, trackers: ['udp://tracker.openbittorrent.com:80', 'udp://tracker.publicbt.com:80', 'udp://tracker.istole.it:6969', 'udp://open.demonii.com:1337' ] };
		else var opts = { connections: localStorage.maxPeers, path: localStorage.tmpDir, trackers: ['udp://tracker.openbittorrent.com:80', 'udp://tracker.publicbt.com:80', 'udp://tracker.istole.it:6969', 'udp://open.demonii.com:1337' ]  };
		
		powGlobals.engine = peerflix(torLink,opts);
						
		powGlobals.engine.swarm.on('wire', onmagnet);
		peerInterval = setInterval(function(){ peerCheck() }, 2000);
		
		if (!isHistory) powGlobals.engine.server.on('listening', function(remSel,remPlaylist,remEngine) {
			return function() {
				if (tempSel != remSel) {
					killEngine(remEngine);
					return;
				}
				powGlobals.engine = remEngine;
				if (remPlaylist["0"]) engage(0,remPlaylist,remSel);
				else engage();
				powGlobals.serverReady = 1;
			}
		}(tempSel,rememberPlaylist,powGlobals.engine));
		else if (isHistory) powGlobals.engine.server.on('listening', function(remSel,remHistory,remEngine) {
			return function() {
				if (tempSel != remSel) {
					killEngine(remEngine);
					return;
				}
				powGlobals.engine = remEngine;
				engage(remHistory);
				powGlobals.serverReady = 1;
			}
		}(tempSel,targetHistory,powGlobals.engine));
				
		powGlobals.engine.on('download',checkDownloaded);
		
		powGlobals.engine.on('ready', function () { isReady = 1; });
		
		onmagnet();
	}

	return this;
}

function loadHistory(targetHistory) {
	wjs().setOpeningText("Loading resource");

	win.setMinimumSize(372, 210);

	$('#main').css("display","none");
	$('#player_wrapper').css("min-height","100%").css("height","100%").css("width","auto");
	if (!$("#open-url").hasClass("dark-add-url")) {
		$("#magnetSubmit").text("Add");
		$("#open-url").addClass("dark-add-url");
	}
	
	$('.history-animated-close').trigger("click");
	
	$("#header_container").show();
	
	if (targetHistory.infoHash) addTorrent(targetHistory,true);
	else {
		powGlobals.videos = [];
		var thisVideoId = powGlobals.videos.length;
		
		powGlobals.videos[thisVideoId] = [];
		powGlobals.videos[thisVideoId].local = 1;

		if (powGlobals.videos[thisVideoId].filename) {
			var set = {
				 url: torLink,
				 title: getName(powGlobals.videos[thisVideoId].filename)
			};
			if (argData.title) {
				set.title = argData.title;
				delete argData.title;
			}
			if (argData.subFile) {
				set.defaultSub = "Custom Subtitle";
				set.subtitles = { "Custom Subtitle": argData.subFile };
				delete argData.subFile;
			}

			wjs().addPlaylist(set);
		}

		for (oi = 0; targetHistory.playlist[oi.toString()]; oi++) {
			if (targetHistory.playlist[oi.toString()].mrl) if (targetHistory.playlist[oi.toString()].title) {
				torLink = targetHistory.playlist[oi.toString()].mrl;
				powGlobals.videos[thisVideoId] = {};
				if (torLink.substr(0,4) != "http" && torLink.substr(0,8) != "file:///") {
					powGlobals.videos[thisVideoId].path = torLink;
					
					if (isWin) powGlobals.videos[thisVideoId].filename = torLink.split('\\').pop();
					else powGlobals.videos[thisVideoId].filename = torLink.split('/').pop();
					
					powGlobals.videos[thisVideoId].byteLength = fs.statSync(powGlobals.videos[thisVideoId].path).size;
					torLink = "file:///"+torLink.split("\\").join("/");
				} else if (torLink.indexOf("file:///") > -1) {
					
					if (torLink.indexOf("\\") > -1) powGlobals.videos[thisVideoId].path = torLink.replace("file:///","").split("/").join("\\");
					else if (torLink.indexOf("/") > -1) powGlobals.videos[thisVideoId].path = torLink.replace("file:///","");
					
					powGlobals.videos[thisVideoId].filename = torLink.split('/').pop();
					powGlobals.videos[thisVideoId].byteLength = fs.statSync(powGlobals.videos[thisVideoId].path).size;
				} else if (torLink.substr(0,4) == "http") {
					powGlobals.videos[thisVideoId].path = torLink;
					powGlobals.videos[thisVideoId].filename = torLink.split('/').pop();
				} else {
					powGlobals.videos[thisVideoId].path = torLink;
					
					if (torLink.indexOf("/") > -1) powGlobals.videos[thisVideoId].filename = torLink.split('/').pop();
					else if (torLink.indexOf("\\") > -1) powGlobals.videos[thisVideoId].filename = torLink.split('\\').pop();
				}
				if (powGlobals.videos[thisVideoId].filename) {
					var set = {
						 url: torLink,
						 title: getName(powGlobals.videos[thisVideoId].filename)
					};
					if (argData.title) {
						set.title = argData.title;
						delete argData.title;
					}
					if (argData.subFile) {
						set.defaultSub = "Custom Subtitle";
						set.subtitles = { "Custom Subtitle": argData.subFile };
						delete argData.subFile;
					}
		
					wjs().addPlaylist(set);
				}
				thisVideoId++;
			}
			setTimeout(delayLoadHistory(targetHistory),200);
		}
	}
	return this;
}

function playlistAddVideo(torLink) {
	var thisVideoId = powGlobals.videos.length;
	powGlobals.videos[thisVideoId] = [];
	powGlobals.videos[thisVideoId].local = 1;
	powGlobals.videos[thisVideoId].path = torLink;

	if (torLink.indexOf("/") > -1) powGlobals.videos[thisVideoId].filename = torLink.split('/').pop();
	else if (torLink.indexOf("\\") > -1) powGlobals.videos[thisVideoId].filename = torLink.split('\\').pop();

	powGlobals.videos[thisVideoId].byteLength = fs.statSync(powGlobals.videos[thisVideoId].path).size;
	if (powGlobals.videos[thisVideoId].filename) {
		torLink = "file:///"+torLink.split("\\").join("/");
		var set = {
			 url: torLink,
			 title: getName(powGlobals.videos[thisVideoId].filename)
		};
		if (argData.title) {
			set.title = argData.title;
			delete argData.title;
		}
		if (argData.subFile) {
			set.defaultSub = "Custom Subtitle";
			set.subtitles = { "Custom Subtitle": argData.subFile };
			delete argData.subFile;
		}

		wjs().addPlaylist(set);
	}
}