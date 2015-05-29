if (gui.App.argv.length > 0) {
	resetPowGlobals();
	runURL(gui.App.argv[0]);
} else {
	win.on('loaded', function() {
		$("#loading").fadeOut(200);
		$('#main').animate({ opacity: 1 },200, function() {
			$("body").css("overflow-x","visible");
			if (!localStorage.didFirst) {
				$(".pl-settings").trigger('click');
				localStorage.didFirst = 1;
			}
		});
	});
}

// initialize player asynchronously
setTimeout(function() { 
	wjs("#player_wrapper").addPlayer({ id: "webchimera", theme: "sleek", autoplay: 1, progressCache: 1, pausePolicy: localStorage.clickPause });
	wjs().onMessage(handleMessages);
	wjs().onPlaying(isPlaying);
	wjs().onOpening(isOpening);
	wjs().onPosition(changedPosition);
	wjs().onState(changedState);
	wjs().onError(handleErrors);
	playerLoaded = true;
	if (gui.App.argv.length > 0) {
		$('#main').css("display","none");
		$('#player_wrapper').css("min-height","100%").css("height","100%").css("width","auto");
		
		if (asyncPlaylist.torDataBut) wjs().emitJsMessage("[tor-data-but]1");
		if (asyncPlaylist.preBufZero) wjs().setOpeningText("Prebuffering ...");
		if (asyncPlaylist.addPlaylist && asyncPlaylist.addPlaylist.length > 0 && asyncPlaylist.noPlaylist === false) {
			asyncPlaylist.addPlaylist.forEach(function(e) { wjs().addPlaylist(e); });
			wjs().emitJsMessage("[refresh-playlist]");
		}
		if (asyncPlaylist.refreshDisabled) wjs().emitJsMessage("[refresh-disabled]");
		
		wjs().emitJsMessage("[saved-sub]"+localStorage.subLang);

		if (asyncPlaylist.loadLocal) {
			wjs().setOpeningText("Loading resource");
			wjs().startPlayer();
			wjs().emitJsMessage("[gobackvar]0");
			wjs().emitJsMessage("[refresh-disabled]");
		}

//		if (asyncPlaylist.didDiscover) if (powGlobals.engine) powGlobals.engine.discover();

		asyncPlaylist = {};

		$("#loading").fadeOut(200);
	}
},1);
// end initialize player asynchronously

checkUpdates();

// if powder was updated, delete the package file to save space
fs.stat(gui.App.dataPath+'\\updater.exe', function(err,stat) { if (err == null) fs.unlink(gui.App.dataPath+'\\updater.exe'); });

// position the window for the first time
resizeInBounds(win.width,win.height);
