/*****************************************************************************
* Copyright (c) 2015 Branza Victor-Alexandru <branza.alex[at]gmail.com>
*
* This program is free software; you can redistribute it and/or modify it
* under the terms of the GNU Lesser General Public License as published by
* the Free Software Foundation; either version 2.1 of the License, or
* (at your option) any later version.
*
* This program is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
* GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License
* along with this program; if not, write to the Free Software Foundation,
* Inc., 51 Franklin Street, Fifth Floor, Boston MA 02110-1301, USA.
*****************************************************************************/

localStorage.powderVersion = "0.17";

var checkedUpdates = 0;

if (typeof localStorage.maxPeers === 'undefined') localStorage.maxPeers = 200;
if (typeof localStorage.tmpDir === 'undefined') localStorage.tmpDir = 'Temp';
if (typeof localStorage.libDir === 'undefined') localStorage.libDir = 'Temp';
if (typeof localStorage.clickPause === 'undefined') localStorage.clickPause = 'both';
$("#max-peers").text(localStorage.maxPeers);
$("#spinner").val(localStorage.maxPeers);
$("#def-folder").text(localStorage.tmpDir);
if (localStorage.libDir == "Temp") {
	$("#lib-folder").text("same as Download Folder");
} else $("#lib-folder").text(localStorage.libDir);
if (localStorage.clickPause == 'fullscreen') {
	$("#click-pause").text("only in Fullscreen");
} else $("#click-pause").text("Fullscreen + Windowed");

// natural sort order function for playlist
function alphanumCase(a, b) {
  function chunkify(t) {
    var tz = new Array();
    var x = 0, y = -1, n = 0, i, j;

    while (i = (j = t.charAt(x++)).charCodeAt(0)) {
      var m = (i == 46 || (i >=48 && i <= 57));
      if (m !== n) {
        tz[++y] = "";
        n = m;
      }
      tz[y] += j;
    }
    return tz;
  }

  var aa = chunkify(a.toLowerCase());
  var bb = chunkify(b.toLowerCase());

  for (x = 0; aa[x] && bb[x]; x++) {
    if (aa[x] !== bb[x]) {
      var c = Number(aa[x]), d = Number(bb[x]);
      if (c == aa[x] && d == bb[x]) {
        return c - d;
      } else return (aa[x] > bb[x]) ? 1 : -1;
    }
  }
  return aa.length - bb.length;
}
// end natural sort order function for playlist

function regTorrent() {
	fs.writeFile(gui.App.dataPath+'\\register-torrent.reg', 'REGEDIT4\r\n[HKEY_CURRENT_USER\\Software\\Classes\\powder.player.v1\\DefaultIcon]\r\n@="'+process.execPath.split("\\").join("\\\\")+'"\r\n[HKEY_CURRENT_USER\\Software\\Classes\\powder.player.v1\\shell\\open\\command]\r\n@="\\"'+process.execPath.split("\\").join("\\\\")+'\\" \\"%1\\""\r\n[HKEY_CURRENT_USER\\Software\\Classes\\.torrent]\r\n@="powder.player.v1"\r\n"Content Type"="application/x-bittorrent"', function (err) {
        if (err) throw err;
        gui.Shell.openExternal(gui.App.dataPath+'\\register-torrent.reg');
    });
}

function regVideos() {
	fs.writeFile(gui.App.dataPath+'\\register-videos.reg', 'REGEDIT4\r\n[HKEY_CURRENT_USER\\Software\\Classes\\powder.player.v1\\DefaultIcon]\r\n@="'+process.execPath.split("\\").join("\\\\")+'"\r\n[HKEY_CURRENT_USER\\Software\\Classes\\powder.player.v1\\shell\\open\\command]\r\n@="\\"'+process.execPath.split("\\").join("\\\\")+'\\" \\"%1\\""\r\n[HKEY_CURRENT_USER\\Software\\Classes\\.avi]\r\n@="powder.player.v1"\r\n"Content Type"="video/avi"\r\n[HKEY_CURRENT_USER\\Software\\Classes\\.mkv]\r\n@="powder.player.v1"\r\n"Content Type"="video/x-matroska"\r\n[HKEY_CURRENT_USER\\Software\\Classes\\.mp4]\r\n@="powder.player.v1"\r\n"Content Type"="video/mp4"', function (err) {
        if (err) throw err;
        gui.Shell.openExternal(gui.App.dataPath+'\\register-videos.reg'); 
    });
}

function regMagnet() {
	fs.writeFile(gui.App.dataPath+'\\register-magnet.reg', 'REGEDIT4\r\n[HKEY_CLASSES_ROOT\\Magnet]\r\n@="URL:magnet Protocol"\r\n"Content Type"="application/x-magnet"\r\n"URL Protocol"=""\r\n\[HKEY_CLASSES_ROOT\\Magnet\\DefaultIcon]\r\n@="\\"'+process.execPath.split("\\").join("\\\\")+'\\"\r\n[HKEY_CLASSES_ROOT\\Magnet\\shell]\r\n[HKEY_CLASSES_ROOT\\Magnet\\shell\\open]\r\n[HKEY_CLASSES_ROOT\\Magnet\\shell\\open\\command]\r\n@="\\"'+process.execPath.split("\\").join("\\\\")+'\\" \\"%1\\""\r\n[HKEY_CURRENT_USER\\Software\\Classes\\Magnet]\r\n@="URL:magnet Protocol"\r\n"Content Type"="application/x-magnet"\r\n"URL Protocol"=""\r\n[HKEY_CURRENT_USER\\Software\\Classes\\Magnet\\DefaultIcon]\r\n@="\\"'+process.execPath.split("\\").join("\\\\")+'\\"\r\n[HKEY_CURRENT_USER\\Software\\Classes\\Magnet\\shell]\r\n[HKEY_CURRENT_USER\\Software\\Classes\\Magnet\\shell\\open]\r\n[HKEY_CURRENT_USER\\Software\\Classes\\Magnet\\shell\\open\\command]\r\n@="\\"'+process.execPath.split("\\").join("\\\\")+'\\" \\"%1\\""', function (err) {
        if (err) throw err;
        gui.Shell.openExternal(gui.App.dataPath+'\\register-magnet.reg'); 
    });
}

function changeClickPause() {
	if (localStorage.clickPause == 'fullscreen') {
		$("#click-pause").text("Fullscreen + Windowed");
		localStorage.clickPause = "both";
		wjs().emitJsMessage("[pause-policy]both");
	} else {
		$("#click-pause").text("only in Fullscreen");
		localStorage.clickPause = "fullscreen";
		wjs().emitJsMessage("[pause-policy]fullscreen");
	}
}

function openPeerSelector() {
	if($('#max-peers').is(':visible')) $('#max-peers').hide(0,function() { $('.ui-spinner').show(0); })
}

$('#max-peers-hov').hover(function() { }, function() {
	if ($('.ui-spinner').is(":hover") === false) if ($('.ui-spinner').is(':visible')) $('.ui-spinner').hide(0,function() {
		$('#max-peers').text($('#spinner').val()).show(0);
		localStorage.maxPeers = parseInt($('#spinner').val());
	})
});

var isReady = 0;
var downSpeed;
var sleepTimer;

var gui = require('nw.gui');

gui.Screen.Init();

var win = gui.Window.get();

win.zoomLevel = -1;
$('#open-url').css('top', Math.round(($(window).height() - 187) / 2)+'px');

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
    if ($(document).scrollTop() == 0) if (typeof powGlobals.engine !== 'undefined') if (powGlobals.hasVideo > 0) {
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

$(function() {
	$('.easy-modal').easyModal({
		top: 200,
		overlay: 0.2
	});

	$('.easy-modal-open').click(function(e) {
		var target = $(this).attr('href');
		$(target).trigger('openModal');
		e.preventDefault();
	});

	$('.easy-modal-close').click(function(e) {
		$('.easy-modal').trigger('closeModal');
	});

	$('.easy-modal-animated').easyModal({
		top: 200,
		overlay: 0.2,
		transitionIn: 'animated bounceInLeft',
		transitionOut: 'animated bounceOutRight',
		closeButtonClass: '.animated-close'
	});
	
	$('.second-easy-modal-animated').easyModal({
		top: 200,
		overlay: 0.2,
		transitionIn: 'animated bounceInLeft',
		transitionOut: 'animated bounceOutRight',
		closeButtonClass: '.second-animated-close'
	});
	
	$('.third-easy-modal-animated').easyModal({
		top: 200,
		overlay: 0.2,
		transitionIn: 'animated bounceInLeft',
		transitionOut: 'animated bounceOutRight',
		closeButtonClass: '.third-animated-close'
	});
	$('.forth-easy-modal-animated').easyModal({
		top: 200,
		overlay: 0.2,
		transitionIn: 'animated bounceInLeft',
		transitionOut: 'animated bounceOutRight',
		closeButtonClass: '.forth-animated-close'
	});
	
	$('.update-easy-modal-animated').easyModal({
		top: 200,
		overlay: 0.2,
		transitionIn: 'animated bounceInLeft',
		transitionOut: 'animated bounceOutRight',
		closeButtonClass: '.update-animated-close'
	});
});

function checkInternet(cb) {
	require('dns').lookup('google.com',function(err) {
		if (err && err.code == "ENOTFOUND") {
			$('#internet-ok').hide();
			$('#internet-error').show(1);
			cb(false);
		} else {
			$('#internet-error').hide();
			$('#internet-ok').show(1);
			cb(true);
		}
	})
}

// prevent default behavior from changing page on ped file
window.ondragover = function(e) { e.preventDefault(); return false };
window.ondrop = function(e) { e.preventDefault(); return false };

var holder = document.getElementById('holder');
holder.ondragover = function () { this.className = 'hover'; return false; };
holder.ondragleave = function () { this.className = ''; return false; };
holder.ondrop = function (e) {
  e.preventDefault();
  win.focus();
  resetPowGlobals();
  
  if (e.dataTransfer.files.length == 1) {
	  runURL(e.dataTransfer.files[0].path);
  } else {
	  var newFiles = [];
	  for (var i = 0; i < e.dataTransfer.files.length; ++i) newFiles[i] = e.dataTransfer.files[i].path;
	  runMultiple(newFiles);
  }
  this.className = '';
  return false;
  wjs().emitJsMessage("[refresh-playlist]");
};

function runMultiple(fileArray) {
	
  // if multiple files dropped and one is a torrent, only add the torrent
  if (fileArray.length > 1) for (var i = 0; i < fileArray.length; ++i) if (fileArray[i].split('.').pop().toLowerCase() == 'torrent') {
	  runURL(fileArray[i]);
	  return false;
  }
  // end only 1 torrent limit

  setOnlyFirst = 2;
  
	// playlist natural order
	if (fileArray.length > 1) {
		perfect = false;
		while (!perfect) {
			perfect = true;
			for (ij = 0; typeof fileArray[ij] !== 'undefined'; ij++) {
				if (typeof fileArray[ij+1] !== 'undefined') {
					difference = alphanumCase(fileArray[ij],fileArray[ij+1]);
					if (difference > 0) {
						perfect = false;
						tempHold = fileArray[ij];
						fileArray[ij] = fileArray[ij+1];
						fileArray[ij+1] = tempHold;
					}
				}
			}
		}
	}
	// end playlist natural order

  for (ij = 0; typeof fileArray[ij] !== 'undefined'; ij++) runURL(fileArray[ij]);
  
  powGlobals.videos = [];
  
  for (ij = 0; typeof fileArray[ij] !== 'undefined'; ij++) {
	powGlobals.videos[ij] = [];
	powGlobals.videos[ij].filename = fileArray[ij].split('\\').pop();
	powGlobals.videos[ij].path = fileArray[ij];
  }
  setOnlyFirst = 0;
  
  return false;
}

var supportedVideo = ["mkv", "avi", "mp4", "mpg", "mpeg", "webm", "flv", "ogg", "ogv", "mov", "wmv", "3gp", "3g2"];
var powGlobals = [];
var torPieces = [];
var setOnlyFirst = 0;
var altLength = 0;
var fs = require('fs');
var probe = require('node-ffprobe');
var peerflix = require('peerflix');
var opensubtitles = require('opensubtitles-client');
var OS = require("opensubtitles-api");
var os = new OS();
var onTop = false;
var firstTime = 0;
var firstTimeEver = 1;
var prebuf = 0;
var focused = true;
var findHashTime;
var doSubsLocal = 0;
var peerInterval;

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
			  if (getShowName(powGlobals.videos[powGlobals.videos.length - 1].filename) == getShowName(file.split('/').pop())) {
				  if (alphanumCase(cleanName(getName(file.split('/').pop())),cleanName(getName(powGlobals.videos[powGlobals.videos.length - 1].filename))) >0) {
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

function cleanName(filename) {
	return filename.replace("-"," ").replace("["," ").replace("]"," ").replace("("," ").replace(")"," ").replace(","," ").replace("  "," ").replace("  "," ").replace("  "," ").toLowerCase();
}

function getShowName(filename) {
	findParts = cleanName(getName(filename)).split(" ");
	newarray = [];
	for (ik = 0; typeof findParts[ik] !== 'undefined'; ik++) {
		if (isNaN(findParts[ik]) === false && findParts[ik].length == 4) {
			break;
		} else if (isNaN(findParts[ik].replace("s","").replace("e","")) === false && findParts[ik].replace("s","").replace("e","").length == 4) {
			break;
		} else if (isNaN(findParts[ik].replace("s","").replace("e","").replace("-","").replace("e","")) === false && findParts[ik].replace("s","").replace("e","").replace("-","").replace("e","").length == 6) {
			break;
		} else {
			newarray.push(findParts[ik]);
		}
	}
	return newarray.join(" ");
}

function getShortSzEp(filename) {
	findParts = cleanName(getName(filename)).split(" ");
	for (ik = 0; typeof findParts[ik] !== 'undefined'; ik++) {
		if (isNaN(findParts[ik].replace("s","").replace("e","")) === false && findParts[ik].replace("s","").replace("e","").length == 4) {
			return findParts[ik].toLowerCase();
		} else if (isNaN(findParts[ik].replace("s","").replace("e","").replace("-","").replace("e","")) === false && findParts[ik].replace("s","").replace("e","").replace("-","").replace("e","").length == 6) {
			return findParts[ik].split("-")[0].toLowerCase();
			break;
		}
	}
	return false;
}

function matchSeasons(filenameOne,filenameTwo) {
	findParts = cleanName(getName(filenameOne)).split(" ");
	for (ik = 0; typeof findParts[ik] !== 'undefined'; ik++) {
		if (isNaN(findParts[ik].replace("s","").replace("e","")) === false && findParts[ik].replace("s","").replace("e","").length == 4) {
			firstSeason = parseInt(findParts[ik].split("e")[0].replace("s",""));
			break;
		} else if (isNaN(findParts[ik].replace("s","").replace("e","").replace("-","").replace("e","")) === false && findParts[ik].replace("s","").replace("e","").replace("-","").replace("e","").length == 6) {
			firstSeason = parseInt(findParts[ik].split("e")[0].replace("s",""));
			break;
		}
	}
	findParts = cleanName(getName(filenameTwo)).split(" ");
	for (ik = 0; typeof findParts[ik] !== 'undefined'; ik++) {
		if (isNaN(findParts[ik].replace("s","").replace("e","")) === false && findParts[ik].replace("s","").replace("e","").length == 4) {
			secondSeason = parseInt(findParts[ik].split("e")[0].replace("s",""));
			break;
		} else if (isNaN(findParts[ik].replace("s","").replace("e","").replace("-","").replace("e","")) === false && findParts[ik].replace("s","").replace("e","").replace("-","").replace("e","").length == 6) {
			secondSeason = parseInt(findParts[ik].split("e")[0].replace("s",""));
			break;
		}
	}
	if (typeof firstSeason !== 'undefined' && typeof secondSeason !== 'undefined') {
		if (firstSeason == secondSeason) {
			return 0;
		} else if (firstSeason < secondSeason) {
			return -1;
		} else if (firstSeason > secondSeason) {
			return 1;
		}
	}
	return false;
}

function scanLibrary() {
	
	if (localStorage.libDir == 'Temp') {
		if (localStorage.tmpDir != 'Temp') {
			libDir = localStorage.tmpDir;
		} else if (typeof powGlobals.engine !== 'undefined') {
			libDir = powGlobals.engine.path;
		}
	} else libDir = localStorage.libDir;
	
	if (typeof libDir !== 'undefined') walk(libDir, function(err, results) {
	  if (err) throw err;
	  
//	  console.log(results);
	  
	  // remove duplicate episodes
	  remSzEp = [];
	  cleanArray = [];
	  for (im = 0; typeof results[im] !== 'undefined'; im++) {
		  if (getShortSzEp(results[im].split('/').pop()) !== false && remSzEp.indexOf(getShortSzEp(results[im].split('/').pop())) == -1) {
			  remSzEp.push(getShortSzEp(results[im].split('/').pop()));
			  cleanArray.push(results[im]);
		  }
	  }
	  results = cleanArray;
	  // end remove duplicate episodes
	  
		// playlist natural order
		if (results.length > 1) {
			perfect = false;
			while (!perfect) {
				perfect = true;
				for (ij = 0; typeof results[ij] !== 'undefined'; ij++) {
					if (typeof results[ij+1] !== 'undefined') {
						difference = alphanumCase(getName(results[ij].split('/').pop()),getName(results[ij+1].split('/').pop()));
						if (difference > 0) {
							perfect = false;
							tempHold = results[ij];
							results[ij] = results[ij+1];
							results[ij+1] = tempHold;
						}
					}
				}
			}
			perfect = false;
			while (!perfect) {
				perfect = true;
				for (ij = 0; typeof results[ij] !== 'undefined'; ij++) {
					if (typeof results[ij+1] !== 'undefined') {
						difference = matchSeasons(results[ij].split('/').pop(),results[ij+1].split('/').pop());
						if (difference > 0) {
							perfect = false;
							tempHold = results[ij];
							results[ij] = results[ij+1];
							results[ij+1] = tempHold;
						}
					}
				}
			}
		}
		// end playlist natural order
	  
	  for (ij = 0; typeof results[ij] !== 'undefined'; ij++) {
		  if (ij == 0) {
			  if (matchSeasons(powGlobals.videos[powGlobals.videos.length - 1].filename,results[ij].split('/').pop()) == 0 && alphanumCase(cleanName(getName(results[ij].split('/').pop())),cleanName(getName(powGlobals.videos[powGlobals.videos.length - 1].filename))) == 1) {
				  allGood = 1;
			  } else if (matchSeasons(powGlobals.videos[powGlobals.videos.length - 1].filename,results[ij].split('/').pop()) == 1) {
				  console.log(results[ij]);
				  if (parseInt(getShortSzEp(results[ij].split('/').pop()).split("e")[1]) == 1) allGood = 1;
			  }
		  }
//		  console.log("file:///"+results[ij]+" ||| "+getName(results[ij]));
		    newVideoId = powGlobals.videos.length;
			powGlobals.videos[newVideoId] = [];
		    powGlobals.videos[newVideoId].filename = results[ij].split('/').pop();
		    powGlobals.videos[newVideoId].path = results[ij].split('/').join('\\');
			powGlobals.videos[newVideoId].byteLength = fs.statSync(results[ij].split('/').join('\\')).size;
			powGlobals.videos[newVideoId].local = 1;
			wjs().addPlaylist({
				 url: "file:///"+results[ij],
				 title: getName(results[ij].split('/').pop()),
				 vlcArgs: "--avi-index=3"
			});
			if (ij == 0) {
				if (typeof allGood === 'undefined') wjs().emitJsMessage("[disable]"+newVideoId);
			} else {
				if (typeof allGood !== 'undefined') {
					if (alphanumCase(cleanName(getName(results[ij].split('/').pop())),cleanName(getName(results[ij-1].split('/').pop()))) != 1) {
						wjs().emitJsMessage("[disable]"+newVideoId);
						delete allGood;
					}
				} else wjs().emitJsMessage("[disable]"+newVideoId);
			}
	  }
	  wjs().emitJsMessage("[refresh-disabled]");
	  wjs().emitJsMessage("[end-scan-library]"+ij);
	});
}

function delayDisable(newVideoId) {
    return function(){
		wjs().emitJsMessage("[disable]"+newVideoId);
    }
}

function resizeInBounds(newWidth,newHeight) {
	// find the screen where the window is
	for(var i = 0; i < gui.Screen.screens.length; i++) {
		var screen = gui.Screen.screens[i];
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
			break;
		}
	}
	// end find the screen where the window is
	wjs().emitJsMessage("[refresh-aspect]");
}

win.on('focus', function() { focused = true; win.setProgressBar(-0.1); }); 
win.on('blur', function() {
	focused = false;
	if ($('#main').css("display") != "table" && typeof powGlobals.engine !== 'undefined' && powGlobals.hasVideo == 0 && parseInt($('#all-download .progress-bar').attr('data-transitiongoal')) < 100) win.setProgressBar(parseInt($('#all-download .progress-bar').attr('data-transitiongoal'))/100);
}); 

function isPlaying() {
	if (doSubsLocal == 1 && typeof powGlobals.engine === 'undefined') {
		wjs().setDownloaded(0.0000000000000000001);
		doSubsLocal = 0;
		getLength();
	}
	if (firstTime == 0 && focused === false) if (!wjs().fullscreen()) win.requestAttention(true);
	if (firstTime == 0) {
		if (typeof powGlobals.duration !== 'undefined') wjs().setTotalLength(powGlobals.duration);
		if (firstTimeEver == 1) {
			if (typeof localStorage.savedVolume !== 'undefined') setTimeout(function() { wjs().volume(localStorage.savedVolume); },100);
			setTimeout(function() { wjs().onVolume(function() { if (this.volume() > 0) localStorage.savedVolume = this.volume(); }); },101);
		}
		if (firstTimeEver == 1 && wjs().fullscreen() === false) {
			firstTimeEver = 0;
			resizeInBounds((wjs().width() + (win.width - window.innerWidth)),(wjs().height() + (win.height - window.innerHeight)));
		}
		firstTime = 1;
		wjs().plugin.subtitle.track = 0;
	}
	if ($("body").css("overflow-y") == "visible" || $("body").css("overflow-y") == "auto") $('html, body').animate({ scrollTop: 0 }, 'slow');
}

function isOpening() {
	if (powGlobals.currentIndex != wjs().currentItem()) {
		delete powGlobals.duration;
		delete powGlobals.fileHash;
		powGlobals.currentIndex = wjs().currentItem();
		if (typeof powGlobals.engine !== 'undefined') {
			wjs().setOpeningText("Prebuffering 0%");
			if (typeof powGlobals.videos[wjs().currentItem()] !== 'undefined' && typeof powGlobals.videos[wjs().currentItem()].local === 'undefined') {
				for (gh = 0; typeof powGlobals.files[gh] !== 'undefined'; gh++) if (powGlobals.files[gh].index == powGlobals.videos[wjs().currentItem()].index) break;
				playEl(gh);				
			}
			win.title = getName(powGlobals.videos[wjs().currentItem()].filename);
			wjs().setDownloaded(0);
			
			powGlobals.filename = powGlobals.videos[wjs().currentItem()].filename;
			powGlobals.path = powGlobals.videos[wjs().currentItem()].path;
			if (typeof powGlobals.videos[wjs().currentItem()].byteLength !== 'undefined') {
				powGlobals.byteLength = powGlobals.videos[wjs().currentItem()].byteLength;
			} else {
				if (typeof powGlobals.byteLength !== 'undefined') delete powGlobals.byteLength;
			}
			if (typeof powGlobals.videos[wjs().currentItem()].local === 'undefined') {
				powGlobals.firstPiece = powGlobals.videos[wjs().currentItem()].firstPiece;
				powGlobals.lastPiece = powGlobals.videos[wjs().currentItem()].lastPiece;
			}
			firstTime = 0;
			
			checkInternet(function(isConnected) {
				if (isConnected && typeof powGlobals.byteLength !== 'undefined') $.ajax({ type: 'GET', url: window.atob("aHR0cDovL3Bvd2Rlci5tZWRpYS9tZXRhRGF0YS9nZXQucGhwP2Y9")+encodeURIComponent(powGlobals.filename)+window.atob("Jmg9")+encodeURIComponent(powGlobals.hash)+window.atob("JnM9")+encodeURIComponent(powGlobals.byteLength), global: false, cache: false, success: readData });
			});
		} else {
			wjs().setOpeningText("Prebuffering");
			if (wjs().currentItem() > -1) {
				win.title = getName(powGlobals.videos[wjs().currentItem()].filename);
				powGlobals.filename = powGlobals.videos[wjs().currentItem()].filename;
				powGlobals.path = powGlobals.videos[wjs().currentItem()].path;
				doSubsLocal = 1;
			}
		}
	}
}

function getReadableFileSizeString(fileSizeInBytes) {

    var i = -1;
    var byteUnits = [' kB', ' MB', ' GB', ' TB', 'PB', 'EB', 'ZB', 'YB'];
    do {
        fileSizeInBytes = fileSizeInBytes / 1024;
        i++;
    } while (fileSizeInBytes > 1024);

    return Math.max(fileSizeInBytes, 0.1).toFixed(1) + byteUnits[i];
}

function getName(filename) {
	// parse filename to get title
	if (filename.indexOf(".") > -1) {
		// remove extension
		var tempName = filename.replace("."+filename.split('.').pop(),"");
		if (tempName.length > 3) filename = tempName;
		delete tempName;
	}
	filename = unescape(filename);
	filename = filename.split('_').join(' ');
	filename = filename.split('.').join(' ');
	filename = filename.split('  ').join(' ');
	filename = filename.split('  ').join(' ');
	filename = filename.split('  ').join(' ');
	
	// capitalize first letter
	filename = filename.charAt(0).toUpperCase() + filename.slice(1);
	
	return filename;
}

function playEl(kj) {
	if (powGlobals.engine.swarm.wires.length < 5) powGlobals.engine.discover();
	if ($("#action"+kj).hasClass("play")) $("#action"+kj).removeClass("play").addClass("pause").css("background-color","#F6BC24").attr("onClick","pauseEl("+kj+")");
	powGlobals.engine.files[powGlobals.files[kj].index].select();
}

function pauseEl(kj) {
	if ($("#action"+kj).hasClass("pause")) $("#action"+kj).removeClass("pause").addClass("play").css("background-color","#FF704A").attr("onClick","playEl("+kj+")");
	powGlobals.engine.files[powGlobals.files[kj].index].deselect();
}

function settingsEl(kj) {
	if (parseInt($("#progressbar"+kj).attr("data-transitiongoal")) > 0) {
		$("#openAction").attr("onClick","gui.Shell.openItem(powGlobals['engine'].path+'\\\\'+powGlobals['engine'].files[powGlobals['files']["+kj+"].index].path); $('#closeAction').trigger('click'); playEl("+kj+")");
		$("#openFolderAction").attr("onClick","gui.Shell.showItemInFolder(powGlobals['engine'].path+'\\\\'+powGlobals['engine'].files[powGlobals['files']["+kj+"].index].path); $('#closeAction').trigger('click')");
		$("#openAction").show(0);
		$("#openFolderAction").show(0);
	} else {
		$("#openAction").hide(0);
		$("#openFolderAction").hide(0);
	}
	if (supportedVideo.indexOf($("#file0").find(".filenames").text().split(".").pop()) > -1) {
		// if the item is a video
		for (ij = 0; typeof powGlobals.videos[ij] !== 'undefined'; ij++) if (powGlobals.videos[ij].index == powGlobals.files[kj].index) break;
		$("#playAction").attr("onClick","wjs().playItem("+ij+"); $('#closeAction').trigger('click'); $('html, body').animate({ scrollTop: 0 }, 'slow'); playEl("+kj+"); $('body').css('overflow-y','hidden')");
		$("#copyStream").attr("onClick","gui.Clipboard.get().set('http://localhost:'+powGlobals['engine'].server.address().port+'/"+powGlobals.files[kj].index+"','text'); $('#closeAction').trigger('click')");
		$("#playAction").show(0);
		$("#copyStream").show(0);
	} else {
		$("#playAction").hide(0);
		$("#copyStream").hide(0);
	}
	$("#open-file-settings").trigger("click");
}

function checkSpeed() {
	if ($('#all-download .progress-bar').attr('data-transitiongoal') < 100) {
		if (powGlobals.speedPiece < powGlobals.allPieces) {
			tempText = (powGlobals.allPieces - powGlobals.speedPiece) /3;
			$("#speed").text(getReadableFileSizeString(Math.floor(tempText * powGlobals.engine.torrent.pieceLength))+"/s");
		} else $("#speed").text("0.0 kB/s");
		powGlobals.speedPiece = powGlobals.allPieces;
		downSpeed = setTimeout(function(){ checkSpeed(); }, 3000);
	} else {
		$("#speed").text("0.0 kB/s");
	}
}

function checkDownloaded(piece) {
	powGlobals.lastDownloadTime = Math.floor(Date.now() / 1000);
	if (firstTime == 0) {
		if (prebuf == 0) {
			prebuf = 20;
		} else if (prebuf == 20) {
			prebuf = 50;
		} else if (prebuf == 50) {
			prebuf = 70;
		} else if (prebuf == 70) {
			prebuf = 80;
		} else if (prebuf == 80) {
			prebuf = 90;
		} else if (prebuf == 90) {
			prebuf = Math.floor(((100 - prebuf) /2) +prebuf);
		}
		wjs().setOpeningText("Prebuffering "+prebuf+"%");
	}
	for (kj = 0; typeof powGlobals.videos[kj] !== 'undefined'; kj++) {
		if (piece >= powGlobals.videos[kj].firstPiece && piece <= powGlobals.videos[kj].lastPiece && piece > 0) {
			if (powGlobals.videos[kj].downloaded +1 == piece - powGlobals.videos[kj].firstPiece) {
				powGlobals.videos[kj].downloaded++;
			} else {
				torPieces.push(piece);
				torPieces.sort(function(a,b){return a-b});
			}
			if (torPieces.indexOf(powGlobals.videos[kj].downloaded +1 +powGlobals.videos[kj].firstPiece) > -1) {
				var torIndex = torPieces.indexOf(powGlobals.videos[kj].downloaded +1 +powGlobals.videos[kj].firstPiece);
				while ((powGlobals.videos[kj].downloaded +1 +powGlobals.videos[kj].firstPiece) == torPieces[torIndex]) {
					powGlobals.videos[kj].downloaded++;
					torPieces.splice(torIndex, 1)
				}
			}
			if (kj == wjs().currentItem()) {
				if ((powGlobals.videos[kj].downloaded / (powGlobals.videos[kj].lastPiece - powGlobals.videos[kj].firstPiece)) > powGlobals.videos[kj].lastSent) {
					powGlobals.videos[kj].lastSent = (powGlobals.videos[kj].downloaded / (powGlobals.videos[kj].lastPiece - powGlobals.videos[kj].firstPiece));
					if (typeof wjs() !== 'undefined' && typeof wjs().setDownloaded !== 'undefined') {
						wjs().setDownloaded(powGlobals.videos[kj].lastSent);
					}
				}
			} else {
				if ((powGlobals.videos[kj].downloaded / (powGlobals.videos[kj].lastPiece - powGlobals.videos[kj].firstPiece)) > powGlobals.videos[kj].lastSent) {
					powGlobals.videos[kj].lastSent = (powGlobals.videos[kj].downloaded / (powGlobals.videos[kj].lastPiece - powGlobals.videos[kj].firstPiece));
				}
			}
		}
	}

	powGlobals.allPieces++;
	if (powGlobals.allPieces * powGlobals.engine.torrent.pieceLength <= powGlobals.engine.torrent.length) {
		$("#downPart").text(getReadableFileSizeString(Math.floor(powGlobals.allPieces * powGlobals.engine.torrent.pieceLength)));
	} else {
		$("#downPart").text(getReadableFileSizeString(Math.floor(powGlobals.engine.torrent.length)));
	}
	updDownload = Math.floor((powGlobals.allPieces / (((powGlobals.engine.torrent.length - powGlobals.engine.torrent.lastPieceLength) / powGlobals.engine.torrent.pieceLength) +1)) *100);
	if (updDownload != powGlobals.lastDownload) {
		powGlobals.lastDownload = updDownload;
		if (updDownload >= 100) {
			$('#all-download .progress-bar').removeClass("progress-bar-warning").addClass("progress-bar-danger").attr('data-transitiongoal', 100).progressbar({display_text: 'center'});
			if (!focused) {
				win.setProgressBar(-0.1);
				win.requestAttention(true);
			}
		} else {
			$('#all-download .progress-bar').attr('data-transitiongoal', updDownload).progressbar({display_text: 'center'});
			if (focused === false && $('#main').css("display") != "table" && typeof powGlobals.engine !== 'undefined' && powGlobals.hasVideo == 0) win.setProgressBar(parseInt(updDownload)/100);
		}
	}

	for (kj = 0; typeof powGlobals.files[kj] !== 'undefined'; kj++) {
		if (piece >= powGlobals.files[kj].firstPiece && piece <= powGlobals.files[kj].lastPiece && piece > 0) {
			powGlobals.files[kj].downloaded++;
			updDownload = Math.floor((powGlobals.files[kj].downloaded / (powGlobals.files[kj].lastPiece - powGlobals.files[kj].firstPiece)) *100);
			if (updDownload != powGlobals.files[kj].lastDownload) {
				newFileSize = Math.floor(powGlobals.files[kj].byteLength * (updDownload /100));
				if (newFileSize > powGlobals.files[kj].byteLength) {
					$("#down-fl"+kj).text(getReadableFileSizeString(Math.floor(powGlobals.files[kj].byteLength)));
				} else {
					$("#down-fl"+kj).text(getReadableFileSizeString(Math.floor(powGlobals.files[kj].byteLength * (updDownload /100))));
				}
				powGlobals.files[kj].lastDownload = updDownload;
				if (updDownload >= 100) {
					// give some time for the file to write then declare the video as finished
					setTimeout(delayFinished(kj),20000);
					
					$("#action"+kj).removeClass("pause").addClass("settings").attr("onClick","settingsEl("+kj+")");
					$('#p-file'+kj+' .progress-bar').removeClass("progress-bar-info").addClass("progress-bar-success").attr('data-transitiongoal', 100).progressbar({display_text: 'center'});
				} else {
					$('#p-file'+kj+' .progress-bar').attr('data-transitiongoal', updDownload).progressbar({display_text: 'center'});
				}
			}
		}
	}
}

function peerCheck() {
	if (powGlobals.engine.swarm.wires.length > 0) {
		if (isReady == 0) {
			powGlobals.seeds = powGlobals.engine.swarm.wires.length;
			wjs().setOpeningText("Connected to "+powGlobals.seeds+" peers");
		}
	}
	$("#nrPeers").text(powGlobals.engine.swarm.wires.length);
	
	// if more then 1 minute has past since last downloaded piece, restart peer discovery
	if (Math.floor(Date.now() / 1000) - powGlobals.lastDownloadTime > 60) {
		if ($(".pause:visible").length > 0) {
			if (typeof powGlobals.engine !== 'undefined') {
				powGlobals.engine.discover();
			}
		}
	}
}

var onmagnet = function () {
	peerCheck();
}

win.on('close', function() {
	
	if ($('#main').css("display") != "table") {
		if (typeof powGlobals.engine !== 'undefined' && powGlobals.hasVideo == 0) var r = confirm("Are you sure? This action will delete all downloaded files.");
		else r = true;
		if (r) {
			setTimeout(function() { win.close(true); },180000); // fallback, if any error appears and the process didn't finish, the app should still close (3 mins)
			win.hide();
			if ($('#main').css("display") != "table") wjs().stopPlayer();
			if (typeof powGlobals.engine !== 'undefined') {
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

function goBack() {
	if (typeof peerInterval !== 'undefined') clearInterval(peerInterval);
	wjs().setOpeningText("Stopping");
	wjs().emitJsMessage("[tor-data-but]0");
	wjs().emitJsMessage("[refresh-disabled]");
	$("#header_container").css("display","none");
	window.scrollTo(0, 0);
	$("body").css("overflow-y","hidden");
	wjs().fullscreen(false);
	wjs().clearPlaylist();
	pitem["#webchimera"] = 0;
	wjs().setDownloaded(0);
	if (parseInt($("#main").css("opacity")) == 0) $("#main").css("opacity","1");
	$('#main').css("display","table");	
	if (typeof powGlobals.engine !== 'undefined') {
		isReady = 0;
		clearTimeout(downSpeed);
		powGlobals.engine.swarm.removeListener('wire', onmagnet)
		powGlobals.engine.server.close(function() {
			powGlobals.engine.remove(function() {
				powGlobals.engine.destroy();
				powGlobals = [];
			});
		});
	}

	if ($(window).height() < $("#main").height() && win.zoomLevel == 0) {
		if (win.zoomLevel > -1) win.zoomLevel = -1;
	} else if ($(window).width() < $("#main").width() && win.zoomLevel == 0) {
		if (win.zoomLevel > -1) win.zoomLevel = -1;
	} else if ($(window).width() > 730 && $(window).height() > 650 && win.zoomLevel == -1) {
		if (win.zoomLevel < 0) win.zoomLevel = 0;
	}
	$('#open-url').css('top', Math.round(($(window).height() - 187) / 2)+'px');
	
	win.setMinimumSize(530, 440);
	if ((win.width < 530 && win.height < 440) || (win.width < 530 || win.height < 440)) {
		win.width = 530;
		win.height = 440;
	}

	document.getElementById('magnetLink').value = "";
	$('#player_wrapper').css("min-height","1px").css("height","1px").css("width","1px");
	if (onTop) {
		onTop = false;
		win.setAlwaysOnTop(false);
		wjs().emitJsMessage("[on-top]"+onTop);
	}
	firstTime = 0;
	firstTimeEver = 1;
	win.title = "Powder Player";
	if (checkedUpdates == 0) { checkedUpdates = 1; setTimeout(function() { checkUpdates(); },300); }
}

function handleMessages(event) {
    if (event == "[go-back]") {
		goBack();
	} else if (event == "[window-bigger]") {
		resizeInBounds(Math.round(win.width*1.1),Math.round(win.height*1.1));
	} else if (event == "[window-smaller]") {
		resizeInBounds(Math.round(win.width*0.9),Math.round(win.height*0.9));
	} else if (event == "[quit]") {
		win.close();
	} else if (event == "[select-library]") {
		if (wjs().fullscreen()) wjs().toggleFullscreen();
		chooseFile('#libraryDialog');
	} else if (event == "[select-download-folder]") {
		if (wjs().fullscreen()) wjs().toggleFullscreen();
		chooseFile('#folderDialog');
	} else if (event.substr(0,13) == "[sleep-timer]") {
		clearTimeout(sleepTimer);
		if (parseInt(event.replace("[sleep-timer]","")) > 0) {
			sleepTimer = setTimeout(function() {
				if (wjs().isPlaying()) wjs().togglePause();
				if (typeof powGlobals.engine !== 'undefined') {
					if (wjs().fullscreen()) wjs().fullscreen(false);
					$("#filesList").css("min-height",$("#player_wrapper").height());
					$("html, body").animate({ scrollTop: $("#player_wrapper").height() }, "slow");
					$("body").css("overflow-y","visible");
				}
				wjs().emitJsMessage("[reset-sleep-timer]");
			},parseInt(event.replace("[sleep-timer]","")));
		}
	} else if (event.substr(0,10) == "[save-sub]") {
		saveSub = event.substr(10);
		if (saveSub.indexOf(" ") > -1) {
			localStorage.subLang = saveSub.split(" ")[0];
		} else {
			localStorage.subLang = saveSub;
		}
	} else if (event == "[torrent-data]") {
		if (wjs().fullscreen()) wjs().fullscreen(false);
		win.setMinimumSize(448, 370);
		if ((win.width < 448 && win.height < 370) || (win.width < 448 || win.height < 370)) {
			win.width = 448;
			win.height = 370;
			$("#filesList").css("min-height",448);
			$("html, body").animate({ scrollTop: 448 }, "slow");
		} else {
			$("#filesList").css("min-height",$("#player_wrapper").height());
			$("html, body").animate({ scrollTop: $("#player_wrapper").height() }, "slow");
		}
		$("body").css("overflow-y","visible");
	} else if (event == '[add-video]') {
		chooseFile('#addPlaylistDialog');
    } else if (event.substr(0,15) == '[playlist-swap]') {
		var swapItems = event.replace('[playlist-swap]','').split(':');
		if (parseInt(swapItems[1]) < 0) {
			var tmpVideos = [];
			for (ik = 0; typeof powGlobals.videos[ik] !== 'undefined'; ik++) {
				if (ik == (parseInt(swapItems[0]) + parseInt(swapItems[1]))) {
					tmpVideos[ik] = powGlobals.videos[parseInt(swapItems[0])];
				} else if (ik > (parseInt(swapItems[0]) + parseInt(swapItems[1])) && ik <= parseInt(swapItems[0])) {
					tmpVideos[ik] = powGlobals.videos[ik-1];
				} else {
					tmpVideos[ik] = powGlobals.videos[ik];
				}
			}
			setTimeout(function() { powGlobals.currentIndex = wjs().currentItem(); },10);
			powGlobals.videos = tmpVideos;
		} else if (parseInt(swapItems[1]) > 1) {
			var tmpVideos = [];
			for (ik = 0; typeof powGlobals.videos[ik] !== 'undefined'; ik++) {
				if (ik == parseInt(swapItems[0]) + parseInt(swapItems[1])) {
					tmpVideos[ik] = powGlobals.videos[parseInt(swapItems[0])];
				} else if (ik >= parseInt(swapItems[0]) && ik < (parseInt(swapItems[0]) + parseInt(swapItems[1]))) {
					tmpVideos[ik] = powGlobals.videos[ik+1];
				} else {
					tmpVideos[ik] = powGlobals.videos[ik];
				}
			}
			setTimeout(function() { powGlobals.currentIndex = wjs().currentItem(); },10);
			powGlobals.videos = tmpVideos;
		}
	} else if (event == "[scan-library]") {
		scanLibrary();
	} else if (event == "[fix-length]") {
		if (typeof powGlobals.duration !== 'undefined') {
			wjs().setTotalLength(powGlobals.duration);
		} else {
			if (typeof powGlobals.filename !== 'undefined') if (typeof powGlobals.hash !== 'undefined') if (typeof powGlobals.byteLength !== 'undefined') {
				checkInternet(function(isConnected) {
					if (isConnected) {
						$.ajax({ type: 'GET', url: window.atob("aHR0cDovL3Bvd2Rlci5tZWRpYS9tZXRhRGF0YS9nZXQucGhwP2Y9")+encodeURIComponent(powGlobals.filename)+window.atob("Jmg9")+encodeURIComponent(powGlobals.hash)+window.atob("JnM9")+encodeURIComponent(powGlobals.byteLength), dataType: 'json', global: false, cache: false, success: getDuration });
						return false;
					}
				});
			}
			fileExists();
		}
	} else if (event == "[always-on-top]") {
		if (onTop) {
			onTop = false;
			win.setAlwaysOnTop(false);
		} else {
			setTimeout(win.setAlwaysOnTop(true),1);
			onTop = true;
		}
		wjs().emitJsMessage("[on-top]"+onTop);
	} else if (event == "[check-fullscreen]") {
		if (onTop) {
			onTop = false;
			win.setAlwaysOnTop(onTop);
			wjs().emitJsMessage("[on-top]"+onTop);
			setTimeout(function() { wjs().emitJsMessage("[go-fullscreen]"); },1);
		} else wjs().emitJsMessage("[go-fullscreen]");
	}
}

function getLength() {
	fs.exists(powGlobals.path, function(exists) {
		if (exists) {
			probe(powGlobals.path, function(err, probeData) {
				if (typeof probeData !== 'undefined') {
					if (typeof powGlobals.engine === 'undefined') {
						powGlobals.duration = Math.round(probeData.format.duration *1000);
						altLength = probeData.format.size;
						clearTimeout(findHashTime);
						findHash();
					} else {
						globalOldLength = powGlobals.newLength;
						powGlobals.newLength = probeData.format.duration;
						if (globalOldLength != powGlobals.newLength) {
							setTimeout(function() { getLength(); },30000);
						} else {
							if (powGlobals.newLength < 1200) {
								setTimeout(function() { getLength(); },60000);
							} else {
								if (typeof powGlobals.filename !== 'undefined') if (typeof powGlobals.hash !== 'undefined') if (typeof powGlobals.byteLength !== 'undefined') {
									checkInternet(function(isConnected) {
										if (isConnected) $.ajax({ type: 'GET', url: window.atob("aHR0cDovL3Bvd2Rlci5tZWRpYS9tZXRhRGF0YS9zZW5kLnBocD9mPQ==")+encodeURIComponent(powGlobals.filename)+window.atob("Jmg9")+encodeURIComponent(powGlobals.hash)+window.atob("JnM9")+encodeURIComponent(powGlobals.byteLength)+window.atob("JmQ9")+encodeURIComponent(Math.round(powGlobals.newLength *1000)), global: false, cache: false })
									});
								}
								wjs().setTotalLength(Math.round(powGlobals.newLength *1000));
							}
						}
					}
				}
			});
		}
	});
}

function fileExists() {
	if (typeof powGlobals.duration === 'undefined') {
		fs.exists(""+powGlobals.path, function(exists) {
			if (exists) {
				if (wjs().time() > 60000) {
					getLength();
				} else setTimeout(function() { fileExists(); },30000);
			} else setTimeout(function() { fileExists(); },30000);
		});
	}
}

function getDuration(xhr) {
	if (IsJsonString(xhr)) {
		jsonRes = JSON.parse(xhr);
		if (typeof jsonRes.duration !== 'undefined') {
			powGlobals.duration = parseInt(jsonRes.duration);
			wjs().setTotalLength(powGlobals.duration);
		}
	}
}
			
function readData(xhr) {
	if (IsJsonString(xhr)) {
		jsonRes = JSON.parse(xhr);
		if (typeof jsonRes.duration !== 'undefined') {
			powGlobals.duration = parseInt(jsonRes.duration);
		}
		if (typeof jsonRes.filehash !== 'undefined') {
			powGlobals.fileHash = jsonRes.filehash;
			if (typeof powGlobals.byteLength !== 'undefined') {
				subtitlesByExactHash(powGlobals.fileHash,powGlobals.byteLength,powGlobals.filename);
			}
		} else {
			clearTimeout(findHashTime);
			findHash();
		}
	} else {
		clearTimeout(findHashTime);
		findHash();
	}
}

function subtitlesByExactHash(hash,fileSize,tag) {
	opensubtitles.api.login().done(function(token){
		powGlobals.osToken = token;
		utils = require('./node_modules/opensubtitles-client/lib/Utils.js')
		utils._getAllPostData(powGlobals.osToken, "all", hash, fileSize, tag).done(function(postData){
			utils.request("http://api.opensubtitles.org/xml-rpc", postData).done(function(response){
				try{
					results = utils.parseXmlSearchResult(response);
				}catch(e){
					results = [];
				}								
				if (results.length > 0) {
					
					if (typeof powGlobals.engine !== 'undefined') checkInternet(function(isConnected) {
						if (isConnected && typeof powGlobals.byteLength !== 'undefined') $.ajax({ type: 'GET', url: window.atob("aHR0cDovL3Bvd2Rlci5tZWRpYS9tZXRhRGF0YS9zZW5kLnBocD9mPQ==")+encodeURIComponent(powGlobals.filename)+window.atob("Jmg9")+encodeURIComponent(powGlobals.engine.infoHash)+window.atob("JnM9")+encodeURIComponent(powGlobals.byteLength)+window.atob("JmloPQ==")+encodeURIComponent(powGlobals.fileHash), global: false, cache: false });
					});
					
					var howMany = [];
					var theSubs = [];
									
					for (i = 0; typeof results[i] !== 'undefined'; i++) {
						if (results[i].SubFormat.toLowerCase() == "srt" || results[i].SubFormat.toLowerCase() == "sub") {
							subLang = results[i].LanguageName;
							if (typeof howMany[subLang] !== 'undefined') {
								howMany[subLang]++;
								for (k = 0; typeof theSubs[k] !== 'undefined'; k++) if (theSubs[k].lang == subLang) {
									tempStr = theSubs[k].string;
									if (typeof results[i].SubEncoding !== 'undefined') {
										tempStr += '"'+subLang+' '+howMany[subLang]+'": "http://dl.opensubtitles.org/en/download/subencoding-utf8/file/'+results[i].IDSubtitleFile+'.'+results[i].SubFormat+'[-alt-]'+results[i].SubEncoding.replace("-","").toLowerCase()+'", ';
									} else {
										tempStr += '"'+subLang+' '+howMany[subLang]+'": "http://dl.opensubtitles.org/en/download/subencoding-utf8/file/'+results[i].IDSubtitleFile+'.'+results[i].SubFormat+'", ';
									}
									theSubs[k].string = tempStr;
									break;
								}
							} else {
								howMany[subLang] = 1;
								if (typeof results[i].SubEncoding !== 'undefined') {
									var tempStr = '"'+subLang+'": "http://dl.opensubtitles.org/en/download/subencoding-utf8/file/'+results[i].IDSubtitleFile+'.'+results[i].SubFormat+'[-alt-]'+results[i].SubEncoding.replace("-","").toLowerCase()+'", ';
								} else {
									var tempStr = '"'+subLang+'": "http://dl.opensubtitles.org/en/download/subencoding-utf8/file/'+results[i].IDSubtitleFile+'.'+results[i].SubFormat+'", ';
								}
								theSubs.push({"lang": subLang, "string": tempStr});
							}
						}
					}
					var newString = "{ ";									
					for (k = 0; typeof theSubs[k] !== 'undefined'; k++) newString += theSubs[k].string;
					newString = newString.substr(0,newString.length -2)+" }";
					newSettings = wjs().plugin.playlist.items[wjs().currentItem()].setting;
					if (IsJsonString(newSettings)) {
						newSettings = JSON.parse(newSettings);
					} else newSettings = {};
					newSettings.subtitles = JSON.parse(newString);
					wjs().emitJsMessage("[clear-subtitles]");
					setTimeout(function() {
						wjs().plugin.playlist.items[wjs().currentItem()].setting = JSON.stringify(newSettings);
						wjs().emitJsMessage("[refresh-subtitles]");
					},10);
				} else {
					delete powGlobals.fileHash;
					clearTimeout(findHashTime);
					setTimeout(function() { findHash(); },15000);
				}
				
				opensubtitles.api.logout(powGlobals.osToken);
			});
		});
	});
}

function delayFinished(kj) {
    return function(){
		powGlobals.files[kj].finished = true;
		clearTimeout(findHashTime);
		findHash();
    }
}

function findHash() {
	if (wjs().state() == 3 || wjs().state() == 4) {
		if (typeof powGlobals.fileHash === 'undefined') {
			if (typeof powGlobals.engine === 'undefined') {
				os.computeHash(powGlobals.path, function(err, hash){
					if (err) return;
					powGlobals.fileHash = hash;
					subtitlesByExactHash(powGlobals.fileHash,altLength,powGlobals.filename);
				});
			} else {
				os.computeHash(powGlobals.path, function(err, hash){
					if (err) return;
					for (ij = 0; typeof powGlobals.files[ij] !== 'undefined'; ij++) if (powGlobals.files[ij].index == powGlobals.videos[wjs().currentItem()].index) break;
					if (ij == powGlobals.files.length) {
						powGlobals.fileHash = hash;
						if (typeof powGlobals.byteLength !== 'undefined') {
							subtitlesByExactHash(hash,powGlobals.byteLength,powGlobals.filename);
						}
					} else if (typeof powGlobals.files[ij].finished !== 'undefined') {
						powGlobals.fileHash = hash;
						if (typeof powGlobals.byteLength !== 'undefined') {
							subtitlesByExactHash(hash,powGlobals.byteLength,powGlobals.filename);
						}
					} else {
						if (typeof powGlobals.videos[wjs().currentItem()].checkHashes[hash] === 'undefined') {
							powGlobals.videos[wjs().currentItem()].checkHashes[hash] = 1;
						} else {
							if (powGlobals.videos[wjs().currentItem()].checkHashes[hash] == 4) {
								powGlobals.videos[wjs().currentItem()].checkHashes[hash]++;
								powGlobals.fileHash = hash;
								if (typeof powGlobals.byteLength !== 'undefined') {
									subtitlesByExactHash(powGlobals.fileHash,powGlobals.byteLength,powGlobals.filename);
								}
								
							} else powGlobals.videos[wjs().currentItem()].checkHashes[hash]++;
						}
					}
				});
			}
			if (typeof powGlobals.fileHash === 'undefined') {
				clearTimeout(findHashTime);
				findHashTime = setTimeout(function() {
					findHash();
				},15000);
			}
		}
	} else {
		clearTimeout(findHashTime);
		findHashTime = setTimeout(function() {
			findHash();
		},15000);
	}
}

function resetPowGlobals() {
	wjs().emitJsMessage("[refresh-playlist]");
	powGlobals = [];
	powGlobals.videos = [];
	powGlobals.files = [];
	powGlobals.indexes = [];
	torPieces = [];
	altLength = 0;
	powGlobals.currentIndex = -1;
}

wjs.init.prototype.addTorrent = function(torLink) {
	powGlobals.allPieces = 0;
	powGlobals.lastDownload = 0;
	powGlobals.lastDownloadTime = Math.floor(Date.now() / 1000);
	
	prebuf = 0;
	
	// reset values in Torrent Data mode
	$('.progress .progress-bar').removeClass("progress-bar-danger").addClass("progress-bar-warning").attr('data-transitiongoal', 0).progressbar({display_text: 'center'});
	$('#downPart').text("0 kB");
	$('#downAll').text("0 kB");
	$('#speed').text("0.0 kB/s");
	$('#nrPeers').text("0");
	// end reset values in Torrent Data mode

	if (typeof torLink !== 'undefined' && (typeof torLink === 'object' || Buffer.isBuffer(torLink) || torLink.toLowerCase().match(/magnet:\?xt=urn:sha1:[a-z0-9]{20,50}/i) != null || torLink.toLowerCase().match(/magnet:\?xt=urn:btih:[a-z0-9]{20,50}/i) != null || torLink.split('.').pop().toLowerCase() == "torrent")) {

		if (typeof torLink !== 'object' && Buffer.isBuffer(torLink) === false && torLink.split('.').pop().toLowerCase() == "torrent") torLink = fs.readFileSync(torLink);
		
		// load the torrent with peerflix
		if (localStorage.tmpDir == 'Temp') {
			powGlobals.engine = peerflix(torLink,{
				connections: localStorage.maxPeers
			});			
		} else {
			powGlobals.engine = peerflix(torLink,{
				connections: localStorage.maxPeers,
				path: localStorage.tmpDir
			});
		}
						
		powGlobals.engine.swarm.on('wire', onmagnet);
		peerInterval = setInterval(function(){ peerCheck() }, 2000);
		
		powGlobals.engine.server.on('listening', function () {
			
			wjs().emitJsMessage("[tor-data-but]1");
			
			powGlobals.speedPiece = 0;
			downSpeed = setTimeout(function(){ checkSpeed(); }, 3000);
			
			$("#headerText").text(powGlobals.engine.torrent.name);
			
			var localHref = 'http://localhost:' + powGlobals.engine.server.address().port + '/'
			powGlobals.hash = powGlobals.engine.infoHash;
			powGlobals.downloaded = 0;
			
			$("#downAll").text(getReadableFileSizeString(Math.floor(powGlobals.engine.torrent.length)));

			powGlobals.hasVideo = 0;
			$("#filesList").html("");
			var kj = 0;
			for (ij = 0; typeof powGlobals.engine.files[ij] !== 'undefined'; ij++) {				
				var fileStart = powGlobals.engine.files[ij].offset;
				if (powGlobals.engine.files[ij].offset > 0) fileStart++;
				var fileEnd = fileStart + powGlobals.engine.files[ij].length;
				powGlobals.indexes[ij] = ij;
				powGlobals.files[ij] = [];
				powGlobals.files[ij].firstPiece = Math.floor(fileStart / powGlobals.engine.torrent.pieceLength)
				powGlobals.files[ij].lastPiece = Math.floor((fileEnd -1) / powGlobals.engine.torrent.pieceLength)
				powGlobals.files[ij].lastDownload = 0;
				powGlobals.files[ij].downloaded = 0;
				powGlobals.files[ij].index = ij;
				powGlobals.files[ij].byteLength = powGlobals.engine.files[ij].length;
			}			

			// playlist natural order
			if (powGlobals.engine.files.length > 1) {
				perfect = false;
				while (!perfect) {
					perfect = true;
					for (ij = 0; typeof powGlobals.files[ij] !== 'undefined'; ij++) {
						if (typeof powGlobals.files[ij+1] !== 'undefined') {
							difference = alphanumCase(powGlobals.engine.files[powGlobals.files[ij].index].name,powGlobals.engine.files[powGlobals.files[ij+1].index].name);
							if (difference > 0) {
								perfect = false;
								powGlobals.indexes[powGlobals.files[ij].index]++;
								powGlobals.indexes[powGlobals.files[ij+1].index]--;
								tempHold = powGlobals.files[ij];
								powGlobals.files[ij] = powGlobals.files[ij+1];
								powGlobals.files[ij+1] = tempHold;
							}
						}
					}
				}
			}
			perfect = false;
			while (!perfect) {
				perfect = true;
				for (ij = 0; typeof powGlobals.files[ij] !== 'undefined'; ij++) {
					if (typeof powGlobals.files[ij+1] !== 'undefined') {
						difference = matchSeasons(powGlobals.engine.files[powGlobals.files[ij].index].name,powGlobals.engine.files[powGlobals.files[ij+1].index].name);
						if (difference > 0) {
							perfect = false;
							powGlobals.indexes[powGlobals.files[ij].index]++;
							powGlobals.indexes[powGlobals.files[ij+1].index]--;
							tempHold = powGlobals.files[ij];
							powGlobals.files[ij] = powGlobals.files[ij+1];
							powGlobals.files[ij+1] = tempHold;
						}
					}
				}
			}
			// end playlist natural order



			for (ij = 0; typeof powGlobals.files[ij] !== 'undefined'; ij++) {
				if (supportedVideo.indexOf(powGlobals.engine.files[powGlobals.files[ij].index].name.split('.').pop().toLowerCase()) > -1) {
					if (powGlobals.engine.files[powGlobals.files[ij].index].name.toLowerCase().replace("sample","") == powGlobals.engine.files[powGlobals.files[ij].index].name.toLowerCase()) {
						
						if (powGlobals.engine.files[powGlobals.files[ij].index].name.toLowerCase().substr(0,5) != "rarbg") {
							powGlobals.hasVideo++;
							if (typeof savedIj === 'undefined') savedIj = ij;

							powGlobals.videos[kj] = [];

							powGlobals.videos[kj].checkHashes = [];
							powGlobals.videos[kj].lastSent = 0;
							powGlobals.videos[kj].index = powGlobals.files[ij].index;
							powGlobals.videos[kj].filename = powGlobals.engine.files[powGlobals.files[ij].index].name.split('/').pop().replace(/\{|\}/g, '')
							var fileStart = powGlobals.engine.files[powGlobals.files[ij].index].offset
							var fileEnd = powGlobals.engine.files[powGlobals.files[ij].index].offset + powGlobals.engine.files[powGlobals.files[ij].index].length
							powGlobals.videos[kj].firstPiece = Math.floor(fileStart / powGlobals.engine.torrent.pieceLength)
							powGlobals.videos[kj].lastPiece = Math.floor((fileEnd -1) / powGlobals.engine.torrent.pieceLength)						
							powGlobals.videos[kj].path = "" + powGlobals.engine.path + "\\" + powGlobals.engine.files[powGlobals.files[ij].index].path
							powGlobals.videos[kj].byteLength = powGlobals.engine.files[powGlobals.files[ij].index].length;
							powGlobals.videos[kj].downloaded = 0;
							if (powGlobals.hasVideo == 1) {
								var filename = powGlobals.engine.files[powGlobals.files[ij].index].name.split('/').pop().replace(/\{|\}/g, '')
								powGlobals.filename = filename;
								powGlobals.path = powGlobals.videos[kj].path;
								powGlobals.firstPiece = powGlobals.videos[kj].firstPiece;
								powGlobals.lastPiece = powGlobals.videos[kj].lastPiece;
								if (typeof powGlobals.videos[kj].byteLength !== 'undefined') {
									powGlobals.byteLength = powGlobals.videos[kj].byteLength;
								} else {
									if (typeof powGlobals.byteLength !== 'undefined') delete powGlobals.byteLength;
								}
								win.title = getName(filename);
								wjs().setOpeningText("Prebuffering 0%");
								if (powGlobals.engine.files[powGlobals.files[ij].index].offset != powGlobals.engine.server.index.offset) {
									for (as = 0; typeof powGlobals.engine.files[powGlobals.files[as].index] !== 'undefined'; as++) {
										if (powGlobals.engine.files[powGlobals.files[as].index].offset == powGlobals.engine.server.index.offset) {
											powGlobals.engine.files[powGlobals.files[as].index].deselect();
											break;
										}
									}
								}

							}
							wjs().addPlaylist({
								 url: localHref+powGlobals.files[ij].index,
								 title: getName(powGlobals.videos[kj].filename),
				 				 vlcArgs: "--avi-index=3"
							});
							wjs().emitJsMessage("[saved-sub]"+localStorage.subLang);
							kj++;
						}
					}
				}
			}

			if (powGlobals.hasVideo == 0) {
				wjs().fullscreen(false);
				wjs().clearPlaylist();
				$('#player_wrapper').css("min-height","1px").css("height","1px").css("width","1px");
				$('body').css("overflow-y","visible");
			}
						
			$("#filesList").append($('<div style="width: 100%; height: 79px; background-color: #f6f6f5; text-align: center; line-height: 79px; font-family: \'Droid Sans Bold\'; font-size: 19px; border-bottom: 1px solid #b5b5b5">Scroll up to Start Video Mode</div>'));
			for (ij = 0; typeof powGlobals.files[ij] !== 'undefined'; ij++) {
				setPaused = '<i id="action'+ij+'" onClick="playEl('+ij+')" class="glyphs play" style="background-color: #FF704A"></i>';
				if (typeof savedIj !== 'undefined' && savedIj == ij) setPaused = '<i id="action'+ij+'" onClick="pauseEl('+ij+')" class="glyphs pause" style="background-color: #F6BC24"></i>';
				if (powGlobals.hasVideo == 0) {
					setPaused = '<i id="action'+ij+'" onClick="pauseEl('+ij+')" class="glyphs pause" style="background-color: #F6BC24"></i>';
					playEl(ij);
				}
				if (ij%2 !== 0) { backColor = '#f6f6f5'; } else { backColor = '#ffffff'; }
				
				$("#filesList").append($('<div style="width: 10%; text-align: right; position: absolute; right: 0px; font-size: 240%; margin-top: 24px; margin-right: 5%;">'+setPaused+'</div><div onClick="settingsEl('+ij+')" id="file'+ij+'" class="files" data-index="'+ij+'" style="text-align: left; padding-bottom: 8px; padding-top: 8px; width: 100%; background-color: '+backColor+'" data-color="'+backColor+'"><center><div style="width: 90%; text-align: left"><span class="filenames">'+powGlobals.engine.files[powGlobals.files[ij].index].name+'</span><br><div class="progressbars" style="width: 90%; display: inline-block"></div><div style="width: 10%; display: inline-block"></div><div id="p-file'+ij+'" class="progress" style="width: 90%; margin: 0; position: relative; top: -6px; display: inline-block"><div id="progressbar'+ij+'" class="progress-bar progress-bar-info" role="progressbar" data-transitiongoal="0"></div></div><br><span class="infos">Downloaded: <span id="down-fl'+ij+'">0 kB</span> / '+getReadableFileSizeString(powGlobals.engine.files[powGlobals.files[ij].index].length)+'</span></div></center></div>'))
			}
			
			wjs().emitJsMessage("[refresh-disabled]");
			
		});
				
		powGlobals.engine.on('download',checkDownloaded);
		
		powGlobals.engine.on('ready', function () {
			isReady = 1;
		});
		
		onmagnet();
	}
	return this;
}

function playlistAddVideo(torLink) {
	var thisVideoId = powGlobals.videos.length;
	powGlobals.videos[thisVideoId] = [];
	powGlobals.videos[thisVideoId].local = 1;
	powGlobals.videos[thisVideoId].path = torLink;
	powGlobals.videos[thisVideoId].filename = torLink.split('\\').pop();
	powGlobals.videos[thisVideoId].byteLength = fs.statSync(powGlobals.videos[thisVideoId].path).size;
	if (typeof powGlobals.videos[thisVideoId].filename !== 'undefined') {
		torLink = "file:///"+torLink.split("\\").join("/");
		wjs().addPlaylist({
			 url: torLink,
			 title: getName(powGlobals.videos[thisVideoId].filename),
			 vlcArgs: "--avi-index=3"
		});
		wjs().emitJsMessage("[saved-sub]"+localStorage.subLang);
	}
}

function runURL(torLink) {
			
	if (torLink.toLowerCase().replace(".torrent","") != torLink.toLowerCase()) {
		var readTorrent = require('read-torrent');
		readTorrent(torLink, function(err, torrent) { wjs().addTorrent(torrent); });
	} else if (torLink.toLowerCase().match(/magnet:\?xt=urn:btih:[a-z0-9]{20,50}/i) != null || torLink.toLowerCase().match(/magnet:\?xt=urn:sha1:[a-z0-9]{20,50}/i) != null) {									
		wjs().addTorrent(torLink);
	} else {
		var thisVideoId = powGlobals.videos.length;
		
		powGlobals.videos[thisVideoId] = [];
		powGlobals.videos[thisVideoId].local = 1;

		if (torLink.substr(0,4) != "http" && torLink.substr(0,8) != "file:///") {
			powGlobals.videos[thisVideoId].path = torLink;
			powGlobals.videos[thisVideoId].filename = torLink.split('\\').pop();
			powGlobals.videos[thisVideoId].byteLength = fs.statSync(powGlobals.videos[thisVideoId].path).size;
			torLink = "file:///"+torLink.split("\\").join("/");
		} else if (torLink.indexOf("file:///") > -1) {
			powGlobals.videos[thisVideoId].path = torLink.replace("file:///","").split("/").join("\\");
			powGlobals.videos[thisVideoId].filename = torLink.split('/').pop();
			powGlobals.videos[thisVideoId].byteLength = fs.statSync(powGlobals.videos[thisVideoId].path).size;
		} else if (torLink.substr(0,4) == "http") {
			powGlobals.videos[thisVideoId].path = torLink;
			powGlobals.videos[thisVideoId].filename = torLink.split('/').pop();
		} else {
			powGlobals.videos[thisVideoId].path = torLink;
			if (torLink.indexOf("/") > -1) {
				powGlobals.videos[thisVideoId].filename = torLink.split('/').pop();
			} else if (torLink.indexOf("\\") > -1) {
				powGlobals.videos[thisVideoId].filename = torLink.split('\\').pop();
			}
		}

		if (typeof powGlobals.videos[thisVideoId].filename !== 'undefined') {
			wjs().addPlaylist({
				 url: torLink,
				 title: getName(powGlobals.videos[thisVideoId].filename),
				 vlcArgs: "--avi-index=3"
			});
			wjs().emitJsMessage("[saved-sub]"+localStorage.subLang);
		}

		if (setOnlyFirst == 0 || setOnlyFirst == 2) {
			if (setOnlyFirst == 2) setOnlyFirst = 1;
			win.title = getName(powGlobals.videos[thisVideoId].filename);
		}
	}

	wjs().setOpeningText("Loading resource");
	wjs().startPlayer();

	win.setMinimumSize(300, 210);

	$('#main').css("display","none");
	$('#player_wrapper').css("min-height","100%").css("height","100%").css("width","auto");
	wjs().emitJsMessage("[gobackvar]0");
	
	win.zoomLevel = 0;
	
	$("#header_container").show();
	
	wjs().emitJsMessage("[refresh-disabled]");
	
}

var lastItem = 0;
var lastState = "";

setTimeout(function() { 
	wjs("#player_wrapper").addPlayer({ id: "webchimera", theme: "sleek", autoplay: 1, progressCache: 1, pausePolicy: localStorage.clickPause });
	wjs().onMessage(handleMessages);
	wjs().onPlaying(isPlaying);
	wjs().onOpening(isOpening);
	wjs().onState(function() {
		if (this.state() == "opening") {
			lastItem = this.currentItem();
			lastState = this.state();
		} else if (this.state() == "ended" && lastState == "opening") {
			lastState = this.state();
			if (typeof powGlobals.engine !== 'undefined') {
				if (this.plugin.playlist.items[lastItem].mrl.substr(0,17) == "http://localhost:") {
					this.replaceMRL(lastItem,{
						url: "file:///"+powGlobals.videos[lastItem].path.replace("\\","/"),
						title: this.plugin.playlist.items[lastItem].title.replace("[custom]",""),
						vlcArgs: "--avi-index=3"
					});
					setTimeout(function() { wjs().playItem(lastItem); },1000);
				}
			}
		} else lastState = this.state();
	});
	if (gui.App.argv.length > 0) {
		resetPowGlobals();
		runURL(gui.App.argv[0]);
		wjs().emitJsMessage("[refresh-playlist]");
		$("#loading").fadeOut(200);
	}
},1);

if (gui.App.argv.length == 0) {
	win.on('loaded', function() {
		$("#loading").fadeOut(200);
		$('#main').animate({ opacity: 1 },200, function() {
			$("body").css("overflow-x","visible");
			if (typeof localStorage.didFirst === 'undefined') {
				$(".pl-settings").trigger('click');
				localStorage.didFirst = 1;
			}
		});
		checkUpdates();
		checkedUpdates = 1;
	});
}

function checkUpdates() {
	checkInternet(function(isConnected) {
		if (isConnected) {
			$.ajax({ type: 'GET', url: window.atob("aHR0cDovL3Bvd2Rlci5tZWRpYS9sYXN0VmVyc2lvbg=="), global: false, cache: false,
				success: function(xhr) {
					if (xhr.replace(".","") != xhr && isNaN(xhr.split(".")[0]) === false && isNaN(xhr.split(".")[1]) === false && localStorage.powderVersion != xhr) {
						// there is a new version of powder
						
						$("#update-header").html("Update to Powder v"+xhr);
						$("#open-update-player").trigger("click");
					}
				}
			});
		}
	});
}

$('#torrentDialog').change(function(evt) {
	checkInternet(function(isConnected) {
		if (isConnected) {
			resetPowGlobals();
			runURL(document.getElementById('torrentDialog').value);
			wjs().emitJsMessage("[refresh-playlist]");
		} else {
			$('.easy-modal-animated').trigger('openModal');
		}
	});
});

$('#libraryDialog').change(function(evt) {
	$("#lib-folder").text($(this).val());
	localStorage.libDir = $(this).val();
});


$('#folderDialog').change(function(evt) {
	$("#def-folder").text($(this).val());
	localStorage.tmpDir = $(this).val();
});

$('#addPlaylistDialog').change(function(evt) {
	if ($(this).val().indexOf(";") > -1) {
		newFileArray = $(this).val().split(";");
		for (ksl = 0; typeof newFileArray[ksl] !== 'undefined'; ksl++) {
			playlistAddVideo(newFileArray[ksl]);
		}
	} else {
		playlistAddVideo($(this).val());
	}
	wjs().emitJsMessage("[refresh-playlist]");
});

$('#fileDialog').change(function(evt) {
	resetPowGlobals();
	if ($(this).val().indexOf(";") > -1) {
		runMultiple($(this).val().split(";"));
	} else {
		runURL($(this).val());
	}
	wjs().emitJsMessage("[refresh-playlist]");
});


function chooseFile(name) {
	$(name).trigger('click');
}

$('#magnetLink').mousedown(function(event) {
    if (event.which == 3) {
		var clipboard = gui.Clipboard.get();
		$('#magnetLink').val(clipboard.get('text')).select();
    }
});