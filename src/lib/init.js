
if (gui.App.argv.length > 0) {
	utils.processArgs(gui.App.argv);
	win.gui.on('loaded', function() {
		if (load.argData.fs) {
			player.fullscreen(true);
			delete load.argData.fs;
		}
		remote.init();
		$("#webchimera").mousedown(function(e){ 
		    if (e.button == 2 && $('#main').css("display") != "table" && $('#inner-in-content').scrollTop() == 0 && !$("#magnetLink").is(":hover")) {
				ctxMenu.playerMenu.popup(e.pageX, e.pageY);
			}
		});
	});
} else {
	win.gui.on('loaded', function() {
		$("#loading").fadeOut(200);
		$('#main').animate({ opacity: 1 },200, function() {
			$("body").css("overflow-x","visible");
			if (!localStorage.didFirst) {
				$(".pl-settings").trigger('click');
				localStorage.didFirst = 1;
			}
		});
		$(document).mousedown(function(e){ 
		    if (e.button == 2 && $('#main').css("display") != "table" && $('#inner-in-content').scrollTop() == 0 && !$("#magnetLink").is(":hover")) {
				ctxMenu.playerMenu.popup(e.pageX, e.pageY);
			}
		});
	});
}

var wcp = require('pw-wcjs-player');

gui.App.on("open",function(msg) {
	if (powGlobals.torrent.engine) {
		if (torrent.timers.peers) clearInterval(torrent.timers.peers);
		if (torrent.timers.setDownload) clearTimeout(torrent.timers.setDownload);
		clearTimeout(torrent.timers.down);
		powGlobals.torrent.engine.swarm.removeListener('wire', onmagnet);
		torrent.killEngine(powGlobals.torrent.engine);
	}
	utils.resetPowGlobals();
	player.stop();
	player.clearPlaylist();
	$('#main').css("display","table");
	utils.processArgs([msg]);
});

playerApi.init();

utils.checkUpdates();

ctxMenu.disable();

if (!utils.fs.paths.vlc()) $("#but-vlc").hide(0);

$(function() { ui.modals.init(); });
