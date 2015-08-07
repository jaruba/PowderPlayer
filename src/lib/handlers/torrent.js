function delayCheckDown(savedPiece) {
	return function() {
		checkDownloaded(savedPiece);
	}
}
function checkDownloaded(piece) {
	if (powGlobals.engine && powGlobals.engine.torrent) {
		if (downloadWorking) {
			setTimeout(delayCheckDown(piece),1000);
		} else {
			downloadWorking = true;
			isRecursive = false;
			powGlobals.lastDownloadTime = Math.floor(Date.now() / 1000);
			powGlobals.allPieces++;
			if (powGlobals.allPieces * powGlobals.engine.torrent.pieceLength <= powGlobals.engine.torrent.length) {
				$("#downPart").text(getReadableFileSizeString(Math.floor(powGlobals.allPieces * powGlobals.engine.torrent.pieceLength)));
			} else {
				$("#downPart").text(getReadableFileSizeString(Math.floor(powGlobals.engine.torrent.length)));
			}
			updDownload = Math.floor((powGlobals.allPieces / (((powGlobals.engine.torrent.length - powGlobals.engine.torrent.lastPieceLength) / powGlobals.engine.torrent.pieceLength) +1)) *100);
			if (updDownload != powGlobals.lastDownload) {
				powGlobals.lastDownload = updDownload;
				if (updDownload >= 100) {
					$('#all-download .progress-bar').removeClass("progress-bar-warning").addClass("progress-bar-danger").attr('data-transitiongoal', 100).progressbar();
					if ($('#downloadPercent').text() != '100%') $('#downloadPercent').text('100%');
					if (!focused) {
						win.setProgressBar(-0.1);
						if (keepState != "playing" && !focused && !dlna.initiated) win.requestAttention(true);
					}
				} else {
					$('#all-download .progress-bar').attr('data-transitiongoal', updDownload).progressbar();
					if ($('#downloadPercent').text() != updDownload+'%') $('#downloadPercent').text(updDownload+'%');
					if (focused === false && $('#main').css("display") != "table" && powGlobals.engine && powGlobals.hasVideo == 0) win.setProgressBar(parseInt(updDownload)/100);
				}
			}
			var foundFirstPiece = false;
			var foundLastPiece = false;
			powGlobals.files.some(function(el,ij) {
				if (piece >= el.firstPiece && piece <= el.lastPiece && piece >= 0) {
					powGlobals.files[ij].downloaded = el.downloaded = el.downloaded+1;
					updDownload = Math.floor((el.downloaded / (el.lastPiece - el.firstPiece)) *100);
					if (powGlobals.videos[wjs().currentItem()] && ij == powGlobals.videos[wjs().currentItem()].index && wjs().state() == "opening") {
						if (firstTime == 0) {
							tempPrebuf = Math.floor((el.downloaded / (el.lastPiece - el.firstPiece)) *100*45);
							if (tempPrebuf <= 100 && tempPrebuf > prebuf) {
								prebuf = tempPrebuf;
								if (playerLoaded && !stopPrebuf) wjs().setOpeningText("Prebuffering "+prebuf+"%");
							} else if (tempPrebuf > 100 && !stopPrebuf) wjs().setOpeningText("Opening Video");
						}
					}
					
					if (powGlobals.hasVideo > 0 && el.isVideo) {
						if (powGlobals.videos[wjs().currentItem()].index == ij) {
							eli = powGlobals.videos[el.vIndex];
							if ((el.downloaded / (el.lastPiece - el.firstPiece)) > eli.lastSent) {
								powGlobals.videos[wjs().currentItem()].lastSent = (el.downloaded / (el.lastPiece - el.firstPiece));
								if (typeof wjs() !== 'undefined' && wjs().setDownloaded) {
									clearTimeout(delaySetDownload);
									delaySetDownload = setTimeout(delayNewSetDownload(eli.lastSent),500);
								}
							}
						}
					}
					
					if (updDownload != el.lastDownload) {
						newFileSize = Math.floor(el.byteLength * (updDownload /100));
						if (newFileSize > el.byteLength) {
							$("#down-fl"+ij).text(getReadableFileSizeString(Math.floor(el.byteLength)));
						} else {
							$("#down-fl"+ij).text(getReadableFileSizeString(Math.floor(el.byteLength * (updDownload /100))));
						}
						powGlobals.files[ij].lastDownload = el.lastDownload = updDownload;
						if (updDownload >= 100) {
							// give some time for the file to write then declare the video as finished
							setTimeout(delayFinished(ij),20000);
							
							if ($("#action"+ij).hasClass("pause")) {
								$("#action"+ij).removeClass("pause").addClass("settings").attr("onClick","settingsEl("+ij+")");
							} else if ($("#action"+ij).hasClass("play")) {
								$("#action"+ij).removeClass("play").addClass("settings").attr("onClick","settingsEl("+ij+")");
							}
							$('#p-file'+ij).circleProgress('value', 1);
						} else {
							$('#p-file'+ij).circleProgress('value', updDownload/100);
							if (localStorage.useVLC == "1") {
								if (updDownload >= 5 && !powGlobals.engine.files[el.index].selected) {
									playEl(ij);
								} else if (updDownload < 5 && powGlobals.engine.files[el.index].selected && $("#action"+ij).hasClass("play")) {
									$("#action"+ij).removeClass("play").addClass("pause").css("background-color","#F6BC24").attr("onClick","pauseEl("+ij+")");
								}
							}
						}
					}
					if (piece > el.firstPiece && piece < el.lastPiece) return true;
					if (piece == el.firstPiece) foundFirstPiece = true;
					if (piece == el.lastPiece) foundLastPiece = true;
					if (foundFirstPiece && foundLastPiece) return true;
				}
			});
			downloadWorking = false;
		}
	} else downloadWorking = false;
}

function checkSpeed() {
	if ($('#all-download .progress-bar').attr('data-transitiongoal') < 100) {
		if (powGlobals.speedPiece < powGlobals.allPieces) {
			tempText = (powGlobals.allPieces - powGlobals.speedPiece) /3;
			$("#speed").text(getReadableFileSizeString(Math.floor(tempText * powGlobals.engine.torrent.pieceLength))+"/s");
			powGlobals.speedUpdate = Math.floor(Date.now() / 1000);
		} else if (Math.floor(Date.now() / 1000) - powGlobals.speedUpdate > 9) {
			$("#speed").text("0.0 kB/s");
		}
		powGlobals.speedPiece = powGlobals.allPieces;
		downSpeed = setTimeout(function(){ checkSpeed(); }, 3000);
	} else $("#speed").text("0.0 kB/s");
}

function peerCheck() {
	if (powGlobals.engine.swarm.wires.length > 0) {
		if (isReady == 0) {
			powGlobals.seeds = powGlobals.engine.swarm.wires.length;
			if (playerLoaded) wjs().setOpeningText("Connected to "+powGlobals.seeds+" peers");
		}
	}
	$("#nrPeers").text(powGlobals.engine.swarm.wires.length);
	
	// if more then 1 minute has past since last downloaded piece, restart peer discovery
	if (Math.floor(Date.now() / 1000) - powGlobals.lastDownloadTime > 60) {
		if ($(".pause:visible").length > 0) {
			if (powGlobals.engine) {
				if (powGlobals.engine.amInterested) {
					if (keepState != "opening") {
						powGlobals.lastDownloadTime = Math.floor(Date.now() / 1000);
						powGlobals.engine.discover();
					}
				}
			}
		}
	}
}

function announceNoPeers() {
	if (wjs().currentItem() == 0 && keepState == "opening") {
		if (powGlobals.engine.swarm.wires.length == 0) wjs().setOpeningText("No Peers Found");
		setTimeout(function() { announceNoPeers(); },5000);
	}
}

function killEngine(targetEngine) {
	targetEngine.server.close(function(dyingEngine) {
		return function() {
			dyingEngine.remove(function(deadEngine) {
				return function() {
					deadEngine.destroy(function() {
						waitForNext = false;
					});
				}
			}(dyingEngine));
		}
	}(targetEngine));
}

var onmagnet = function () { peerCheck(); }