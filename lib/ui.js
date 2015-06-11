$("#max-peers").text(localStorage.maxPeers);
$("#spinner").val(localStorage.maxPeers);
$("#def-folder").text(localStorage.tmpDir);
if (localStorage.libDir == "Temp") {
	$("#lib-folder").text("same as Download Folder");
} else $("#lib-folder").text(localStorage.libDir);
if (localStorage.clickPause == 'fullscreen') {
	$("#click-pause").text("only in Fullscreen");
} else $("#click-pause").text("Fullscreen + Windowed");
$('#open-url').css('top', Math.round(($(window).height() - 187) / 2)+'px');

$('#magnetLink').mousedown(function(event) {
    if (event.which == 3) {
		var clipboard = gui.Clipboard.get();
		$('#magnetLink').val(clipboard.get('text')).select();
    }
});

$(document).ready(function() {
	// initiate progress bars
    $('.progress .progress-bar').progressbar({display_text: 'center'});
	
	// initiate max peers selector (settings)
	$('#spinner').spinner({
		min: 10,
		max: 10000,
		step: 10
	});
	$('.ui-spinner').css("display","none");

});

function getReadableFileSizeString(fileSizeInBytes) {
    var i = -1;
    var byteUnits = [' kB', ' MB', ' GB', ' TB', 'PB', 'EB', 'ZB', 'YB'];
    do {
        fileSizeInBytes = fileSizeInBytes / 1024;
        i++;
    } while (fileSizeInBytes > 1024);
    return Math.max(fileSizeInBytes, 0.1).toFixed(1) + byteUnits[i];
}

function changeClickPause() {
	if (localStorage.clickPause == 'fullscreen') {
		$("#click-pause").text("Fullscreen + Windowed");
		localStorage.clickPause = "both";
		wjs().emitJsMessage("[pause-policy]both");
	} else {
		$("#click-pause").text("only in Fullscreen");
		localStorage.clickPause = "fullscreen";
		wjs().emitJsMessage("[pause-policy]fullscreen");
	}
}

function openPeerSelector() {
	if($('#max-peers').is(':visible')) $('#max-peers').hide(0,function() { $('.ui-spinner').show(0); })
}

$('#max-peers-hov').hover(function() { }, function() {
	if ($('.ui-spinner').is(":hover") === false) if ($('.ui-spinner').is(':visible')) $('.ui-spinner').hide(0,function() {
		$('#max-peers').text($('#spinner').val()).show(0);
		localStorage.maxPeers = parseInt($('#spinner').val());
	})
});

function playEl(kj) {
	if ($("#action"+kj).hasClass("play")) {
		$("#action"+kj).removeClass("play").addClass("pause").css("background-color","#F6BC24").attr("onClick","pauseEl("+kj+")");
		powGlobals.engine.files[powGlobals.files[kj].index].select();
	}
}

function pauseEl(kj) {
	if ($("#action"+kj).hasClass("pause")) {
		$("#action"+kj).removeClass("pause").addClass("play").css("background-color","#FF704A").attr("onClick","playEl("+kj+")");
		powGlobals.engine.files[powGlobals.files[kj].index].deselect();
	}
}

function settingsEl(kj) {
	if (parseInt($("#progressbar"+kj).attr("data-transitiongoal")) > 0) {
		$("#openAction").attr("onClick","gui.Shell.openItem(powGlobals['engine'].path+'\\\\'+powGlobals['engine'].files[powGlobals['files']["+kj+"].index].path); $('#closeAction').trigger('click'); playEl("+kj+")");
		$("#openFolderAction").attr("onClick","gui.Shell.showItemInFolder(powGlobals['engine'].path+'\\\\'+powGlobals['engine'].files[powGlobals['files']["+kj+"].index].path); $('#closeAction').trigger('click')");
		$("#openAction").show(0);
		$("#openFolderAction").show(0);
	} else {
		$("#openAction").hide(0);
		$("#openFolderAction").hide(0);
	}
	if (supportedVideo.indexOf($("#file"+kj).find(".filenames").text().split(".").pop().toLowerCase()) > -1) {
		// if the item is a video
		powGlobals.videos.some(function(el,ij) {
			if (el.index == kj) {
				$("#playAction").attr("onClick","wjs().playItem("+ij+"); $('#closeAction').trigger('click'); $('html, body').animate({ scrollTop: 0 }, 'slow'); playEl("+kj+"); $('body').css('overflow-y','hidden')");
				$("#copyStream").attr("onClick","gui.Clipboard.get().set('http://localhost:'+powGlobals['engine'].server.address().port+'/"+powGlobals.files[kj].index+"','text'); $('#closeAction').trigger('click')");
				$("#playAction").show(0);
				$("#copyStream").show(0);
				return false;
			}
		});
	} else {
		$("#playAction").hide(0);
		$("#copyStream").hide(0);
	}
	$("#open-file-settings").trigger("click");
}

function goBack(nextTorrent) {
	if (castData.casting) stopDlna();
	if (peerInterval) clearInterval(peerInterval);
	if (delaySetDownload) clearTimeout(delaySetDownload);
	savedHistory = 0;
	pitem["#webchimera"] = 0;
	if (typeof nextTorrent === 'undefined') {
		window.scrollTo(0, 0);
		wjs().setOpeningText("Stopping");
		wjs().emitJsMessage("[tor-data-but]0");
		wjs().emitJsMessage("[refresh-disabled]");
		wjs().fullscreen(false);
		$("#header_container").css("display","none");
		$("body").css("overflow-y","hidden");
		if (parseInt($("#main").css("opacity")) == 0) $("#main").css("opacity","1");
		$('#main').css("display","table");	
		document.getElementById('magnetLink').value = "";
		$('#player_wrapper').css("min-height","1px").css("height","1px").css("width","1px");
		win.setMinimumSize(530, 440);
	
		if ((win.width < 530 && win.height < 440) || (win.width < 530 || win.height < 440)) {
			win.width = 530;
			win.height = 440;
		}
	
		if (onTop) {
			onTop = false;
			win.setAlwaysOnTop(false);
			wjs().emitJsMessage("[on-top]"+onTop);
		}

		if ($(window).height() < $("#main").height() && win.zoomLevel == 0) {
			if (win.zoomLevel > -1) win.zoomLevel = -1;
		} else if ($(window).width() < $("#main").width() && win.zoomLevel == 0) {
			if (win.zoomLevel > -1) win.zoomLevel = -1;
		} else if ($(window).width() > 730 && $(window).height() > 650 && win.zoomLevel == -1) {
			if (win.zoomLevel < 0) win.zoomLevel = 0;
		}
		$('#open-url').css('top', Math.round(($(window).height() - 187) / 2)+'px');
		wjs().clearPlaylist();
	} else {
		wjs().setOpeningText("Loading resource");
		wjs().emitJsMessage("[temp-splash]");
	}
	wjs().setDownloaded(0);
	if (powGlobals.engine) {
		isReady = 0;
		clearTimeout(downSpeed);
		powGlobals.engine.swarm.removeListener('wire', onmagnet);
		if (nextStartDlna) { dlna.controls.stop(); }
		powGlobals.engine.server.close(function() {
			powGlobals.engine.remove(function() {
				powGlobals.engine.destroy();
				powGlobals = [];
				if (typeof nextTorrent !== 'undefined') {
					resetPowGlobals();
					runURL(nextTorrent,false);
				}
			});
		});
	} else {
		if (typeof nextTorrent !== 'undefined') {
			resetPowGlobals();
			runURL(nextTorrent,false);
		}
	}
	
	firstTime = 0;
	if (typeof nextTorrent === 'undefined') {
		firstTimeEver = 1;
		win.title = "Powder Player";
	}
}

function printHistory() {
	$("#history-list").html("");
	historyObject = JSON.parse(localStorage.history);
	oi = 0;
	if (historyObject[oi.toString()]) {
		generateHistory = "";
		for (oi = 0; historyObject[oi.toString()]; oi++) {
			generateHistory += '<div onClick="wjs().loadHistory(JSON.parse(localStorage.history)['+oi.toString()+']); return false" class="actionButton history-item">'+historyObject[oi.toString()].title+'</div>';
		}
		if (oi < 7) $("#history-list").css('overflowY', 'auto');
		else $("#history-list").css('overflowY', 'scroll');
		$("#history-list").html(generateHistory);
	} else {
		generateHistory = "<div class=\"history-empty\">Your history is empty, watch something first.</span>";
		$("#history-list").css('overflowY', 'auto');
		$("#history-list").html(generateHistory);
	}
}