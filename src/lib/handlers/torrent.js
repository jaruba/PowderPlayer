function delayCheckDown(savedPiece) {
	return function() {
		checkDownloaded(savedPiece);
	}
}
function delayLoopDown(el,ij,torIndex) {
	return function() {
		loopDownloaded(el,ij,torIndex);
	}
}
function loopDownloaded(el,ij,torIndex) {
	if (powGlobals.videos && powGlobals.videos[ij]) {
		if ((el.downloaded +1 +el.firstPiece) == torPieces[torIndex]) {
			  powGlobals.videos[ij].downloaded = el.downloaded = el.downloaded+1;
			  torPieces.splice(torIndex, 1);
			  setTimeout(delayLoopDown(el,ij,torIndex),100);
		} else {
			if (ij == keepCurrent) {
				if ((el.downloaded / (el.lastPiece - el.firstPiece)) > el.lastSent) {
					powGlobals.videos[ij].lastSent = el.lastSent = (el.downloaded / (el.lastPiece - el.firstPiece));
					if (typeof wjs() !== 'undefined' && wjs().setDownloaded) {
						clearTimeout(delaySetDownload);
						delaySetDownload = setTimeout(delayNewSetDownload(el.lastSent),1000);
					}
				}
			} else {
				if ((el.downloaded / (el.lastPiece - el.firstPiece)) > el.lastSent) {
					powGlobals.videos[ij].lastSent = el.lastSent = (el.downloaded / (el.lastPiece - el.firstPiece));
				}
			}
			downloadWorking = false;
		}
	}
}
var isRecursive = false;
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
					$('#all-download .progress-bar').removeClass("progress-bar-warning").addClass("progress-bar-danger").attr('data-transitiongoal', 100).progressbar({display_text: 'center'});
					if (!focused) {
						win.setProgressBar(-0.1);
						if (keepState != "playing") win.requestAttention(true);
					}
				} else {
					$('#all-download .progress-bar').attr('data-transitiongoal', updDownload).progressbar({display_text: 'center'});
					if (focused === false && $('#main').css("display") != "table" && powGlobals.engine && powGlobals.hasVideo == 0) win.setProgressBar(parseInt(updDownload)/100);
				}
			}
			var foundFirstPiece = false;
			var foundLastPiece = false;
			if (powGlobals.videos && powGlobals.videos.length) {
				powGlobals.videos.some(function(el,ij) {
					if (el.path != "unknown" && piece >= el.firstPiece && piece <= el.lastPiece && piece > 0) {
						if (el.downloaded +1 == piece - el.firstPiece) {
							powGlobals.videos[ij].downloaded = el.downloaded = el.downloaded+1;
						} else {
							torPieces.push(piece);
							torPieces.sort(function(a,b){return a-b});
						}
						if (torPieces.indexOf(el.downloaded +1 +el.firstPiece) > -1) {
							var torIndex = torPieces.indexOf(el.downloaded +1 +el.firstPiece);
							setTimeout(delayLoopDown(el,ij,torIndex),0);
							isRecursive = true;
						} else {
							if (ij == keepCurrent) {
								if ((el.downloaded / (el.lastPiece - el.firstPiece)) > el.lastSent) {
									powGlobals.videos[ij].lastSent = el.lastSent = (el.downloaded / (el.lastPiece - el.firstPiece));
									if (typeof wjs() !== 'undefined' && wjs().setDownloaded) {
										clearTimeout(delaySetDownload);
										delaySetDownload = setTimeout(delayNewSetDownload(el.lastSent),1000);
									}
								}
							} else {
								if ((el.downloaded / (el.lastPiece - el.firstPiece)) > el.lastSent) {
									powGlobals.videos[ij].lastSent = el.lastSent = (el.downloaded / (el.lastPiece - el.firstPiece));
								}
							}
						}
						if (typeof el.index !== 'undefined') {
							eli = powGlobals.files[el.index];
							powGlobals.files[el.index].downloaded = eli.downloaded = eli.downloaded+1;
							updDownload = Math.floor((eli.downloaded / (eli.lastPiece - eli.firstPiece)) *100);
							if (powGlobals.videos[keepCurrent] && el.index == powGlobals.videos[keepCurrent].index && keepState == "opening") {
								if (firstTime == 0) {
									tempPrebuf = Math.floor((eli.downloaded / (eli.lastPiece - eli.firstPiece)) *100*45);
									if (tempPrebuf <= 100 && tempPrebuf > prebuf) {
										prebuf = tempPrebuf;
										if (playerLoaded && keepState != "playing" && keepState != "paused" && !stopPrebuf) wjs().setOpeningText("Prebuffering "+prebuf+"%");
									} else if (tempPrebuf > 100 && !stopPrebuf) wjs().setOpeningText("Opening Video");
								}
							}
							if (updDownload != eli.lastDownload) {
								newFileSize = Math.floor(eli.byteLength * (updDownload /100));
								if (newFileSize > eli.byteLength) {
									$("#down-fl"+el.index).text(getReadableFileSizeString(Math.floor(eli.byteLength)));
								} else {
									$("#down-fl"+el.index).text(getReadableFileSizeString(Math.floor(eli.byteLength * (updDownload /100))));
								}
								powGlobals.files[el.index].lastDownload = eli.lastDownload = updDownload;
								if (updDownload >= 100) {
									// give some time for the file to write then declare the video as finished
									setTimeout(delayFinished(el.index),20000);
									
									$("#action"+el.index).removeClass("pause").addClass("settings").attr("onClick","settingsEl("+el.index+")");
									$('#p-file'+el.index+' .progress-bar').removeClass("progress-bar-info").addClass("progress-bar-success").attr('data-transitiongoal', 100).progressbar({display_text: 'center'});
								} else {
									$('#p-file'+el.index+' .progress-bar').attr('data-transitiongoal', updDownload).progressbar({display_text: 'center'});
								}
							}
						}
						if (piece > el.firstPiece && piece < el.lastPiece) return true;
						if (piece == el.firstPiece) foundFirstPiece = true;
						if (piece == el.lastPiece) foundLastPiece = true;
						if (foundFirstPiece && foundLastPiece) return true;
					}
				});
			} else {
				powGlobals.files.some(function(el,ij) {
					if (piece >= el.firstPiece && piece <= el.lastPiece && piece > 0) {
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
								
								$("#action"+ij).removeClass("pause").addClass("settings").attr("onClick","settingsEl("+ij+")");
								$('#p-file'+ij+' .progress-bar').removeClass("progress-bar-info").addClass("progress-bar-success").attr('data-transitiongoal', 100).progressbar({display_text: 'center'});
							} else {
								$('#p-file'+ij+' .progress-bar').attr('data-transitiongoal', updDownload).progressbar({display_text: 'center'});
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
			}
			if (!isRecursive) downloadWorking = false;
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

var onmagnet = function () { peerCheck(); }