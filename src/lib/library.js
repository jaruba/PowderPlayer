// parse all files in the library folder
var walk = function(dir, done) {
  var results = [];
  fs.readdir(dir, function(err, list) {
    if (err) return done(err);
    var i = 0;
    (function next() {
      var file = list[i++];
      if (!file) return done(null, results);
	  file = dir.replace('\\','/').replace(':',':/') + '/' + file;
      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {
          walk(file, function(err, res) {
           results = results.concat(res);
            next();
          });
        } else {
		  if (supportedVideo.indexOf(file.split('.').pop().toLowerCase()) > -1) {
			  if (getShowName(powGlobals.videos[powGlobals.videos.length - 1].filename) == getShowName(file)) {
				  if (getSeason(file) == getSeason(powGlobals.videos[powGlobals.videos.length - 1].filename) && getEpisode(file) > getEpisode(powGlobals.videos[powGlobals.videos.length - 1].filename)) {
					  results.push(file);
				  } else if (getSeason(file) > getSeason(powGlobals.videos[powGlobals.videos.length - 1].filename)) {
					  results.push(file);
				  }
			  }
		  }
          next();
        }
      });
    })();
  });
};
// end parse all files in the library folder

function scanLibrary() {
	
	if (localStorage.libDir == 'Temp') {
		if (localStorage.tmpDir != 'Temp') libDir = localStorage.tmpDir;
		else if (powGlobals.engine) libDir = powGlobals.engine.path;
	} else libDir = localStorage.libDir;
	
	if (libDir) walk(libDir, function(err, results) {
		
		if (err) throw err;
		
		// remove duplicate episodes
		remSzEp = [];
		cleanArray = [];
		if (results.length > 0) {
			results.forEach(function(el,ij) {
				if (getShortSzEp(el.split('/').pop()) !== false && remSzEp.indexOf(getShortSzEp(el.split('/').pop())) == -1) {
					remSzEp.push(getShortSzEp(el.split('/').pop()));
					cleanArray.push(el);
				}
			});
		} else {
			wjs().notify("No Items Found");
			return;
		}
		results = cleanArray;
		// end remove duplicate episodes
	  
		if (getShortSzEp(results[0])) results = sortEpisodes(results);
		else results = naturalSort(results);
		
		var mj;
		var disableAll = false;
		
		results.forEach(function(el,ij) {
			mj = ij;
		    newVideoId = powGlobals.videos.length;
			powGlobals.videos[newVideoId] = [];
		    powGlobals.videos[newVideoId].filename = el.split('/').pop();
			if (isWin) {
				powGlobals.videos[newVideoId].path = el.split('/').join('\\');
				powGlobals.videos[newVideoId].byteLength = fs.statSync(el.split('/').join('\\')).size;
			} else {
				powGlobals.videos[newVideoId].path = el;
				powGlobals.videos[newVideoId].byteLength = fs.statSync(el).size;
			}
			powGlobals.videos[newVideoId].local = 1;
			wjs().addPlaylist({
				 url: "file:///"+el,
				 title: getName(el)
			});
			if (disableAll) wjs().vlc.playlist.items[newVideoId].disabled = true;
			else if (getSeason(el) == getSeason(powGlobals.videos[powGlobals.videos.length - 2].filename) && getEpisode(el) -1 != getEpisode(powGlobals.videos[powGlobals.videos.length - 2].filename)) {
				wjs().vlc.playlist.items[newVideoId].disabled = true;
				disableAll = true;
			}
		});
		mj++;
		if (mj == 1) wjs().notify(mj+" Episode Found");
		else wjs().notify(mj+" Episodes Found");
		wjs().refreshPlaylist();
	});
}

function scanServer() {
	checkInternet(function(isConnected) {
		if (isConnected) {
			if (getShortSzEp(powGlobals.videos[powGlobals.videos.length - 1].filename)) {
				var metaServer = window.atob("aHR0cDovL3Bvd2Rlci5tZWRpYS9tZXRhRGF0YS9zY2FuLnBocD9zPQ==")+encodeURIComponent(getSeason(powGlobals.videos[powGlobals.videos.length - 1].filename))+window.atob("JmU9")+encodeURIComponent(getEpisode(powGlobals.videos[powGlobals.videos.length - 1].filename))+window.atob("JnNuPQ==")+encodeURIComponent(getShowName(powGlobals.videos[powGlobals.videos.length - 1].filename).toLowerCase());
				if ((keepState == "playing" || keepState == "paused") && wjs().height() > 0) {
					qualities = [480, 720, 1080];
					metaServer += window.atob("JnBmPQ==")+encodeURIComponent(closest(wjs().height(),qualities));
				}
				$.ajax({ type: 'GET', url: metaServer, dataType: 'json', global: false, cache: false, success: function(xhr) {
					if (xhr.constructor === Array) {
						xhr.forEach(function(el) {
							el.infoHash = el.infoHash.replace("magnet:?xt=urn:btih:","");
							el.infoHash = el.infoHash.substr(0,el.infoHash.indexOf("&"));
							wjs().addPlaylist({
								url: "pow://"+el.infoHash,
								title: el.name
							});
						});
						if (xhr.length == 1) wjs().notify(xhr.length+" Episode Found");
						else wjs().notify(xhr.length+" Episodes Found");
						wjs().refreshPlaylist();
					} else wjs().notify("No Items Found");
				} });
			} else wjs().notify("No Items Found");
		} else wjs().notify("No Internet");
	});
}