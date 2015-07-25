if (gui.App.argv.length > 0) {
	resetPowGlobals();
	runURL(gui.App.argv[0]);
	win.on('loaded', function() {
		$("#webchimera").mousedown(function(e){ 
		    if (e.button == 2) playerMenu.popup(e.pageX, e.pageY);
		});
	});
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
		$(document).mousedown(function(e){ 
		    if (e.button == 2) playerMenu.popup(e.pageX, e.pageY);
		});
	});
}

var wcp = require('pw-wcjs-player');
var player;

var wjs = function(context) {
    // Call the constructor
	if (player) return player;
	else if (context) return wcp(context);
	else return;
};

// initialize player asynchronously
setTimeout(function() { 
	player = new wcp("#player_wrapper").addPlayer({ autoplay: 1, progressCache: 1, pausePolicy: localStorage.clickPause });
	wjs().onPlaying(isPlaying);
	wjs().onOpening(isOpening);
	wjs().onPosition(changedPosition);
	wjs().onState(changedState);
	wjs().onError(handleErrors);
	wjs().onFrameSetup(gotVideoSize);
	
	wjs().onEnded(function() { disableCtxMenu(); });
	wjs().onStopped(function() { disableCtxMenu(); });
	
	attachDlnaHandlers();
	
	playerLoaded = true;
	if (gui.App.argv.length > 0) {
		$('#main').css("display","none");
		$('#player_wrapper').css("min-height","100%").css("height","100%").css("width","auto");
		
		if (asyncPlaylist.preBufZero) wjs().setOpeningText("Prebuffering ...");
		if (asyncPlaylist.addPlaylist && asyncPlaylist.addPlaylist.length > 0 && asyncPlaylist.noPlaylist === false) {
			asyncPlaylist.addPlaylist.forEach(function(e) { wjs().addPlaylist(e); });
		}
		
		if (asyncPlaylist.loadLocal) {
			wjs().setOpeningText("Loading resource");
			wjs().startPlayer();
		}

		asyncPlaylist = {};

		$("#loading").hide(0);
	}
},1);
// end initialize player asynchronously

checkUpdates();

// if powder was updated, delete the package file to save space
fs.stat(gui.App.dataPath+'\\updater.exe', function(err,stat) { if (err == null) fs.unlink(gui.App.dataPath+'\\updater.exe'); });

// position the window for the first time
resizeInBounds(win.width,win.height);

disableCtxMenu();
