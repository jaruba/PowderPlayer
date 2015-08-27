
// start support for powder-remote module
var remote = {
	
	port: 0,
	secret: false,
	auth: false,
	socket: 0,
	
	init: function() {
		if (remote.port && remote.secret) {
			var io = require('socket.io-client');
			remote.socket = io.connect('http://localhost:'+remote.port, {reconnect: true});
			
			remote.socket.on('secret', function(webData) { if (remote.secret == webData.message) remote.auth = true; });
			remote.socket.on('advanceItem', function(webData) { if (remote.auth) player.advanceItem(webData.ind,webData.count) });
			remote.socket.on('close', function() { if (remote.auth) win.closeProcedure(); });

			var methods = ['fps','length','width','height','state','stateInt','itemCount','playing','subCount','audioCount'];
			methods.forEach(function(el) {
				remote.socket.on(el, function(elem) {
					return function(webData) {
						if (remote.auth && typeof webData.ind !== 'undefined') remote.socket.emit(webData.cbType, { ind: webData.ind, value: player[elem]() });
					}
				}(el))
			});

			methods = ['addPlaylist','mute','fullscreen','removeItem','notify','playItem','toggleMute','toggleFullscreen','play','pause','stop','next','prev','clearPlaylist'];
			methods.forEach(function(el) {
				remote.socket.on(el, function(elem) {
					return function(webData) {
						if (remote.auth) {
							if (elem == 'addPlaylist') {
								if (!powGlobals.lists.videos) powGlobals.lists.videos = [];
								var newInd = powGlobals.lists.videos.length;
								powGlobals.lists.videos[newInd] = {};
								if (webData.value.directPath) {
									powGlobals.lists.videos[newInd].local = 1;
									powGlobals.lists.videos[newInd].path = webData.value.directPath.replace("file:///","");
									if (webData.value.url.indexOf('\\') > -1) powGlobals.lists.videos[newInd].filename = webData.value.url.split('\\').pop();
									else if (webData.value.directPath.indexOf('/') > -1) powGlobals.lists.videos[newInd].filename = webData.value.directPath.split('/').pop();
									else powGlobals.lists.videos[newInd].filename = 'unknown';
									if (fs.existsSync(powGlobals.lists.videos[newInd].path)) {
										powGlobals.lists.videos[newInd].byteLength = fs.statSync(powGlobals.lists.videos[newInd].path).size;
									} else powGlobals.lists.videos[newInd].path = 'unknown';
								} else if (webData.value.url.indexOf("file:///") == 0) {
									powGlobals.lists.videos[newInd].local = 1;
									powGlobals.lists.videos[newInd].path = webData.value.url.replace("file:///","");
									if (webData.value.url.indexOf('\\') > -1) powGlobals.lists.videos[newInd].filename = webData.value.url.split('\\').pop();
									else if (webData.value.url.indexOf('/') > -1) powGlobals.lists.videos[newInd].filename = webData.value.url.split('/').pop();
									else powGlobals.lists.videos[newInd].filename = 'unknown';
									if (fs.existsSync(powGlobals.lists.videos[newInd].path)) {
										powGlobals.lists.videos[newInd].byteLength = fs.statSync(powGlobals.lists.videos[newInd].path).size;
									} else powGlobals.lists.videos[newInd].path = 'unknown';
								} else {
									powGlobals.lists.videos[newInd].local = 0;
									powGlobals.lists.videos[newInd].path = 'unknown';
									if (webData.value.url.indexOf('\\') > -1) powGlobals.lists.videos[newInd].filename = webData.value.url.split('\\').pop();
									else if (webData.value.url.indexOf('/') > -1) powGlobals.lists.videos[newInd].filename = webData.value.url.split('/').pop();
									else powGlobals.lists.videos[newInd].filename = 'unknown';
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
				remote.socket.on(el, function(elem) {
					return function(webData) {
						if (remote.auth && typeof webData.ind !== 'undefined') {
							var set = { ind: webData.ind };
							if (typeof webData.value !== 'undefined') {
								player[elem](webData.value);
								set.value = true;
							} else set.value = player[elem]();
							remote.socket.emit(webData.cbType, set);
						}
					}
				}(el));
			});

			methods = ['itemDesc','subDesc','audioDesc'];
			methods.forEach(function(el) {
				remote.socket.on(el, function(elem) {
					return function(webData) {
						if (remote.auth && typeof webData.ind !== 'undefined') {
							if (!webData.value) {
								if (elem == 'itemDesc') webData.value = player.currentItem();
								else if (typeof webData.value === 'undefined') webData.value = player[elem.replace("Desc","Track")]();
							}
							remote.socket.emit(webData.cbType, { ind: webData.ind, value: player[elem](webData.value) });
						}
					}
				}(el));
			});

		}

	}
}

// end support for powder-remote module
