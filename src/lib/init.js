if (gui.App.argv.length > 0) {
	var ranFirstArg = false;
	for (kn = 0; gui.App.argv[kn]; kn++) {
		if (gui.App.argv[kn].indexOf("--") == 0) {
			if (gui.App.argv[kn].indexOf("--controller-port=") == 0) {
				controlPort = parseInt(gui.App.argv[kn].replace("--controller-port=",""));
			} else if (gui.App.argv[kn].indexOf("--controller-secret=") == 0) {
				controlSecret = gui.App.argv[kn].replace("--controller-secret=","");
			}
		} else {
			if (!ranFirstArg) {
				ranFirstArg = true;
				resetPowGlobals();
				runURL(gui.App.argv[kn]);
			}
		}
	}
	win.on('loaded', function() {
		if (controlPort && controlSecret) {
			// start support for powder-remote
			var io = require('socket.io-client');
			controllSocket = io.connect('http://localhost:'+controlPort, {reconnect: true});
			
			controllSocket.on('secret', function(webData) { if (controlSecret == webData.message) controlAuth = true; });
			controllSocket.on('advanceItem', function(webData) { if (controlAuth) player.advanceItem(webData.ind,webData.count) });
			controllSocket.on('close', function() { if (controlAuth) closeProcedure(); });

			var methods = ['fps','length','width','height','state','stateInt','itemCount','playing','subCount','audioCount'];
			methods.forEach(function(el) {
				controllSocket.on(el, function(elem) {
					return function(webData) {
						if (controlAuth && typeof webData.ind !== 'undefined') controllSocket.emit(webData.cbType, { ind: webData.ind, value: player[elem]() });
					}
				}(el))
			});

			methods = ['addPlaylist','mute','fullscreen','removeItem','notify','playItem','toggleMute','toggleFullscreen','play','pause','stop','next','prev','clearPlaylist'];
			methods.forEach(function(el) {
				controllSocket.on(el, function(elem) {
					return function(webData) {
						if (controlAuth) {
							if (elem == 'addPlaylist') {
								if (!powGlobals.videos) powGlobals.videos = [];
								var newInd = powGlobals.videos.length;
								powGlobals.videos[newInd] = {};
								if (webData.value.directPath) {
									powGlobals.videos[newInd].local = 1;
									powGlobals.videos[newInd].path = webData.value.directPath.replace("file:///","");
									if (webData.value.url.indexOf('\\') > -1) powGlobals.videos[newInd].filename = webData.value.url.split('\\').pop();
									else if (webData.value.directPath.indexOf('/') > -1) powGlobals.videos[newInd].filename = webData.value.directPath.split('/').pop();
									else powGlobals.videos[newInd].filename = 'unknown';
									if (fs.existsSync(powGlobals.videos[newInd].path)) {
										powGlobals.videos[newInd].byteLength = fs.statSync(powGlobals.videos[newInd].path).size;
									} else powGlobals.videos[newInd].path = 'unknown';
								} else if (webData.value.url.indexOf("file:///") == 0) {
									powGlobals.videos[newInd].local = 1;
									powGlobals.videos[newInd].path = webData.value.url.replace("file:///","");
									if (webData.value.url.indexOf('\\') > -1) powGlobals.videos[newInd].filename = webData.value.url.split('\\').pop();
									else if (webData.value.url.indexOf('/') > -1) powGlobals.videos[newInd].filename = webData.value.url.split('/').pop();
									else powGlobals.videos[newInd].filename = 'unknown';
									if (fs.existsSync(powGlobals.videos[newInd].path)) {
										powGlobals.videos[newInd].byteLength = fs.statSync(powGlobals.videos[newInd].path).size;
									} else powGlobals.videos[newInd].path = 'unknown';
								} else {
									powGlobals.videos[newInd].local = 0;
									powGlobals.videos[newInd].path = 'unknown';
									if (webData.value.url.indexOf('\\') > -1) powGlobals.videos[newInd].filename = webData.value.url.split('\\').pop();
									else if (webData.value.url.indexOf('/') > -1) powGlobals.videos[newInd].filename = webData.value.url.split('/').pop();
									else powGlobals.videos[newInd].filename = 'unknown';
								}
							}
							if (webData && typeof webData.value !== 'undefined') player[elem](webData.value);
							else player[elem]();
						}
					}
				}(el))
			});
			
			methods = ['subTrack','subDelay','audioTrack','audioDelay','time','position','rate','volume','currentItem','audioChan','audioChanInt','aspectRatio','crop','zoom'];
			methods.forEach(function(el) {
				controllSocket.on(el, function(elem) {
					return function(webData) {
						if (controlAuth && typeof webData.ind !== 'undefined') {
							var set = { ind: webData.ind };
							if (typeof webData.value !== 'undefined') {
								player[elem](webData.value);
								set.value = true;
							} else set.value = player[elem]();
							controllSocket.emit(webData.cbType, set);
						}
					}
				}(el));
			});

			methods = ['itemDesc','subDesc','audioDesc'];
			methods.forEach(function(el) {
				controllSocket.on(el, function(elem) {
					return function(webData) {
						if (controlAuth && typeof webData.ind !== 'undefined') {
							if (!webData.value) {
								if (elem == 'itemDesc') webData.value = player.currentItem();
								else if (typeof webData.value === 'undefined') webData.value = player[elem.replace("Desc","Track")]();
							}
							controllSocket.emit(webData.cbType, { ind: webData.ind, value: player[elem](webData.value) });
						}
					}
				}(el));
			});
			// end support for powder-remote
		}
		$("#webchimera").mousedown(function(e){ 
		    if (e.button == 2 && $('#main').css("display") != "table" && $('#inner-in-content').scrollTop() == 0 && !$("#magnetLink").is(":hover")) {
				playerMenu.popup(e.pageX, e.pageY);
			}
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
		    if (e.button == 2 && $('#main').css("display") != "table" && $('#inner-in-content').scrollTop() == 0 && !$("#magnetLink").is(":hover")) {
				playerMenu.popup(e.pageX, e.pageY);
			}
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
	wjs().onTime(function (ms) {
		if (controlPort && controlSecret && controllSocket) controllSocket.emit('event', { name: 'Time', value: ms });
	});
	wjs().onPaused(function() {
		if (controlPort && controlSecret && controllSocket) controllSocket.emit('event', { name: 'Paused' });
	});
	wjs().onState(changedState);
	wjs().onError(handleErrors);
	wjs().onFrameSetup(gotVideoSize);
	wjs().onMediaChanged(function() {
		if (controlPort && controlSecret && controllSocket) controllSocket.emit('event', { name: 'MediaChanged' });
		// reset checked items in context menu
		resetMenus([4,5,6]);
	});
	
	wjs().onEnded(function() {
		if (controlPort && controlSecret && controllSocket) controllSocket.emit('event', { name: 'Ended' });
		disableCtxMenu();
	});
	wjs().onStopped(function() {
		if (controlPort && controlSecret && controllSocket) controllSocket.emit('event', { name: 'Stopped' });
		disableCtxMenu();
	});
	
	attachDlnaHandlers();
	
	playerLoaded = true;
	if (gui.App.argv.length > 0) {
		$('#main').css("display","none");
		$('#player_wrapper').css("min-height","100%").css("height","100%").css("width","auto");
		
		if (!$("#open-url").hasClass("dark-add-url")) {
			$("#magnetSubmit").text("Add");
			$("#open-url").addClass("dark-add-url");
		}
		
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
fs.stat(gui.App.dataPath+pathBreak+'updater'+appExt, function(err,stat) { if (err == null) fs.unlink(gui.App.dataPath+pathBreak+'updater'+appExt); });

disableCtxMenu();

// disable windows specific settings
if (!isWin) {
	$("#but-assoc1").hide(0);
	$("#but-assoc2").hide(0);
	$("#but-assoc3").hide(0);
}
