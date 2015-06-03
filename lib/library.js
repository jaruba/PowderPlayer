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
		results.forEach(function(el,ij) {
			if (getShortSzEp(el.split('/').pop()) !== false && remSzEp.indexOf(getShortSzEp(el.split('/').pop())) == -1) {
				remSzEp.push(getShortSzEp(el.split('/').pop()));
				cleanArray.push(el);
			}
		});
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
		    powGlobals.videos[newVideoId].path = el.split('/').join('\\');
			powGlobals.videos[newVideoId].byteLength = fs.statSync(el.split('/').join('\\')).size;
			powGlobals.videos[newVideoId].local = 1;
			wjs().addPlaylist({
				 url: "file:///"+el,
				 title: getName(el)
			});
			if (disableAll) wjs().emitJsMessage("[disable]"+newVideoId);
			else if (getSeason(el) == getSeason(powGlobals.videos[powGlobals.videos.length - 2].filename) && getEpisode(el) -1 != getEpisode(powGlobals.videos[powGlobals.videos.length - 2].filename)) {
				wjs().emitJsMessage("[disable]"+newVideoId);
				disableAll = true;
			}
		});
		mj++;
		wjs().emitJsMessage("[refresh-playlist]");
		wjs().emitJsMessage("[refresh-disabled]");
		wjs().emitJsMessage("[end-scan-library]"+mj);
	});
}
