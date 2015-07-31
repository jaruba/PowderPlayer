gui.Screen.Init();
var win = gui.Window.get(),
    allowScrollHotkeys = true;

win.on('focus', function() { focused = true; win.setProgressBar(-0.1); }); 
win.on('blur', function() {
	focused = false;
	if ($('#main').css("display") != "table" && typeof powGlobals.engine !== 'undefined' && powGlobals.hasVideo == 0 && parseInt($('#all-download .progress-bar').attr('data-transitiongoal')) < 100) win.setProgressBar(parseInt($('#all-download .progress-bar').attr('data-transitiongoal'))/100);
}); 
win.on('close', function() {
	
	if ($('#main').css("display") != "table") {
		if (castData.casting) stopDlna();
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
						if (powGlobals.engine) powGlobals.engine.destroy(function() { win.close(true); });
						else win.close(true);
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

$("#inner-in-content").scrollEnd(function(){
    if ($("#inner-in-content").scrollTop() == 0) if (powGlobals.engine) if (powGlobals.hasVideo > 0) {
		if (["visible","auto"].indexOf($("#inner-in-content").css("overflow-y")) > -1) $("#inner-in-content").css("overflow-y","hidden");
		win.setMinimumSize(372, 210);
		if (!wjs().isPlaying()) if (!castData.casting && wjs().state() != "stopping") wjs().togglePause();
	}
}, 1000);

$(window).resize(function() {
	if ($('#main').css("display") == "table") {
		if ($(window).height() < $("#main").height() && !$("body").hasClass("mini")) {
			$("body").addClass("mini");
		} else if ($(window).width() < $("#main").width() && !$("body").hasClass("mini")) {
			$("body").addClass("mini");
		} else if ($(window).width() > 730 && $(window).height() > 650 && $("body").hasClass("mini")) {
			 $("body").removeClass("mini");
		}
		$('#open-url').css('top', Math.round(($(window).height() - 187) / 2)+'px');
	} else {
		if (wjs()) {
			if ($(window).width() <= 425 && wjs().find(".wcp-add-url").css("display") == "inline") wjs().find(".wcp-add-url").css("display","none");
			else if ($(window).width() > 425 && wjs().find(".wcp-add-url").css("display") == "none") wjs().find(".wcp-add-url").css("display","inline");
		}
		if ($("body").hasClass("mini")) $("body").removeClass("mini");
		$("#filesList").css("min-height",$("#player_wrapper").height());
	}
});


function centerInScreen() {
	// find the screen where the window is
	gui.Screen.screens.some(function(screen,i) {
		// check if the window is horizontally inside the bounds of this screen
		var inTheScreen = 0;
		if (parseInt(win.x) > parseInt(screen.bounds.x) && parseInt(win.x) < (parseInt(screen.bounds.x) + parseInt(screen.work_area.width))) {
			inTheScreen = 1;
		} else if (i == 0 && parseInt(win.x) <= parseInt(screen.bounds.x)) inTheScreen = 1;
		if (inTheScreen) {
			// resize the window, but keep it in bounds
			win.moveTo((screen.work_area.width - win.width)/2,(screen.work_area.height - win.height)/2);
			return false;
		}
	});
	// end find the screen where the window is
}

function resizeInBounds(newWidth,newHeight) {
	// find the screen where the window is
	gui.Screen.screens.some(function(screen,i) {
		// check if the window is horizontally inside the bounds of this screen
		var inTheScreen = 0;
		if (parseInt(win.x) > parseInt(screen.bounds.x) && parseInt(win.x) < (parseInt(screen.bounds.x) + parseInt(screen.work_area.width))) {
			inTheScreen = 1;
		} else if (i == 0 && parseInt(win.x) <= parseInt(screen.bounds.x)) inTheScreen = 1;
		if (inTheScreen) {
			if (parseInt(newWidth) >= parseInt(screen.work_area.width)) {
				if (parseInt(newHeight) >= parseInt(screen.work_area.height)) {
					win.resizeTo(screen.work_area.width, screen.work_area.height);
					win.moveTo(0,0);
				} else {
					win.resizeTo(screen.work_area.width, newHeight);
					win.moveTo(0,Math.floor((screen.work_area.height - newHeight)/2));
				}
				player.refreshSize(200).refreshSize(500).refreshSize(1000);
			} else {
				if (win.x == (screen.work_area.width - win.width)/2 && win.y == (screen.work_area.height - win.height)/2) {
					// if perfectly centered, keep it centered
					win.moveTo((screen.work_area.width - newWidth)/2,(screen.work_area.height - newHeight)/2);
					win.resizeTo(newWidth, newHeight);
				} else {
					// resize the window, but keep it in bounds
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
				$(player.canvas).css("width","100%").css("height","100%");
			}
			return false;
		}
	});
	// end find the screen where the window is
}
