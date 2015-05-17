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
				  if (alphanumCase(cleanName(getName(file)),cleanName(getName(powGlobals.videos[powGlobals.videos.length - 1].filename))) >0) {
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
	  
		results = naturalSort(naturalSort(results),2);
		
		var mj;
		
		results.forEach(function(el,ij) {
			mj = ij;
			if (ij == 0) {
				if (matchSeasons(powGlobals.videos[powGlobals.videos.length - 1].filename,el.split('/').pop()) == 0 && alphanumCase(cleanName(getName(el)),cleanName(getName(powGlobals.videos[powGlobals.videos.length - 1].filename))) == 1) {
					allGood = 1;
				} else if (matchSeasons(powGlobals.videos[powGlobals.videos.length - 1].filename,el.split('/').pop()) == 1) {
					if (parseInt(getShortSzEp(el.split('/').pop()).split("e")[1]) == 1) allGood = 1;
				}
			}
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
			if (ij == 0) {
				if (typeof allGood === 'undefined') wjs().emitJsMessage("[disable]"+newVideoId);
			} else {
				if (typeof allGood !== 'undefined') {
					if (alphanumCase(cleanName(getName(el)),cleanName(getName(results[ij-1]))) != 1) {
						wjs().emitJsMessage("[disable]"+newVideoId);
						delete allGood;
					}
				} else wjs().emitJsMessage("[disable]"+newVideoId);
			}
		});
		mj++;
		wjs().emitJsMessage("[refresh-disabled]");
		wjs().emitJsMessage("[end-scan-library]"+mj);
	});
}
