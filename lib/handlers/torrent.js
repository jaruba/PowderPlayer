function checkDownloaded(piece) {
	powGlobals.lastDownloadTime = Math.floor(Date.now() / 1000);
	if (firstTime == 0) {
		if (prebuf == 0) {
			prebuf = 20;
		} else if (prebuf == 20) {
			prebuf = 50;
		} else if (prebuf == 50) {
			prebuf = 70;
		} else if (prebuf == 70) {
			prebuf = 80;
		} else if (prebuf == 80) {
			prebuf = 90;
		} else if (prebuf == 90) {
			prebuf = Math.floor(((100 - prebuf) /2) +prebuf);
		}
		if (wjs().plugin) wjs().setOpeningText("Prebuffering "+prebuf+"%");
	}
	powGlobals.videos.forEach(function(el,ij) {
		if (piece >= el.firstPiece && piece <= el.lastPiece && piece > 0) {
			if (el.downloaded +1 == piece - el.firstPiece) {
				powGlobals.videos[ij].downloaded = el.downloaded = el.downloaded+1;
			} else {
				torPieces.push(piece);
				torPieces.sort(function(a,b){return a-b});
			}
			if (torPieces.indexOf(el.downloaded +1 +el.firstPiece) > -1) {
				var torIndex = torPieces.indexOf(el.downloaded +1 +el.firstPiece);
				while ((el.downloaded +1 +el.firstPiece) == torPieces[torIndex]) {
					powGlobals.videos[ij].downloaded = el.downloaded = el.downloaded+1;
					torPieces.splice(torIndex, 1);
				}
			}
			if (ij == wjs().currentItem()) {
				if ((el.downloaded / (el.lastPiece - el.firstPiece)) > el.lastSent) {
					powGlobals.videos[ij].lastSent = el.lastSent = (el.downloaded / (el.lastPiece - el.firstPiece));
					if (typeof wjs() !== 'undefined' && wjs().setDownloaded) {
						clearTimeout(delaySetDownload);
						delaySetDownload = setTimeout(delayNewSetDownload(el.lastSent),500);
					}
				}
			} else {
				if ((el.downloaded / (el.lastPiece - el.firstPiece)) > el.lastSent) {
					powGlobals.videos[ij].lastSent = el.lastSent = (el.downloaded / (el.lastPiece - el.firstPiece));
				}
			}
		}
	});

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
				if (wjs().state() != "playing") win.requestAttention(true);
			}
		} else {
			$('#all-download .progress-bar').attr('data-transitiongoal', updDownload).progressbar({display_text: 'center'});
			if (focused === false && $('#main').css("display") != "table" && powGlobals.engine && powGlobals.hasVideo == 0) win.setProgressBar(parseInt(updDownload)/100);
		}
	}

	powGlobals.files.forEach(function(el,ij) {
		if (piece >= el.firstPiece && piece <= el.lastPiece && piece > 0) {
			powGlobals.files[ij].downloaded = el.downloaded = el.downloaded+1;
			updDownload = Math.floor((el.downloaded / (el.lastPiece - el.firstPiece)) *100);
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
				}
			}
		}
	});
}

function checkSpeed() {
	if ($('#all-download .progress-bar').attr('data-transitiongoal') < 100) {
		if (powGlobals.speedPiece < powGlobals.allPieces) {
			tempText = (powGlobals.allPieces - powGlobals.speedPiece) /3;
			$("#speed").text(getReadableFileSizeString(Math.floor(tempText * powGlobals.engine.torrent.pieceLength))+"/s");
		} else $("#speed").text("0.0 kB/s");
		powGlobals.speedPiece = powGlobals.allPieces;
		downSpeed = setTimeout(function(){ checkSpeed(); }, 3000);
	} else {
		$("#speed").text("0.0 kB/s");
	}
}

function peerCheck() {
	if (powGlobals.engine.swarm.wires.length > 0) {
		if (isReady == 0) {
			powGlobals.seeds = powGlobals.engine.swarm.wires.length;
			if (wjs().plugin) wjs().setOpeningText("Connected to "+powGlobals.seeds+" peers");
		}
	}
	$("#nrPeers").text(powGlobals.engine.swarm.wires.length);
	
	// if more then 1 minute has past since last downloaded piece, restart peer discovery
	if (Math.floor(Date.now() / 1000) - powGlobals.lastDownloadTime > 60) {
		if ($(".pause:visible").length > 0) {
			if (powGlobals.engine) {
				if (powGlobals.engine.amInterested) {
					if (wjs().state() != "opening") {
						powGlobals.lastDownloadTime = Math.floor(Date.now() / 1000);
						powGlobals.engine.discover();
					}
				}
			}
		}
	}
}

var onmagnet = function () { peerCheck(); }