gui.Screen.Init();
var win = gui.Window.get();
win.zoomLevel = -1;

win.on('focus', function() { focused = true; win.setProgressBar(-0.1); }); 
win.on('blur', function() {
	focused = false;
	if ($('#main').css("display") != "table" && typeof powGlobals.engine !== 'undefined' && powGlobals.hasVideo == 0 && parseInt($('#all-download .progress-bar').attr('data-transitiongoal')) < 100) win.setProgressBar(parseInt($('#all-download .progress-bar').attr('data-transitiongoal'))/100);
	if (wjs().plugin) wjs().emitJsMessage("[hide-context-menu]");
}); 
win.on('close', function() {
	
	if ($('#main').css("display") != "table") {
		if (powGlobals.engine && powGlobals.hasVideo == 0) var r = confirm("Are you sure? This action will delete all downloaded files.");
		else r = true;
		if (r) {
			setTimeout(function() { win.close(true); },180000); // fallback, if any error appears and the process didn't finish, the app should still close (3 mins)
			win.hide();
			if ($('#main').css("display") != "table") wjs().stopPlayer();
			if (powGlobals.engine) {
				isReady = 0;
				clearTimeout(downSpeed);
				powGlobals.engine.swarm.removeListener('wire', onmagnet);
				powGlobals.engine.server.close(function() {
					powGlobals.engine.remove(function() {
						powGlobals.engine.destroy(function() {
							win.close(true);
						});
					});
				});
			} else {
				win.close(true);
			}
		}
	} else win.close(true);
});

$.fn.scrollEnd = function(callback, timeout) {          
  $(this).scroll(function(){
    var $this = $(this);
    if ($this.data('scrollTimeout')) {
      clearTimeout($this.data('scrollTimeout'));
    }
    $this.data('scrollTimeout', setTimeout(callback,timeout));
  });
};

$(window).scrollEnd(function(){
    if ($(document).scrollTop() == 0) if (powGlobals.engine) if (powGlobals.hasVideo > 0) {
		if ($("body").css("overflow-y") == "visible" || $("body").css("overflow-y") == "auto") $("body").css("overflow-y","hidden");
		win.setMinimumSize(300, 210);
		if (!wjs().isPlaying()) wjs().togglePause();
	}
}, 1000);

$(window).resize(function() {
	if ($('#main').css("display") == "table") {
		if ($(window).height() < $("#main").height() && win.zoomLevel == 0) {
			if (win.zoomLevel > -1) win.zoomLevel = -1;
		} else if ($(window).width() < $("#main").width() && win.zoomLevel == 0) {
			if (win.zoomLevel > -1) win.zoomLevel = -1;
		} else if ($(window).width() > 730 && $(window).height() > 650 && win.zoomLevel == -1) {
			if (win.zoomLevel < 0) win.zoomLevel = 0;
		}
		$('#open-url').css('top', Math.round(($(window).height() - 187) / 2)+'px');
	} else {
		if (win.zoomLevel != 0) win.zoomLevel = 0;
		$("#filesList").css("min-height",$("#player_wrapper").height());
	}
});

function resizeInBounds(newWidth,newHeight) {
	// find the screen where the window is
	gui.Screen.screens.some(function(screen,i) {
		// check if the window is horizontally inside the bounds of this screen
		var inTheScreen = 0;
		if (parseInt(win.x) > parseInt(screen.bounds.x) && parseInt(win.x) < (parseInt(screen.bounds.x) + parseInt(screen.work_area.width))) {
			inTheScreen = 1;
		} else if (i == 0 && parseInt(win.x) <= parseInt(screen.bounds.x)) inTheScreen = 1;
		if (inTheScreen) {
			// resize the window, but keep it in bounds
			if (parseInt(newWidth) >= parseInt(screen.work_area.width)) {
				if (parseInt(newHeight) >= parseInt(screen.work_area.height)) {
					win.resizeTo(screen.work_area.width, screen.work_area.height);
					win.moveTo(0,0);
				} else {
					win.resizeTo(screen.work_area.width, newHeight);
					win.moveTo(0,Math.floor((screen.work_area.height - newHeight)/2));
				}
			} else {
				if (parseInt(newHeight) >= parseInt(screen.work_area.height)) {
					win.resizeTo(newWidth, screen.work_area.height);
					win.moveTo(Math.floor((screen.work_area.width - newWidth)/2),0);
				} else {
					win.resizeTo(newWidth, newHeight);
					if ((parseInt(win.x) + parseInt(newWidth)) > parseInt(screen.work_area.width)) {
						if ((parseInt(win.y) + parseInt(newHeight)) > parseInt(screen.work_area.height)) {
							win.moveTo((screen.work_area.width - newWidth),(screen.work_area.height - newHeight));
						} else if (parseInt(win.y) < 0) {
							win.moveTo((screen.work_area.width - newWidth),0);
						} else {
							win.moveTo((screen.work_area.width - newWidth),win.y);
						}
					} else {
						if ((parseInt(win.y) + parseInt(newHeight)) > parseInt(screen.work_area.height)) {
							if (parseInt(win.x) < 0) {
								win.moveTo(0,(screen.work_area.height - newHeight));
							} else {
								win.moveTo(win.x,(screen.work_area.height - newHeight));
							}
						} else if (parseInt(win.y) < 0) {
							if (parseInt(win.x) < 0) {
								win.moveTo(0,0);
							} else {
								win.moveTo(win.x,0);
							}
						} else {
							if (parseInt(win.x) < 0) {
								win.moveTo(0,win.y);
							}
						}
					}
				}
			}
			return false;
		}
	});
	// end find the screen where the window is
	if (playerLoaded) wjs().emitJsMessage("[refresh-aspect]");
}
