gui.Screen.Init();

var win = {
	
	onTop: false,
	focused: true,
	gui: gui.Window.get(),
	
	closeProcedure: function(doCheck) {
		if ($('#main').css("display") != "table") {
			if (dlna.castData.casting) dlna.stop();
			if (powGlobals.torrent.engine && powGlobals.torrent.hasVideo == 0 && typeof doCheck === 'undefined' && !load.argData.silent) {
				$('.ask-remove-files').trigger('openModal');
				return;
			} else if (load.argData.silent && (typeof doCheck === 'undefined' || doCheck !== false)) {
				win.closeProcedure(false);
				return;
			}
			
			win.exitApp(180000); // fallback, if any error appears and the process didn't finish, the app should still close (3 mins)
			win.gui.hide();
			player.stop();
	
			if (typeof doCheck !== 'undefined') r = doCheck;
			else r = true;
	
			if (r) {
				if (powGlobals.torrent.engine) {
					clearTimeout(torrent.timers.down);
					powGlobals.torrent.engine.swarm.removeListener('wire', onmagnet);
					powGlobals.torrent.engine.server.close(function() {
						powGlobals.torrent.engine.remove(function() {
							if (powGlobals.torrent.engine) powGlobals.torrent.engine.destroy(function() { win.exitApp(1500); });
							else win.exitApp(1500);
						});
					});
				} else win.exitApp(1000);
			} else {
				if (powGlobals.torrent.engine) {
					clearTimeout(torrent.timers.down);
					powGlobals.torrent.engine.swarm.removeListener('wire', onmagnet);
					powGlobals.torrent.engine.server.close(function() {
						if (powGlobals.torrent.engine) {
							powGlobals.torrent.engine.destroy(function() {
								utils.fs.dirExists(gui.App.dataPath+pathBreak+'interrupted', 0744, function(err) {
									if (err) {
										win.gui.close(true);
										return;
									}
									var saver = {};
									saver.torData = torrent.saveData();
									saver.infoHash = powGlobals.torrent.engine.infoHash;
									fs.writeFile(gui.App.dataPath+pathBreak+'interrupted'+pathBreak+saver.infoHash.toLowerCase(), saver.torData, function (err) {
										if (err) {
											win.gui.close(true);
											return;
										}
										win.exitApp(1500);
									});
								});
							});
						} else win.exitApp(1500);
					});
				} else win.exitApp(1000);
			}
		} else win.exitApp(1);
	},
	
	exitApp: function(countdown) {
		setTimeout(function() {
			win.gui.close(true);
		},countdown);
	},
	
	position: {
		center: function() {
			// find the screen where the window is
			gui.Screen.screens.some(function(screen,i) {
				// check if the window is horizontally inside the bounds of this screen
				var inTheScreen = 0;
				if (parseInt(win.gui.x) > parseInt(screen.bounds.x) && parseInt(win.gui.x) < (parseInt(screen.bounds.x) + parseInt(screen.work_area.width))) {
					inTheScreen = 1;
				} else if (i == 0 && parseInt(win.gui.x) <= parseInt(screen.bounds.x)) inTheScreen = 1;
				if (inTheScreen) {
					// resize the window, but keep it in bounds
					win.gui.moveTo((screen.work_area.width - win.gui.width)/2,(screen.work_area.height - win.gui.height)/2);
					return false;
				}
			});
			// end find the screen where the window is
		},
		
		resizeInBounds: function(newWidth,newHeight) {
			// find the screen where the window is
			gui.Screen.screens.some(function(screen,i) {
				// check if the window is horizontally inside the bounds of this screen
				var inTheScreen = 0;
				if (parseInt(win.gui.x) > parseInt(screen.bounds.x) && parseInt(win.gui.x) < (parseInt(screen.bounds.x) + parseInt(screen.work_area.width))) {
					inTheScreen = 1;
				} else if (i == 0 && parseInt(win.gui.x) <= parseInt(screen.bounds.x)) inTheScreen = 1;
				if (inTheScreen) {
					if (parseInt(newWidth) >= parseInt(screen.work_area.width)) {
						if (parseInt(newHeight) >= parseInt(screen.work_area.height)) {
							win.gui.resizeTo(screen.work_area.width, screen.work_area.height);
							win.gui.moveTo(0,0);
						} else {
							win.gui.resizeTo(screen.work_area.width, newHeight);
							win.gui.moveTo(0,Math.floor((screen.work_area.height - newHeight)/2));
						}
						player.refreshSize(200).refreshSize(500).refreshSize(1000);
					} else {
						if (win.gui.x == (screen.work_area.width - win.gui.width)/2 && win.gui.y == (screen.work_area.height - win.gui.height)/2) {
							// if perfectly centered, keep it centered
							win.gui.moveTo((screen.work_area.width - newWidth)/2,(screen.work_area.height - newHeight)/2);
							win.gui.resizeTo(newWidth, newHeight);
						} else {
							// resize the window, but keep it in bounds
							if (parseInt(newHeight) >= parseInt(screen.work_area.height)) {
								win.gui.resizeTo(newWidth, screen.work_area.height);
								win.gui.moveTo(Math.floor((screen.work_area.width - newWidth)/2),0);
							} else {
								win.gui.resizeTo(newWidth, newHeight);
								if ((parseInt(win.gui.x) + parseInt(newWidth)) > parseInt(screen.work_area.width)) {
									if ((parseInt(win.gui.y) + parseInt(newHeight)) > parseInt(screen.work_area.height)) {
										win.gui.moveTo((screen.work_area.width - newWidth),(screen.work_area.height - newHeight));
									} else if (parseInt(win.gui.y) < 0) {
										win.gui.moveTo((screen.work_area.width - newWidth),0);
									} else {
										win.gui.moveTo((screen.work_area.width - newWidth),win.gui.y);
									}
								} else {
									if ((parseInt(win.gui.y) + parseInt(newHeight)) > parseInt(screen.work_area.height)) {
										if (parseInt(win.gui.x) < 0) {
											win.gui.moveTo(0,(screen.work_area.height - newHeight));
										} else {
											win.gui.moveTo(win.gui.x,(screen.work_area.height - newHeight));
										}
									} else if (parseInt(win.gui.y) < 0) {
										if (parseInt(win.gui.x) < 0) {
											win.gui.moveTo(0,0);
										} else {
											win.gui.moveTo(win.gui.x,0);
										}
									} else {
										if (parseInt(win.gui.x) < 0) {
											win.gui.moveTo(0,win.gui.y);
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

	},
		
	frame: {
		
		hide: function() {
			
			if (typeof player !== 'undefined' && win.onTop && !firstBlur && !frameHidden && !maximized && !player.fullscreen() && player.isPlaying() && player.time() > 0 && !frameImune && process.platform != 'linux') {
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
					  if (parseInt(win.gui.x) > parseInt(screen.bounds.x) && parseInt(win.gui.x) < (parseInt(screen.bounds.x) + parseInt(screen.work_area.width))) {
						  inTheScreen = 1;
					  } else if (i == 0 && parseInt(win.gui.x) <= parseInt(screen.bounds.x)) inTheScreen = 1;
					  if (inTheScreen) {
						  if (win.gui.width > (parseInt(screen.bounds.width)/2)) return true;
						  
						  // if window is near a top corner of the screen
						  // then stick the frameless window to that corner
						  if (parseInt(screen.bounds.y) +10 > win.gui.y) {
							  if ((parseInt(screen.bounds.x) + parseInt(screen.bounds.width)) -10 < (win.gui.width + win.gui.x)) {
								  allowMouseMove = false;
								  setTimeout(function() { allowMouseMove = true; },500);
								  win.gui.x = (parseInt(screen.bounds.x) + parseInt(screen.bounds.width)) - win.gui.width +6;
								  win.gui.y = parseInt(screen.bounds.y) -34;
							  } else if (parseInt(screen.bounds.x) +10 > win.gui.x) {
								  allowMouseMove = false;
								  setTimeout(function() { allowMouseMove = true; },500);
								  win.gui.x = parseInt(screen.bounds.x) -6;
								  win.gui.y = parseInt(screen.bounds.y) -34;
							  }
						  }
						  return true;
					  }
				  });
				  // end find the screen where the window is
		
			  },101);
			}
			
		},
		
		show: function() {

			if (allowMouseMove && process.platform != 'linux') {
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
							if (parseInt(win.gui.x) > parseInt(screen.bounds.x) && parseInt(win.gui.x) < (parseInt(screen.bounds.x) + parseInt(screen.work_area.width))) {
								inTheScreen = 1;
							} else if (i == 0 && parseInt(win.gui.x) <= parseInt(screen.bounds.x)) inTheScreen = 1;
							if (inTheScreen) {
								// if frameless window is sticked to a corner
								// then move it so the frame is visible
								if (win.gui.y == parseInt(screen.bounds.y) -34) {
									win.gui.y = win.gui.y +34;
									if (win.gui.x == ((parseInt(screen.bounds.x) + parseInt(screen.bounds.width)) - win.gui.width +6)) {
										win.gui.x = win.gui.x -6;
									} else if (win.gui.x == parseInt(screen.bounds.x) -6) {
										win.gui.x = win.gui.x +6;
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
	},
	
	title: {
		
		center: function(newtitle) {
			win.gui.title = newtitle;
			if ($(".top-titlebar-text").hasClass("top-text-left")) $(".top-titlebar-text").removeClass("top-text-left").addClass("top-text-center");
			$(".top-titlebar-text").html(newtitle);
		},
		
		left: function(newtitle) {
			win.gui.title = newtitle;
			if ($(".top-titlebar-text").hasClass("top-text-center")) $(".top-titlebar-text").removeClass("top-text-center").addClass("top-text-left");
			$(".top-titlebar-text").html(newtitle);
		},
		
		helpers: {
			
			init: function() {
				win.title.helpers.addButtonHandlers("top-titlebar-close-button", "button_close.png", "button_close_hover.png", function() { win.closeProcedure() });
				win.title.helpers.addButtonHandlers("top-titlebar-maximize-button", "maximize.png", "maximize_hover.png", function() { win.gui.maximize() });
				win.title.helpers.addButtonHandlers("top-titlebar-restore-button", "restore.png", "restore_hover.png",  function() { win.gui.restore() });
				win.title.helpers.addButtonHandlers("top-titlebar-minimize-button", "minimize.png", "minimize_hover.png", function() {
					win.gui.minimize();
					$("#top-titlebar-minimize-button").trigger("mouseout");
				});
			},
			
			updateImageUrl: function(image_id, new_image_url) {
				var image = document.getElementById(image_id);
				if (image) image.src = new_image_url;
			},

			addButtonHandlers: function(button_id, normal_image_url, hover_image_url, click_func) {
				var button = $("#"+button_id)[0];
				button.onmouseover = function() {
					win.title.helpers.updateImageUrl(button_id, "images/"+hover_image_url);
				}
				button.onmouseout = function() {
					win.title.helpers.updateImageUrl(button_id, "images/"+normal_image_url);
				}
				button.onclick = click_func;
			}
			
		}

	}

}

var allowScrollHotkeys = true;

win.gui.on('focus', function() {
	win.focused = true;
	win.gui.setProgressBar(-0.1);
	if (localStorage.pulseRule == "auto" && powGlobals.torrent.engine && powGlobals.torrent.pulse) powGlobals.torrent.engine.flood();
});

win.gui.on('blur', function() {
	win.focused = false;
	if ($('#main').css("display") != "table" && typeof powGlobals.torrent.engine !== 'undefined' && powGlobals.torrent.hasVideo == 0 && parseInt($('#all-download .progress-bar').attr('data-transitiongoal')) < 100) {
		win.gui.setProgressBar(parseInt($('#all-download .progress-bar').attr('data-transitiongoal'))/100);
	}
	if (localStorage.pulseRule == "auto" && powGlobals.torrent.engine && powGlobals.torrent.pulse) {
		powGlobals.torrent.engine.setPulse(powGlobals.torrent.pulse);
	}
});

win.gui.on('close', function() {
	win.closeProcedure();
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
    if ($("#inner-in-content").scrollTop() == 0 && powGlobals.torrent.engine && powGlobals.torrent.hasVideo > 0) {
		if (["visible","auto"].indexOf($("#inner-in-content").css("overflow-y")) > -1) {
			$("#inner-in-content").css("overflow-y","hidden");
		}
		win.gui.setMinimumSize(372, 210);
		if (!player.isPlaying() && !dlna.castData.casting && player.state() != "stopping") player.togglePause();
		if (win.gui.title != player.itemDesc(player.currentItem()).title) {
			win.title.left(player.itemDesc(player.currentItem()).title);
		}
	}
}, 1000);

(function($) {
    $.fn.hasScrollBar = function() {
        return this.get(0).scrollHeight > this.height();
    }
})(jQuery);

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
		if (player) {
			if ($(window).width() <= 482 && player.find(".wcp-add-url").css("display") == "inline") {
				$("#open-url").hide(0)
				for (kl = 0; kl < $(".lean-overlay").length; kl++) {
					if (parseInt($($(".lean-overlay")[kl]).css("zIndex")) > 0) {
						$($(".lean-overlay")[kl]).css("zIndex","0");
						break;
					}
				}
				player.find(".wcp-add-url").css("display","none");
			} else if ($(window).width() > 482 && player.find(".wcp-add-url").css("display") == "none") {
				player.find(".wcp-add-url").css("display","inline");
			}
		}
		if ($("body").hasClass("mini")) $("body").removeClass("mini");
		$("#filesList").css("min-height",$("#player_wrapper").height());
		if (player.wrapper.width() == 1) {
			if (!$("#inner-in-content").hasScrollBar() && !$("#header_container").hasClass("header-full-width")) {
				$("#header_container").addClass("header-full-width");
			} else if ($("#inner-in-content").hasScrollBar() && $("#header_container").hasClass("header-full-width")) {
				$("#header_container").removeClass("header-full-width");
			}
		} else if ($("#header_container").hasClass("header-full-width")) $("#header_container").removeClass("header-full-width");
	}
});

// specific to window frame
// Extend application menu for Mac OS
if (process.platform == "darwin") {
  var menu = new gui.Menu({type: "menubar"});
  menu.createMacBuiltin && menu.createMacBuiltin(window.document.title);
  win.gui.menu = menu;
}

var firstBlur = true,
	frameTimer,
	maximized = false,
	frameHidden = false,
	frameImune = false,
	remHeight = 0,
	allowMouseMove = true;

window.onfocus = function() { win.frame.show(); };
window.onblur = function() { win.frame.hide(); };
win.gui.on('restore',function() {
	if (remHeight > 0) {
		// i know what this looks like, i'm not crazy..
		// it is actually a hack for a NW.js bug..
		win.gui.height = remHeight +1;
		win.gui.height = win.gui.height -1;
	}
});

document.addEventListener('mousemove', function(e){
	if (typeof player !== 'undefined' && parseInt($("#top-titlebar").css("opacity")) == 0 && !frameImune) {
		win.frame.show();
	} else if ($('#main').css("display") != "table" && $("#inner-in-content").scrollTop() == 0) {
		clearTimeout(frameTimer);
		frameTimer = setTimeout(function() { win.frame.hide(); },5000);
	}
});

win.gui.on('resize', function() {
	if (win.gui.height > 200) remHeight = win.gui.height;
	clearTimeout(frameTimer);
	frameTimer = setTimeout(function() { win.frame.hide(); },5000);
});

win.gui.on('maximize', function() {
	clearTimeout(frameTimer);
	if (!maximized) {
		maximized = true;
		if (!$(".top-titlebar-restore-button").is(":visible")) $(".top-titlebar-restore-button").show(0);
		if ($(".top-titlebar-maximize-button").is(":visible")) $(".top-titlebar-maximize-button").hide(0);
	}
});

win.gui.on('restore', function() {
	if (maximized) {
		maximized = false;
		if ($(".top-titlebar-restore-button").is(":visible")) $(".top-titlebar-restore-button").hide(0);
		if (!$(".top-titlebar-maximize-button").is(":visible")) $(".top-titlebar-maximize-button").show(0);
	}
	clearTimeout(frameTimer);
	frameTimer = setTimeout(function() { win.frame.hide(); },5000);
});

win.gui.on('move', function() {
	if (maximized) {
		maximized = false;
		if ($(".top-titlebar-restore-button").is(":visible")) $(".top-titlebar-restore-button").hide(0);
		if (!$(".top-titlebar-maximize-button").is(":visible")) $(".top-titlebar-maximize-button").show(0);
	}
	clearTimeout(frameTimer);
	frameTimer = setTimeout(function() { win.frame.hide(); },5000);
});

if (gui.App.argv.length > 0) {
	shouldShow = gui.App.argv.some(function(el,ij) {
		return (['--silent','--silent=true'].indexOf(el) > -1);
	});
	if (!shouldShow) win.gui.show();
} else win.gui.show();

// end specific to window frame

win.title.helpers.init();

if (process.platform == 'linux') $("#top-titlebar").css("borderRadius","0");
win.position.center();
