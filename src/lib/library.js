
var scan = {

	_walk: function(dir, done) {
	// parse all files in the library folder
	  var results = [];
	  saveContext = this;
	  fs.readdir(dir, function(err, list) {
		if (err) return done(err);
		var i = 0;
		(function next() {
		  var file = list[i++];
		  if (!file) return done(null, results);
		  file = dir.replace('\\','/').replace(':',':/') + '/' + file;
		  fs.stat(file, function(err, stat) {
			if (stat && stat.isDirectory()) {
			  saveContext._walk(file, function(err, res) {
			   results = results.concat(res);
				next();
			  });
			} else {
			  if (playerApi.supportedTypes.indexOf(utils.parser(file).extension()) > -1) {
				  clean = utils.parser(player.itemDesc(player.itemCount()-1).title);
				  compare = utils.parser(file);
				  if (clean.showName() == compare.showName()) {
					  if (compare.season() == clean.season() && compare.episode() > clean.episode()) {
						  results.push(file);
					  } else if (compare.season() > clean.season()) {
						  results.push(file);
					  }
				  }
			  }
			  next();
			}
		  });
		})();
	  });
	// end parse all files in the library folder
	},

	library: function() {
		
		if (localStorage.libDir == 'Temp') {
			if (localStorage.tmpDir != 'Temp') libDir = localStorage.tmpDir;
			else if (powGlobals.torrent.engine) libDir = powGlobals.torrent.engine.path;
		} else libDir = localStorage.libDir;
		
		if (libDir) this._walk(libDir, function(err, results) {
			
			if (err) throw err;
			
			// remove duplicate episodes
			remSzEp = [];
			cleanArray = [];
			if (results.length > 0) {
				results.forEach(function(el,ij) {
					clean = utils.parser(el);
					if (clean.shortSzEp() !== false && remSzEp.indexOf(clean.shortSzEp()) == -1) {
						remSzEp.push(clean.shortSzEp());
						cleanArray.push(el);
					}
				});
			} else {
				player.notify("No Items Found");
				return;
			}
			results = cleanArray;
			// end remove duplicate episodes
		  
			if (utils.parser(results[0]).shortSzEp()) results = utils.sorting.episodes(results);
			else results = utils.sorting.naturalSort(results);
			
			var mj;
			var disableAll = false;
			
			results.forEach(function(el,ij) {
				mj = ij;
				newVideoId = powGlobals.lists.media.length;
				powGlobals.lists.media[newVideoId] = {};
				powGlobals.lists.media[newVideoId].filename = utils.parser(el).filename();
				if (isWin) {
					powGlobals.lists.media[newVideoId].path = el.split('/').join('\\');
					powGlobals.lists.media[newVideoId].byteLength = utils.fs.size(el.split('/').join('\\'));
				} else {
					powGlobals.lists.media[newVideoId].path = el;
					powGlobals.lists.media[newVideoId].byteLength = utils.fs.size(el);
				}
				powGlobals.lists.media[newVideoId].local = 1;
				clean = utils.parser(el);
				player.addPlaylist({
					 url: "file:///"+el,
					 title: clean.name()
				});
				compare = utils.parser(player.itemDesc(player.itemCount()-2).title);
				if (disableAll) player.vlc.playlist.items[newVideoId].disabled = true;
				else if (clean.season() == compare.season() && clean.episode(el) -1 != compare.episode()) {
					player.vlc.playlist.items[newVideoId].disabled = true;
					disableAll = true;
				}
			});
			mj++;
			if (mj == 1) player.notify(mj+" Episode Found");
			else player.notify(mj+" Episodes Found");
			player.refreshPlaylist();
		});
	},
	
	server: function() {
		utils.checkInternet(function(isConnected) {
			if (isConnected) {
				clean = utils.parser(player.itemDesc(player.itemCount()-1).title);
				if (clean.shortSzEp()) {
					var metaServer = window.atob("aHR0cDovL3Bvd2Rlci5tZWRpYS9tZXRhRGF0YS9zY2FuLnBocD9zPQ==")+encodeURIComponent(clean.season())+window.atob("JmU9")+encodeURIComponent(clean.episode())+window.atob("JnNuPQ==")+encodeURIComponent(clean.showName().toLowerCase());
					if ((player.state() == "playing" || player.state() == "paused") && player.height() > 0) {
						qualities = [480, 720, 1080];
						metaServer += window.atob("JnBmPQ==")+encodeURIComponent(utils.closest(player.height(),qualities));
					}
					torrent.flood.pause();
					$.ajax({ type: 'GET', url: metaServer, dataType: 'json', global: false, cache: false, success: function(xhr) {
						if (xhr.constructor === Array) {
							xhr.forEach(function(el) {
								el.infoHash = el.infoHash.replace("magnet:?xt=urn:btih:","");
								el.infoHash = el.infoHash.substr(0,el.infoHash.indexOf("&"));
								player.addPlaylist({
									url: "pow://"+el.infoHash,
									title: el.name
								});
							});
							if (xhr.length == 1) player.notify(xhr.length+" Episode Found");
							else player.notify(xhr.length+" Episodes Found");
							player.refreshPlaylist();
						} else player.notify("No Items Found");
						torrent.flood.start();
					} });
				} else player.notify("No Items Found");
			} else player.notify("No Internet");
		});
	}
}