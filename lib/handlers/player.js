var rememberPlaylist = {};
var waitForNext = false;
var nextPlay = 0;
var keepCurrent = 0;
var keepState = "opening";

// detect if playlist item is a youtube link
function isYoutube(plItem) {
	if (wjs().plugin.playlist.items[plItem].mrl.indexOf("googlevideo.com") > -1 || wjs().plugin.playlist.items[plItem].mrl.indexOf("youtube.com/watch") > -1) return true;
	else return false;
}

function isPlaying() {
	if (doSubsLocal == 1 && typeof powGlobals.engine === 'undefined') {
		wjs().setDownloaded(0.0000000000000000001);
		doSubsLocal = 0;
		clearTimeout(findHashTime);
		findHash();
	}
	if (firstTime == 0 && focused === false) if (!wjs().fullscreen()) win.requestAttention(true);
	if (firstTime == 0) {
		if (typeof powGlobals.duration !== 'undefined') wjs().setTotalLength(powGlobals.duration);
		firstTime = 1;
		wjs().plugin.subtitle.track = 0;
	}
	if (firstTimeEver == 1) {
		firstTimeEver = 0;
		if (typeof localStorage.savedVolume !== 'undefined') setTimeout(function() { wjs().volume(localStorage.savedVolume); },100);
		setTimeout(function() { wjs().onVolume(function() { if (this.volume() > 0) localStorage.savedVolume = this.volume(); }); },101);
		if (!wjs().fullscreen()) {
			if (wjs().width() == 0 && wjs().height() == 0) {
				firstTimeEver = 1;
			} else {
				resizeInBounds((wjs().width() + (win.width - window.innerWidth)),(wjs().height() + (win.height - window.innerHeight)));
				if (isYoutube(0)) setTimeout(function() { wjs().emitJsMessage("[refresh-playlist]"); },500); // fix youtube playlist titles
			}
		}
	}
	if (isYoutube(wjs().currentItem()) && win.title != wjs().plugin.playlist.items[wjs().currentItem()].title.replace("[custom]","")) win.title = wjs().plugin.playlist.items[wjs().currentItem()].title.replace("[custom]","");
	if ($("body").css("overflow-y") == "visible" || $("body").css("overflow-y") == "auto") $('html, body').animate({ scrollTop: 0 }, 'slow');
}

function handleErrors() {
	if (wjs().plugin.playlist.items[wjs().currentItem()].mrl.indexOf("pow://") == 0) waitForNext = true;
}

function isOpening() {
	if (powGlobals.currentIndex != wjs().currentItem() && !waitForNext) {
		if (castData.casting) stopDlna();
		keepCurrent = wjs().currentItem();
		if (wjs().plugin.playlist.items[wjs().currentItem()].mrl.indexOf("pow://") == 0) {
			wjs().emitJsMessage("[temp-sel]"+wjs().currentItem());
			nextTorrent = wjs().plugin.playlist.items[wjs().currentItem()].mrl.replace("pow://","");
			win.title = wjs().plugin.playlist.items[wjs().currentItem()].title.replace("[custom]","");
			if (nextTorrent.indexOf("/") > -1 && isNaN(nextTorrent.split("/")[1]) === false) {
				nextTorrent = nextTorrent.split("/")[0];
			}
			rememberPlaylist = retrievePlaylist();
			for (ijk = 0; ijk < wjs().itemCount(); ijk++) {
				if (isNaN(rememberPlaylist[ijk.toString()].mrl) === false) rememberPlaylist[ijk.toString()].mrl = "pow://"+powGlobals.engine.infoHash+"/"+rememberPlaylist[ijk.toString()].mrl;
			}
			wjs().setDownloaded(0);
			goBack("magnet:?xt=urn:btih:"+nextTorrent);
			return;
		}
		delete powGlobals.duration;
		delete powGlobals.fileHash;
		savedHistory = 0;
		subVoteSent = 0;
		powGlobals.currentIndex = wjs().currentItem();
		if (powGlobals.engine) {
			if (wjs().plugin) wjs().setOpeningText("Prebuffering ...");
			if (typeof powGlobals.videos[wjs().currentItem()] !== 'undefined' && typeof powGlobals.videos[wjs().currentItem()].local === 'undefined') {
				powGlobals.files.some(function(el,ij) { if (el.index == powGlobals.videos[wjs().currentItem()].index) { playEl(ij); return true; } });
			}
			if (powGlobals.videos[wjs().currentItem()]) win.title = getName(powGlobals.videos[wjs().currentItem()].filename);
			wjs().setDownloaded(0);
			
			powGlobals.filename = powGlobals.videos[wjs().currentItem()].filename;
			powGlobals.path = powGlobals.videos[wjs().currentItem()].path;
			if (typeof powGlobals.videos[wjs().currentItem()].byteLength !== 'undefined') {
				powGlobals.byteLength = powGlobals.videos[wjs().currentItem()].byteLength;
			} else {
				if (powGlobals.byteLength) delete powGlobals.byteLength;
			}
			if (typeof powGlobals.videos[wjs().currentItem()].local === 'undefined') {
				powGlobals.firstPiece = powGlobals.videos[wjs().currentItem()].firstPiece;
				powGlobals.lastPiece = powGlobals.videos[wjs().currentItem()].lastPiece;
			}
			firstTime = 0;
			
			checkInternet(function(isConnected) {
				if (isConnected && powGlobals.byteLength) $.ajax({ type: 'GET', url: window.atob("aHR0cDovL3Bvd2Rlci5tZWRpYS9tZXRhRGF0YS9nZXQucGhwP2Y9")+encodeURIComponent(powGlobals.filename)+window.atob("Jmg9")+encodeURIComponent(powGlobals.hash)+window.atob("JnM9")+encodeURIComponent(powGlobals.byteLength), global: false, cache: false, success: readData });
			});
		} else {
			if (wjs().plugin) wjs().setOpeningText("Loading resource");
			if (wjs().currentItem() > -1) {
				if (!isYoutube(wjs().currentItem())) win.title = getName(powGlobals.videos[wjs().currentItem()].filename); // if not youtube, set window title
				powGlobals.filename = powGlobals.videos[wjs().currentItem()].filename;
				powGlobals.path = powGlobals.videos[wjs().currentItem()].path;
				doSubsLocal = 1;
			}
		}
	}
}

function changedPosition(position) {
	// start downloading next episode after watching more then 70% of a video
	if (position > 0.7) {
		if (wjs().currentItem() < (wjs().itemCount() -1)) {
			if (typeof powGlobals.videos[wjs().currentItem()+1] !== 'undefined' && typeof powGlobals.videos[wjs().currentItem()+1].local === 'undefined') {
				powGlobals.files.some(function(el,ij) { if (el.index == powGlobals.videos[wjs().currentItem()+1].index) { playEl(ij); return false; } });
			}
		}
		
		if (subVoteSent == 0 && wjs().subTrack() > 0) {
			subVoteSent = 1;
			if (wjs().subDesc(wjs().subTrack()).url.indexOf("http://dl.opensubtitles.org/en/download/subencoding-utf8/file/") == 0) {
				var findSubId = wjs().subDesc(wjs().subTrack()).url.replace("http://dl.opensubtitles.org/en/download/subencoding-utf8/file/","");
				if (findSubId.indexOf(".") > -1) {
					findSubId = findSubId.substr(0,findSubId.indexOf("."));
					var subjectUrl = window.atob("aHR0cDovL3Bvd2Rlci5tZWRpYS9tZXRhRGF0YS9zZXRvcmRlci5waHA/Zj0=")+encodeURIComponent(powGlobals.filename)+window.atob("JmloPQ==")+encodeURIComponent(powGlobals.fileHash)+window.atob("JnN0PQ==")+findSubId;
					if (powGlobals.engine) subjectUrl += window.atob("Jmg9")+encodeURIComponent(powGlobals.engine.infoHash);
					$.ajax({ type: 'GET', url: subjectUrl, global: false, cache: false });
				}
			}
		}
	}
	if (position > 0.7 && savedHistory == 0) {
		savedHistory = 1;
		historyObject = JSON.parse(localStorage.history);
		isSafe = 1;
		for (oi = 0; historyObject[oi.toString()]; oi++) { if (historyObject[oi.toString()].title == this.plugin.playlist.items[this.currentItem()].title.replace("[custom]","")) isSafe = 0; }
		if (isSafe == 1) {
			for (oii = oi; oii > 0; oii--) if (historyObject[(oii -1).toString()]) historyObject[oii.toString()] = historyObject[(oii -1).toString()];
			historyObject["0"] = {};
			if (powGlobals.engine) historyObject["0"].infoHash = powGlobals.engine.infoHash;
			historyObject["0"].currentItem = this.currentItem();
			historyObject["0"].title = this.plugin.playlist.items[this.currentItem()].title.replace("[custom]","");
			historyObject["0"].playlist = retrievePlaylist();
			for (oi = 0; historyObject[oi.toString()]; oi++) { if (oi > 19) delete historyObject[oi.toString()]; }
			localStorage.history = JSON.stringify(historyObject);
		}
	}
}

function retrievePlaylist() {
	var plObject = {};
	for (ijk = 0; ijk < wjs().itemCount(); ijk++) {
		plObject[ijk.toString()] = {};
		plObject[ijk.toString()].title = wjs().plugin.playlist.items[ijk].title.replace("[custom]","");
		if (powGlobals.engine && powGlobals.videos[ijk] && powGlobals.videos[ijk].index) {
			plObject[ijk.toString()].contentType = require('mime-types').lookup(powGlobals.engine.files[powGlobals.videos[ijk].index].path);
		}
		if (wjs().plugin.playlist.items[ijk].mrl.substr(0,17) == "http://localhost:" && isNaN(wjs().plugin.playlist.items[ijk].mrl.split("/").pop()) === false) {
			plObject[ijk.toString()].mrl = parseInt(wjs().plugin.playlist.items[ijk].mrl.split("/").pop());
		} else {
			plObject[ijk.toString()].mrl = wjs().plugin.playlist.items[ijk].mrl;
		}
	}
	return plObject;
}

function changedState() {
	if (this.state() != lastState) {
		keepState = this.state();

		// detect unsupported media types
		if ((lastState == "opening" || lastState == "playing" || lastState == "") && (this.state() == "ended" && wjs().itemCount() == 1 && firstTimeEver == 1) && (!isYoutube(wjs().currentItem()))) {
			goBack();
			$("#open-unsupported").trigger("click");
		}

		if (this.state() == "opening") lastItem = this.currentItem();
		else if (lastState == "opening" && this.state() == "ended") {
			if (powGlobals.engine) {
				if (this.plugin.playlist.items[lastItem].mrl.substr(0,17) == "http://localhost:") {
					this.replaceMRL(lastItem,{
						url: "file:///"+powGlobals.videos[lastItem].path.replace("\\","/"),
						title: this.plugin.playlist.items[lastItem].title.replace("[custom]","")
					});
					setTimeout(function() { wjs().playItem(lastItem); },1000);
				}
			}
		}
		lastState = this.state();
	}
}

function handleMessages(event) {
	if (event == "[no-wait]") {
		waitForNext = false;
	} else if (event == "[go-back]") {
		goBack();
	} else if (event == "[cast-pause]") {
		dlna.controls.pause();
		castData.castingPaused = 1;
	} else if (event == "[cast-play]") {
		dlnaPlay();
		castData.castingPaused = 0;
	} else if (event == "[cast-replay]") {
		dlna.controls.play();
		castData.castingPaused = 0;
	} else if (event.indexOf("[cast-seek]") == 0) {
		dlna.controls.seek(event.replace("[cast-seek]",""));
		castData.castingPaused = 0;
	} else if (event.indexOf("[dlna-play]") == 0) {
		wjs().setOpeningText("Starting New Video ...");
		castData.castingPaused = 1;
		dlnaPlay(parseInt(event.replace("[dlna-play]","")));
	} else if (event.indexOf("[dlna-prev]") == 0) {
		if (dlna.lastIndex > 0) {
			wjs().setOpeningText("Starting Previous Video ...");
			castData.castingPaused = 1;
			dlnaPlay(dlna.lastIndex-1);
		}
	} else if (event.indexOf("[dlna-next]") == 0) {
		if (dlna.lastIndex +1 < wjs().itemCount()) {
			wjs().setOpeningText("Starting Next Video ...");
			castData.castingPaused = 1;
			dlnaPlay(dlna.lastIndex+1);
		}
	} else if (event.indexOf("[new-torrent]") == 0) {
		var newTorrentLink = event.replace("[new-torrent]","");
		var readTorrent = require('read-torrent');
		readTorrent(newTorrentLink, function(err, torrent) {
			if (torrent.name) {
				wjs().addPlaylist({
					url: "pow://"+torrent.infoHash,
					title: getName(torrent.name)
				});
			} else {
				wjs().addPlaylist("pow://"+torrent.infoHash);
			}
			wjs().emitJsMessage("[refresh-playlist]");
		});
	} else if (event == "[scan-server]") {
		if (getShortSzEp(powGlobals.videos[powGlobals.videos.length - 1].filename)) {
			var metaServer = window.atob("aHR0cDovL3Bvd2Rlci5tZWRpYS9tZXRhRGF0YS9zY2FuLnBocD9zPQ==")+encodeURIComponent(getSeason(powGlobals.videos[powGlobals.videos.length - 1].filename))+window.atob("JmU9")+encodeURIComponent(getEpisode(powGlobals.videos[powGlobals.videos.length - 1].filename))+window.atob("JnNuPQ==")+encodeURIComponent(getShowName(powGlobals.videos[powGlobals.videos.length - 1].filename).toLowerCase());
			if ((keepState == "playing" || keepState == "paused") && wjs().height() > 0) {
				qualities = [480, 720, 1080];
				metaServer += window.atob("JnBmPQ==")+encodeURIComponent(closest(wjs().height(),qualities));
			}
			$.ajax({ type: 'GET', url: metaServer, dataType: 'json', global: false, cache: false, success: function(xhr) {
				if (xhr.constructor === Array) {
					xhr.forEach(function(el) {
						el.infoHash = el.infoHash.replace("magnet:?xt=urn:btih:","");
						el.infoHash = el.infoHash.substr(0,el.infoHash.indexOf("&"));
						wjs().addPlaylist({
							url: "pow://"+el.infoHash,
							title: el.name
						});
					});
					wjs().emitJsMessage("[refresh-playlist]");
					wjs().emitJsMessage("[end-scan-library]"+xhr.length);
				} else wjs().emitJsMessage("[end-scan-library]0");
			} });
		} else wjs().emitJsMessage("[end-scan-library]0");
	} else if (event == "[window-bigger]") {
		resizeInBounds(Math.round(win.width*1.1),Math.round(win.height*1.1));
	} else if (event == "[window-smaller]") {
		resizeInBounds(Math.round(win.width*0.9),Math.round(win.height*0.9));
	} else if (event == "[quit]") {
		win.close();
	} else if (event == "[select-library]") {
		if (wjs().fullscreen()) wjs().toggleFullscreen();
		chooseFile('#libraryDialog');
	} else if (event == "[select-download-folder]") {
		if (wjs().fullscreen()) wjs().toggleFullscreen();
		chooseFile('#folderDialog');
	} else if (event.substr(0,13) == "[sleep-timer]") {
		clearTimeout(sleepTimer);
		if (parseInt(event.replace("[sleep-timer]","")) > 0) {
			sleepTimer = setTimeout(function() {
				if (wjs().isPlaying()) wjs().togglePause();
				if (powGlobals.engine) {
					if (wjs().fullscreen()) wjs().fullscreen(false);
					$("#filesList").css("min-height",$("#player_wrapper").height());
					$("html, body").animate({ scrollTop: $("#player_wrapper").height() }, "slow");
					$("body").css("overflow-y","visible");
				}
				wjs().emitJsMessage("[reset-sleep-timer]");
			},parseInt(event.replace("[sleep-timer]","")));
		}
	} else if (event.substr(0,10) == "[save-sub]") {
		saveSub = event.substr(10);
		if (saveSub.indexOf(" ") > -1) {
			localStorage.subLang = saveSub.split(" ")[0];
		} else {
			localStorage.subLang = saveSub;
		}
	} else if (event == "[torrent-data]") {
		if (wjs().fullscreen()) wjs().fullscreen(false);
		win.setMinimumSize(448, 370);
		if ((win.width < 448 && win.height < 370) || (win.width < 448 || win.height < 370)) {
			win.width = 448;
			win.height = 370;
			$("#filesList").css("min-height",448);
			$("html, body").animate({ scrollTop: 448 }, "slow");
		} else {
			$("#filesList").css("min-height",$("#player_wrapper").height());
			$("html, body").animate({ scrollTop: $("#player_wrapper").height() }, "slow");
		}
		$("body").css("overflow-y","visible");
	} else if (event == '[add-video]') {
		chooseFile('#addPlaylistDialog');
	} else if (event == '[start-dlna]') {
		findDlnaClient();
    } else if (event == '[stop-dlna]') {
		if (dlna.controls) dlna.controls.removeAllListeners();
		stopDlna();
	} else if (event.substr(0,15) == '[playlist-swap]') {
		var swapItems = event.replace('[playlist-swap]','').split(':');
		if (parseInt(swapItems[1]) < 0) {
			var tmpVideos = [];
			powGlobals.videos.forEach(function(el,ij) {
				if (ij == (parseInt(swapItems[0]) + parseInt(swapItems[1]))) {
					tmpVideos[ij] = powGlobals.videos[parseInt(swapItems[0])];
				} else if (ij > (parseInt(swapItems[0]) + parseInt(swapItems[1])) && ij <= parseInt(swapItems[0])) {
					tmpVideos[ij] = powGlobals.videos[ij-1];
				} else {
					tmpVideos[ij] = el;
				}
			});
			setTimeout(function() { powGlobals.currentIndex = wjs().currentItem(); },10);
			powGlobals.videos = tmpVideos;
		} else if (parseInt(swapItems[1]) > 1) {
			var tmpVideos = [];
			powGlobals.videos.forEach(function(el,ij) {
				if (ij == parseInt(swapItems[0]) + parseInt(swapItems[1])) {
					tmpVideos[ij] = powGlobals.videos[parseInt(swapItems[0])];
				} else if (ij >= parseInt(swapItems[0]) && ij < (parseInt(swapItems[0]) + parseInt(swapItems[1]))) {
					tmpVideos[ij] = powGlobals.videos[ij+1];
				} else {
					tmpVideos[ij] = el;
				}
			});
			setTimeout(function() { powGlobals.currentIndex = wjs().currentItem(); },10);
			powGlobals.videos = tmpVideos;
		}
	} else if (event == "[scan-library]") {
		scanLibrary();
	} else if (event == "[always-on-top]") {
		if (onTop) {
			onTop = false;
			win.setAlwaysOnTop(false);
		} else {
			setTimeout(win.setAlwaysOnTop(true),1);
			onTop = true;
		}
		wjs().emitJsMessage("[on-top]"+onTop);
	} else if (event == "[check-fullscreen]") {
		if (onTop) {
			onTop = false;
			win.setAlwaysOnTop(onTop);
			wjs().emitJsMessage("[on-top]"+onTop);
			setTimeout(function() { wjs().emitJsMessage("[go-fullscreen]"); },1);
		} else wjs().emitJsMessage("[go-fullscreen]");
	}
}

// get closest number from array
function closest(num, arr) {
	var curr = arr[0];
	var diff = Math.abs (num - curr);
	for (var val = 0; val < arr.length; val++) {
		var newdiff = Math.abs (num - arr[val]);
		if (newdiff < diff) {
			diff = newdiff;
			curr = arr[val];
		}
	}
	return curr;
}