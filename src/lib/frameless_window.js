// Extend application menu for Mac OS
if (process.platform == "darwin") {
  var menu = new gui.Menu({type: "menubar"});
  menu.createMacBuiltin && menu.createMacBuiltin(window.document.title);
  win.menu = menu;
}

var firstBlur = true,
	frameTimer,
	maximized = false,
	frameHidden = false,
	frameImune = false,
	remHeight = 0,
	allowMouseMove = true;

window.onfocus = function() { showFrame(); };
window.onblur = function() { hideFrame(); };
win.on('restore',function() {
	if (remHeight > 0) {
		// i know what this looks like, i'm not crazy..
		// it is actually a hack for a NW.js bug..
		win.height = remHeight +1;
		win.height = win.height -1;
	}
});

function showFrame() {
	if (allowMouseMove) {
		if (firstBlur) firstBlur = false;
		else if (typeof player !== 'undefined' && !frameImune) {
			clearTimeout(frameTimer);
			frameHidden = false;
			$("#top-titlebar").css('opacity','1');
			$('#inner-content').css('border-color','rgba(83,83,83,1)');
			$('#content').css('border-color','rgba(54,54,54,1)');
			$('#inner-in-content').css('border-color','rgba(54,54,54,1)');
			if (!maximized) {
				// find the screen where the window is
				gui.Screen.screens.some(function(screen,i) {
					// check if the window is horizontally inside the bounds of this screen
					var inTheScreen = 0;
					if (parseInt(win.x) > parseInt(screen.bounds.x) && parseInt(win.x) < (parseInt(screen.bounds.x) + parseInt(screen.work_area.width))) {
						inTheScreen = 1;
					} else if (i == 0 && parseInt(win.x) <= parseInt(screen.bounds.x)) inTheScreen = 1;
					if (inTheScreen) {
						// if frameless window is sticked to a corner
						// then move it so the frame is visible
						if (win.y == parseInt(screen.bounds.y) -34) {
							win.y = win.y +34;
							if (win.x == ((parseInt(screen.bounds.x) + parseInt(screen.bounds.width)) - win.width +6)) {
								win.x = win.x -6;
							} else if (win.x == parseInt(screen.bounds.x) -6) {
								win.x = win.x +6;
							}
						}
						return true;
					}
				});
				// end find the screen where the window is
			}
		} else {
			clearTimeout(frameTimer);
			frameHidden = false;
		}
	}
}

document.addEventListener('mousemove', function(e){
	if (typeof player !== 'undefined' && parseInt($("#top-titlebar").css("opacity")) == 0 && !frameImune) {
		showFrame();
	} else if ($('#main').css("display") != "table" && $(document).scrollTop() == 0) {
		clearTimeout(frameTimer);
		frameTimer = setTimeout(function() { hideFrame(); },5000);
	}
});

function hideFrame() {
	if (typeof player !== 'undefined' && onTop && !firstBlur && !frameHidden && !maximized && !wjs().fullscreen() && wjs().isPlaying() && wjs().time() > 0 && !frameImune) {
	  clearTimeout(frameTimer);
	  frameHidden = true;

	  $({alpha:1}).animate({alpha:0}, {
		duration: 100,
		step: function(){
			$("#top-titlebar").css('opacity',this.alpha);
			$('#content').css('border-color','rgba(54,54,54,'+this.alpha+')');
			$('#inner-content').css('border-color','rgba(83,83,83,'+this.alpha+')');
			$('#inner-in-content').css('border-color','rgba(54,54,54,'+this.alpha+')');
		}
	  });
	  
	  setTimeout(function() {
		  if ($("#top-titlebar").css('opacity') != 1) {
			  $("#top-titlebar").css('opacity',0);
			  $('#content').css('border-color','rgba(54,54,54,0)');
			  $('#inner-content').css('border-color','rgba(83,83,83,0)');
			  $('#inner-in-content').css('border-color','rgba(54,54,54,0)');
		  }

		  // find the screen where the window is
		  gui.Screen.screens.some(function(screen,i) {
			  // check if the window is horizontally inside the bounds of this screen
			  var inTheScreen = 0;
			  if (parseInt(win.x) > parseInt(screen.bounds.x) && parseInt(win.x) < (parseInt(screen.bounds.x) + parseInt(screen.work_area.width))) {
				  inTheScreen = 1;
			  } else if (i == 0 && parseInt(win.x) <= parseInt(screen.bounds.x)) inTheScreen = 1;
			  if (inTheScreen) {
				  if (win.width > (parseInt(screen.bounds.width)/2)) return true;
				  
				  // if window is near a top corner of the screen
				  // then stick the frameless window to that corner
				  if (parseInt(screen.bounds.y) +10 > win.y) {
					  if ((parseInt(screen.bounds.x) + parseInt(screen.bounds.width)) -10 < (win.width + win.x)) {
						  allowMouseMove = false;
						  setTimeout(function() { allowMouseMove = true; },500);
						  win.x = (parseInt(screen.bounds.x) + parseInt(screen.bounds.width)) - win.width +6;
						  win.y = parseInt(screen.bounds.y) -34;
					  } else if (parseInt(screen.bounds.x) +10 > win.x) {
						  allowMouseMove = false;
						  setTimeout(function() { allowMouseMove = true; },500);
						  win.x = parseInt(screen.bounds.x) -6;
						  win.y = parseInt(screen.bounds.y) -34;
					  }
				  }
				  return true;
			  }
		  });
		  // end find the screen where the window is

	  },101);
	}
}

win.on('resize', function() {
  if (win.height > 200) remHeight = win.height;
  clearTimeout(frameTimer);
  frameTimer = setTimeout(function() { hideFrame(); },5000);
});

win.on('maximize', function() {
  clearTimeout(frameTimer);
  maximized = true;
  $(".top-titlebar-maximize-button").hide(0);
  $(".top-titlebar-restore-button").show(0);
});

win.on('restore', function() {
	maximized = false;
  $(".top-titlebar-restore-button").hide(0);
  $(".top-titlebar-maximize-button").show(0);
  clearTimeout(frameTimer);
  frameTimer = setTimeout(function() { hideFrame(); },5000);
});

win.on('move', function() {
	maximized = false;
  $(".top-titlebar-restore-button").hide(0);
  $(".top-titlebar-maximize-button").show(0);
  clearTimeout(frameTimer);
  frameTimer = setTimeout(function() { hideFrame(); },5000);
});

win.show();
