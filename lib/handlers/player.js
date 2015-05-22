// detect if playlist item is a youtube link
function isYoutube(plItem) {
	if (wjs().plugin.playlist.items[plItem].mrl.indexOf("googlevideo.com") > -1 || wjs().plugin.playlist.items[plItem].mrl.indexOf("youtube.com/watch") > -1) return true;
	else return false;
}

function isPlaying() {
	if (doSubsLocal == 1 && typeof powGlobals.engine === 'undefined') {
		wjs().setDownloaded(0.0000000000000000001);
		doSubsLocal = 0;
		getLength();
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

function isOpening() {
	if (powGlobals.currentIndex != wjs().currentItem()) {
		delete powGlobals.duration;
		delete powGlobals.fileHash;
		savedHistory = 0;
		subVoteSent = 0;
		powGlobals.currentIndex = wjs().currentItem();
		if (powGlobals.engine) {
			if (wjs().plugin) wjs().setOpeningText("Prebuffering 0%");
			if (typeof powGlobals.videos[wjs().currentItem()] !== 'undefined' && typeof powGlobals.videos[wjs().currentItem()].local === 'undefined') {
				powGlobals.files.some(function(el,ij) { if (el.index == powGlobals.videos[wjs().currentItem()].index) { playEl(ij); return false; } });
			}
			win.title = getName(powGlobals.videos[wjs().currentItem()].filename);
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
			if (wjs().plugin) wjs().setOpeningText("Prebuffering");
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
		if (wjs().currentItem() < (parseInt(wjs().itemCount()) -1)) {
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
			historyObject["0"].playlist = {};
			for (ijk = 0; ijk < parseInt(this.itemCount()); ijk++) {
				historyObject["0"].playlist[ijk.toString()] = {};
				historyObject["0"].playlist[ijk.toString()].title = this.plugin.playlist.items[ijk].title.replace("[custom]","");
				if (this.plugin.playlist.items[ijk].mrl.substr(0,17) == "http://localhost:" && isNaN(this.plugin.playlist.items[ijk].mrl.split("/").pop()) === false) {
					historyObject["0"].playlist[ijk.toString()].mrl = parseInt(this.plugin.playlist.items[ijk].mrl.split("/").pop());
				} else {
					historyObject["0"].playlist[ijk.toString()].mrl = this.plugin.playlist.items[ijk].mrl;
				}
			}
			for (oi = 0; historyObject[oi.toString()]; oi++) { if (oi > 19) delete historyObject[oi.toString()]; }
			localStorage.history = JSON.stringify(historyObject);
		}
	}
}

function changedState() {
	if (this.state() != lastState) {

		// detect unsupported media types
		if ((lastState == "opening" || lastState == "playing" || lastState == "") && (this.state() == "ended" && parseInt(wjs().itemCount()) == 1 && firstTimeEver == 1) && (!isYoutube(wjs().currentItem()))) {
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
    if (event == "[go-back]") {
		goBack();
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
	} else if (event == "[fix-length]") {
		if (typeof powGlobals.duration !== 'undefined') {
			wjs().setTotalLength(powGlobals.duration);
		} else {
			if (powGlobals.filename && powGlobals.hash && powGlobals.byteLength) {
				checkInternet(function(isConnected) {
					if (isConnected) {
						$.ajax({ type: 'GET', url: window.atob("aHR0cDovL3Bvd2Rlci5tZWRpYS9tZXRhRGF0YS9nZXQucGhwP2Y9")+encodeURIComponent(powGlobals.filename)+window.atob("Jmg9")+encodeURIComponent(powGlobals.hash)+window.atob("JnM9")+encodeURIComponent(powGlobals.byteLength), dataType: 'json', global: false, cache: false, success: getDuration });
						return false;
					}
				});
			}
			fileExists();
		}
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
