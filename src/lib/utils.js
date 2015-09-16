
var utils = {
	
	ga: { loaded: false },
	
	fs: {
			
		dirExists: function(path, mask, cb) {
			if (typeof mask == 'function') { // allow the `mask` parameter to be optional
				cb = mask;
				mask = 0777;
			}
			fs.mkdir(path, mask, function(err) {
				if (err) {
					if (err.code == 'EEXIST') cb(null); // ignore the error if the folder already exists
					else cb(err); // something else went wrong
				} else cb(null); // successfully created folder
			});
		},
		
		size: function(path) {
			
			clean = utils.parser(path).deWebize();
			if (clean.indexOf("://") == -1) {
				try {
					return fs.statSync(clean).size;
				} catch(e) {
					return false;
				}
			} return false;
			
		},
		
		paths: {
			
			vlc: function() {
				vlcPath = false;
				
				if (isWin) var appExt = ".exe";
				else var appExt = "";

				(({
					linux: ["/usr/bin/vlc", "/usr/local/bin/vlc"],
					darwin: ["/Applications/VLC.app/Contents/MacOS/VLC", process.env.HOME+"/Applications/VLC.app/Contents/MacOS/VLC"],
					win32: [require('path').dirname(process.execPath)+pathBreak+'node_modules'+pathBreak+'webchimera.js'+pathBreak+'build'+pathBreak+'Release'+pathBreak+'vlc'+appExt,require('path').dirname(process.execPath)+pathBreak+'node_modules'+pathBreak+'pw-wcjs-player'+pathBreak+'node_modules'+pathBreak+'wcjs-renderer'+pathBreak+'node_modules'+pathBreak+'webchimera.js'+pathBreak+'build'+pathBreak+'Release'+pathBreak+'vlc'+appExt]
				})[process.platform] || []).forEach(function(path) {
					if (fs.existsSync(path)) vlcPath = path;
				});
				return vlcPath;
			}
			
		},

		getReadableSize: function(fileSizeInBytes) {
			var i = -1;
			var byteUnits = [' kB', ' MB', ' GB', ' TB', 'PB', 'EB', 'ZB', 'YB'];
			do {
				fileSizeInBytes = fileSizeInBytes / 1024;
				i++;
			} while (fileSizeInBytes > 1024);
			return Math.max(fileSizeInBytes, 0.1).toFixed(1) + byteUnits[i];
		}

	},
	
	delayer: function(trg,cb) {
		return function(){
			cb(trg)
		}
	},
	
	closest: function(num, arr) {
		// get closest number from array
		var curr = arr[0];
		var diff = Math.abs (num - curr);
		for (var val = 0; val < arr.length; val++) {
			var newdiff = Math.abs (num - arr[val]);
			if (newdiff < diff) {
				diff = newdiff;
				curr = arr[val];
			}
		}
		return curr;
	},
	
	sleep: require('computer-sleep/sleep'),
	
	checkInternet: function(cb) {
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
	},
	
	isJsonString: function(str) {
		try {
			JSON.parse(str);
		} catch (e) {
			return false;
		}
		return true;
	},
	
	resetPowGlobals: function() {
		powGlobals = {
			current: {},
			torrent: {},
			subtitles: {},
			lists: {
				files: [],
				media: [],
				indexes: []
			}
		};
		torPieces = [];
		altLength = 0;
		powGlobals.lists.currentIndex = -1;
	},
	
	processArgs: function(args) {
		var ranFirstArg = false;
		for (kn = 0; args[kn]; kn++) {
			if (args[kn].startsWith("--")) {
				if (args[kn].startsWith("--controller-port=")) {
					remote.port = parseInt(args[kn].replace("--controller-port=",""));
				} else if (args[kn].startsWith("--controller-secret=")) {
					remote.secret = utils.parser(args[kn].replace("--controller-secret=","")).decodeURI();
				} else if (args[kn].startsWith("--sub-file=")) {
					load.argData.subFile = utils.parser(args[kn].replace("--sub-file=","")).decodeURI();
				} else if (args[kn].startsWith("--fs")) {
					load.argData.fs = true;
				} else if (args[kn].startsWith('--silent')) {
					load.argData.silent = true;
				} else if (args[kn].startsWith('--dlna')) {
					load.argData.dlna = true;
				} else if (args[kn].startsWith("--title=")) {
					load.argData.title = utils.parser(args[kn].replace("--title=","")).decodeURI();
				} else if (args[kn].startsWith("--agent")) {
					if (!load.argData.agent) load.argData.agent = {};
					if (args[kn].startsWith("--agent-name=")) {
						load.argData.agent.name = utils.parser(args[kn].replace("--agent-name=","")).decodeURI();
					} else if (args[kn].startsWith("--agent-img=")) {
						load.argData.agent.img = utils.parser(args[kn].replace("--agent-img=","")).decodeURI();
					} else if (args[kn].startsWith("--agent-pos=")) {
						load.argData.agent.pos = utils.parser(args[kn].replace("--agent-pos=","")).decodeURI();
					} else if (args[kn].startsWith("--agent-url=")) {
						load.argData.agent.url = utils.parser(args[kn].replace("--agent-url=","")).decodeURI();
					} else if (args[kn].startsWith("--agent-background=")) {
						load.argData.agent.background = utils.parser(args[kn].replace("--agent-background=","")).decodeURI();
					}
				}
			} else {
				if (!ranFirstArg) {
					ranFirstArg = true;
					load.argData.keepFirst = args[kn];
				}
				if ((args[kn].indexOf("magnet:") == 0 || args[kn].indexOf("pow:") == 0) && args[kn].indexOf("&") > -1) {
					checkArgs = args[kn].split("&");
					uriArgs = [];
					remoteArgs = [];
					for (ik = 1; checkArgs[ik]; ik++) {
						if (checkArgs[ik].indexOf("dn=") == -1 && checkArgs[ik].indexOf("tr=") == -1) {
							if (checkArgs[ik].indexOf("controller") == 0) {
								remoteArgs.push('--'+checkArgs[ik]);
							} else {
								if (checkArgs[ik].indexOf("agent-name=") == 0) {
									var agentName = utils.parser(checkArgs[ik].replace("agent-name=","")).decodeURI();
								}
								uriArgs.push('--'+checkArgs[ik]);
							}
						}
					}
					if (remoteArgs.length) {
						if (!agentName) agentName = "an Unknown Website";
						r = confirm("Allow "+agentName+" access to Powder Player's data?");
						if (r) uriArgs.concat(remoteArgs);
					}
					if (uriArgs.length) utils.processArgs(uriArgs);
				}
			}
		}
		
		if (load.argData.keepFirst) {
			utils.resetPowGlobals();
			load.url(load.argData.keepFirst);
			delete load.argData.keepFirst;
		}
	},
	
	checkUpdates: function() {
		
		// if powder was updated, delete the package file to save space
		if (isWin) var updExt = ".exe";
		else {
			if (process.platform == "darwin") var updExt = ".dmg";
			else if (process.platform == "linux") var updExt = ".tar.gz";
		}

		fs.stat(gui.App.dataPath+pathBreak+'updater'+updExt, function(err,stat) {
			if (err == null) fs.unlink(gui.App.dataPath+pathBreak+'updater'+updExt);
		});

		utils.checkInternet(function(isConnected) {
			if (isConnected) {
				$.ajax({ type: 'GET', url: window.atob("aHR0cDovL3Bvd2Rlci5tZWRpYS9sYXN0VmVyc2lvbg=="), global: false, cache: false,
					success: function(xhr) {
						if (xhr.replace(".","") != xhr && isNaN(xhr.split(".")[0]) === false && isNaN(xhr.split(".")[1]) === false && localStorage.powderVersion != xhr) {
							// there is a new version of powder
							
							$("#update-header").html("Update to Powder v"+xhr);
							var updater = gui.Window.open('app://powder/src/updater.html',{ width: 320, height: 133, icon: "icon.png", toolbar: false });
							if (isWin) updExt = ".exe";
							else {
								if (process.platform == "darwin") var updExt = ".dmg";
								else if (process.platform == "linux") var updExt = ".tar.gz";
							}
							updater.on('close', function() {
								fs.stat(gui.App.dataPath+pathBreak+'updater'+updExt, function(err,stat) {
									if (err == null) {
										if (localStorage.doUpdate == "1") win.gui.close();
										else fs.unlink(gui.App.dataPath+pathBreak+'updater'+updExt);
									}
								});
								updater.close(true);
							});
						}
					}
				});
				
				// analytics
				var ua = require('universal-analytics');
				utils.ga.visitor = ua('UA-65979437-2');
				utils.ga.visitor.pageview("/mask.html").send();
				utils.ga.loaded = true;
			}
		});
	},
	
	sorting: {
	
		episodes: function(results,logic) {
			logic = typeof logic !== 'undefined' ? logic : 1; // 1 - episode sort, 2 - episode sort (by .name)
			var perfect = false;
			while (!perfect) {
				perfect = true;
				results.forEach(function(el,ij) {
					if (ij > 0) {
						if (logic == 1) {
							clean = utils.parser(el);
							prev = utils.parser(results[ij-1]);
						} else if (logic == 2) {
							clean = utils.parser(el.name);
							prev = utils.parser(results[ij-1].name);
						}
						if (clean.season() == prev.season() && clean.episode() < prev.episode()) {
							results[ij] = results[ij-1];
							results[ij-1] = el;
							perfect = false;
						} else if (clean.season() < prev.season()) {
							results[ij] = results[ij-1];
							results[ij-1] = el;
							perfect = false;
						}
					}
				});
			}
			return results;
		},
		
		naturalSort: function(arr,logic) {
			// natural sort order function for playlist and library
			logic = typeof logic !== 'undefined' ? logic : 1; // 1 - natural sort, 2 - natural sort (by .name)
			if (arr.length > 1) {
				perfect = false;
				while (!perfect) {
					perfect = true;
					saveContext = this;
					arr.forEach(function(el,ij) {
						if (arr[ij+1]) {
							if (logic == 1) difference = saveContext._alphanumCase(utils.parser(el).name(),utils.parser(arr[ij+1]).name());
							else if (logic == 2) difference = saveContext._alphanumCase(utils.parser(el.name).name(),utils.parser(arr[ij+1].name).name());
							if (difference > 0) {
								perfect = false;
								if (logic == 3 || logic == 4) {
									powGlobals.lists.indexes[el.index]++;
									powGlobals.lists.indexes[arr[ij+1].index]--;
								}
								arr[ij] = arr[ij+1];
								arr[ij+1] = el;
							}
						}
					});
				}
			}
			return arr;
		},
	
		_alphanumCase: function(a, b) {
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
	
	},
	
	parser: function(path) {
		
		function webize() {
			if (path.substr(0,4) != "http" && path.substr(0,8) != "file:///") return "file:///"+path.split("\\").join("/");
			else return path;
		}
		
		function deWebize() {
			if (path.indexOf("file:///") > -1) {
				if (!isWin) return path.replace("file:///","");
				else return path.replace("file:///","").split("/").join("\\");
			} else return path;
		}
		
		function decodeURI() {
			if (path.indexOf("%") > -1) return decodeURIComponent(path);
			return path;
		}
		
		function filename() {
			if (path.indexOf("/") > -1) return path.split('/').pop();
			else if (path.indexOf("\\") > -1) return path.split('\\').pop();
			return path;
		}
		
		function extension() {
			if (path.indexOf('.') > -1) return path.split('.').pop().toLowerCase();
			else return false;
		}
		
		function name() {
			// parse filename to get title
			path = this.filename();
			if (path.indexOf(".") > -1) {
				// remove extension
				var tempName = path.replace("."+path.split('.').pop(),"");
				if (tempName.length > 3) path = tempName;
				delete tempName;
			}
			path = unescape(path);
			path = path.split('_').join(' ').split('.').join(' ').split('  ').join(' ').split('  ').join(' ').split('  ').join(' ');
			
			// capitalize first letter
			path = path.charAt(0).toUpperCase() + path.slice(1);
			
			return path;
		}
		
		function showName() {
			path = this.filename();
			
			clean = utils.parser(utils.parser(path).name());
			findParts = clean.cleanName().split(" ");
		
			newarray = [];
			for (ij = 0; typeof findParts[ij] !== 'undefined'; ij++) {
				if (isNaN(findParts[ij]) === false && [3,4,5].indexOf(findParts[ij].length) > -1) {
					// stop at last number
					break;
				} else if (isNaN(findParts[ij].replace("s","").replace("e","")) === false && findParts[ij].replace("s","").replace("e","").length == 4) {
					// stop at "S01E01"
					break;
				} else if (isNaN(findParts[ij].replace("s","").replace("e","").replace("-","").replace("e","")) === false && findParts[ij].replace("s","").replace("e","").replace("-","").replace("e","").length == 6) {
					// stop at "S01E01-E02"
					break;
				} else if (findParts[ij].toLowerCase().indexOf("x") > -1 && isNaN(findParts[ij].toLowerCase().replace("x","")) === false) {
					// stop at "01x01"
					var tempWorker = findParts[ij].toLowerCase().split("x");
					if (tempWorker[0] && tempWorker[1]) if (isNaN(tempWorker[0]) === false && isNaN(tempWorker[1]) === false) break;
				} else if (findParts[ij].toLowerCase().indexOf("x") && findParts[ij].indexOf("[") == 0 && findParts[ij].indexOf("]") == findParts[ik].length && isNaN(findParts[ij].toLowerCase().replace("[","").replace("]","").replace("x","")) === false) {
					// stop at "[01x01]"
					var tempWorker = findParts[ij].toLowerCase().split("x");
					if (tempWorker[0] && tempWorker[1]) if (isNaN(tempWorker[0].replace("[","")) === false && isNaN(tempWorker[1].replace("]","")) === false) return "s"+tempWorker[0].replace("[","")+"e"+tempWorker[1].replace("]","");
				} else if (findParts[ij].indexOf("[") == 0 && findParts[ij+1].indexOf("]") == findParts[ij+1].length && isNaN(findParts[ij].replace("[","")) === false && isNaN(findParts[ij+1].replace("]","")) === false) {
					// stop at "[01 01]"
					return "s"+findParts[ij].replace("[","")+"e"+findParts[ij+1].replace("]","");
				} else if (findParts[ij].toLowerCase() == "season") {
					// stop at "season 1 episode 5"
					if (findParts[ij+1] && findParts[ij+2] && findParts[ij+3] && isNaN(findParts[ij+1]) === false && isNaN(findParts[ij+3]) === false && findParts[ij+2].toLowerCase() == "episode") break;
				} else {
					newarray.push(findParts[ij]);
				}
			}
			
			return newarray.join(" ");
		}
		
		function shortSzEp() {
			findParts = utils.parser(this.name()).cleanName().split(" ");
			var lastNumber = 0;
			for (ik = 0; typeof findParts[ik] !== 'undefined'; ik++) {
				if (isNaN(findParts[ik]) === false && [2,3,4].indexOf(findParts[ik].length) > -1) {
					lastNumber = findParts[ik];
				} else if (findParts[ik].toLowerCase().indexOf("s") > -1 && findParts[ik].toLowerCase().indexOf("e") > -1 && isNaN(findParts[ik].toLowerCase().replace("s","").replace("e","")) === false && findParts[ik].toLowerCase().replace("s","").replace("e","").length == 4) {
					// find type "S01E01"
					return findParts[ik].toLowerCase();
				} else if (findParts[ik].toLowerCase().indexOf("s") > -1 && findParts[ik].toLowerCase().indexOf("e") > -1 && isNaN(findParts[ik].toLowerCase().replace("s","").replace("e","").replace("-","").replace("e","")) === false && findParts[ik].toLowerCase().replace("s","").replace("e","").replace("-","").replace("e","").length == 6) {
					// find type "S01E01-E02"
					return findParts[ik].split("-")[0].toLowerCase();
				} else if (findParts[ik].toLowerCase().indexOf("x") > -1 && isNaN(findParts[ik].toLowerCase().replace("x","")) === false) {
					// find type "01x01"
					var tempWorker = findParts[ik].toLowerCase().split("x");
					if (tempWorker[0] && tempWorker[1]) if (isNaN(tempWorker[0]) === false && isNaN(tempWorker[1]) === false) return "s"+tempWorker[0]+"e"+tempWorker[1];
				} else if (findParts[ik].toLowerCase().indexOf("x") && findParts[ik].indexOf("[") == 0 && findParts[ik].indexOf("]") == findParts[ik].length && isNaN(findParts[ik].toLowerCase().replace("[","").replace("]","").replace("x","")) === false) {
					// find type "[01x01]"
					var tempWorker = findParts[ik].toLowerCase().split("x");
					if (tempWorker[0] && tempWorker[1]) if (isNaN(tempWorker[0].replace("[","")) === false && isNaN(tempWorker[1].replace("]","")) === false) return "s"+tempWorker[0].replace("[","")+"e"+tempWorker[1].replace("]","");
				} else if (findParts[ik].indexOf("[") == 0 && findParts[ik+1].indexOf("]") == findParts[ik+1].length && isNaN(findParts[ik].replace("[","")) === false && isNaN(findParts[ik+1].replace("]","")) === false) {
					// find type "[01 01]"
					return "s"+findParts[ik].replace("[","")+"e"+findParts[ik+1].replace("]","");
				} else if (findParts[ik].toLowerCase() == "season") {
					// find type "season 1 episode 5"
					if (findParts[ik+1] && findParts[ik+2] && findParts[ik+3] && isNaN(findParts[ik+1]) === false && isNaN(findParts[ik+3]) === false && findParts[ik+2].toLowerCase() == "episode") return "s"+findParts[ik+1]+"e"+findParts[ik+3];
				}
			}
			if (lastNumber != 0) {
				if (lastNumber.length == 3) return "s"+lastNumber.substr(0,1)+"e"+lastNumber.substr(1,2);
				else if (lastNumber.length == 4) return "s"+lastNumber.substr(0,2)+"e"+lastNumber.substr(2,2);
				else if (lastNumber.length == 5) return "s"+lastNumber.substr(0,2)+"e"+lastNumber.substr(2,3);
			}
			return false;
		}
		
		function season() {
			if (this.shortSzEp() !== false) return parseInt(this.shortSzEp().split("e")[0].replace("s",""));
		}
		
		function episode() {
			if (this.shortSzEp() !== false) return parseInt(this.shortSzEp().split("e")[1]);
		}
		
		function cleanName() {
			return path.split("-").join(" ").split("[").join(" ").split("]").join(" ").split("(").join(" ").split(")").join(" ").split(",").join(" ").split("  ").join(" ").split("  ").join(" ").split("  ").join(" ").toLowerCase();
		};

		return Object.freeze({ name: name, showName: showName, shortSzEp: shortSzEp, season: season, episode: episode, cleanName: cleanName, filename: filename, extension: extension, webize: webize, deWebize: deWebize, decodeURI: decodeURI });
	},
	
	register: {
		
		_writeDesktopFile: function(cb) {
			var powderPath = process.execPath.substr(0,process.execPath.lastIndexOf("/")+1);
			fs.writeFile(gui.App.dataPath+'/powder.desktop', '[Desktop Entry]\nVersion=1.0\nName=Powder Player\nComment=Powder Player is a hybrid between a Torrent Client and a Player (torrent streaming)\nExec='+process.execPath+' %U\nPath='+powderPath+'\nIcon='+powderPath+'icon.png\nTerminal=false\nType=Application\nMimeType=application/x-bittorrent;x-scheme-handler/magnet;video/avi;video/msvideo;video/x-msvideo;video/mp4;video/x-matroska;video/mpeg;\n', cb);
		},
		
		torrent: function() {
			if (process.platform == 'linux') {
				this._writeDesktopFile(function(err) {
					if (err) throw err;
					var desktopFile = gui.App.dataPath+'/powder.desktop';
					var tempMime = 'application/x-bittorrent';
					require('child_process').exec('gnome-terminal -x bash -c "echo \'Associating Files or URls with Applications requires Admin Rights\'; echo; sudo echo; sudo echo \'Authentication Successful\'; sudo echo; sudo mv -f '+desktopFile+' /usr/share/applications; sudo xdg-mime default powder.desktop '+tempMime+'; sudo gvfs-mime --set '+tempMime+' powder.desktop; echo; echo \'Association Complete! Press any key to close ...\'; read" & disown');
				});
			} else if (process.platform == 'darwin') {
				var powderPath = process.execPath.substr(0,process.execPath.lastIndexOf("/")+1)+"../../../../Resources/app.nw/";
				require('child_process').exec('"'+powderPath+'src/duti/duti" -s media.powder.player .torrent viewer');
				alert("Successfully Associated with Torrent Files");
			} else {
				fs.writeFile(gui.App.dataPath+'\\register-torrent.reg', 'REGEDIT4\r\n[HKEY_CURRENT_USER\\Software\\Classes\\powder.player.v1\\DefaultIcon]\r\n@="'+process.execPath.split("\\").join("\\\\")+'"\r\n[HKEY_CURRENT_USER\\Software\\Classes\\powder.player.v1\\shell\\open\\command]\r\n@="\\"'+process.execPath.split("\\").join("\\\\")+'\\" \\"%1\\""\r\n[HKEY_CURRENT_USER\\Software\\Classes\\.torrent]\r\n@="powder.player.v1"\r\n"Content Type"="application/x-bittorrent"', function (err) {
					if (err) throw err;
					gui.Shell.openExternal(gui.App.dataPath+'\\register-torrent.reg');
				});
			}
		},
		
		videos: function() {
			if (process.platform == 'linux') {
				this._writeDesktopFile(function(err) {
					if (err) throw err;
					var desktopFile = gui.App.dataPath+'/powder.desktop';
					var tempMimes = ['video/avi','video/msvideo','video/x-msvideo','video/mp4','video/x-matroska','video/mpeg'];
					var tempString = '';
					tempMimes.forEach(function(el) {
						tempString += '; sudo xdg-mime default powder.desktop '+el+'; sudo gvfs-mime --set '+el+' powder.desktop';
					});
					require('child_process').exec('gnome-terminal -x bash -c "echo \'Associating Files or URls with Applications requires Admin Rights\'; echo; sudo echo; sudo echo \'Authentication Successful\'; sudo echo; sudo mv -f '+desktopFile+' /usr/share/applications'+tempString+'; echo; echo \'Association Complete! Press any key to close ...\'; read" & disown');
				});
			} else if (process.platform == 'darwin') {
				var powderPath = process.execPath.substr(0,process.execPath.lastIndexOf("/")+1)+"../../../../Resources/app.nw/";
				require('child_process').exec('"'+powderPath+'src/duti/duti" -s media.powder.player .mkv viewer');
				require('child_process').exec('"'+powderPath+'src/duti/duti" -s media.powder.player .avi viewer');
				require('child_process').exec('"'+powderPath+'src/duti/duti" -s media.powder.player .mp4 viewer');
				require('child_process').exec('"'+powderPath+'src/duti/duti" -s media.powder.player .mpg viewer');
				require('child_process').exec('"'+powderPath+'src/duti/duti" -s media.powder.player .mpeg viewer');
				alert("Successfully Associated with Video Files");
			} else {
				fs.writeFile(gui.App.dataPath+'\\register-videos.reg', 'REGEDIT4\r\n[HKEY_CURRENT_USER\\Software\\Classes\\powder.player.v1\\DefaultIcon]\r\n@="'+process.execPath.split("\\").join("\\\\")+'"\r\n[HKEY_CURRENT_USER\\Software\\Classes\\powder.player.v1\\shell\\open\\command]\r\n@="\\"'+process.execPath.split("\\").join("\\\\")+'\\" \\"%1\\""\r\n[HKEY_CURRENT_USER\\Software\\Classes\\.avi]\r\n@="powder.player.v1"\r\n"Content Type"="video/avi"\r\n[HKEY_CURRENT_USER\\Software\\Classes\\.mkv]\r\n@="powder.player.v1"\r\n"Content Type"="video/x-matroska"\r\n[HKEY_CURRENT_USER\\Software\\Classes\\.mp4]\r\n@="powder.player.v1"\r\n"Content Type"="video/mp4"', function (err) {
					if (err) throw err;
					gui.Shell.openExternal(gui.App.dataPath+'\\register-videos.reg'); 
				});
			}
		},
		
		magnet: function() {
			if (process.platform == 'linux') {
				this._writeDesktopFile(function(err) {
					if (err) throw err;
					var desktopFile = gui.App.dataPath+'/powder.desktop';
					var tempMime = 'x-scheme-handler/magnet';
					require('child_process').exec('gnome-terminal -x bash -c "echo \'Associating Files or URls with Applications requires Admin Rights\'; echo; sudo echo; sudo echo \'Authentication Successful\'; sudo echo; sudo mv -f '+desktopFile+' /usr/share/applications; sudo xdg-mime default powder.desktop '+tempMime+'; sudo gvfs-mime --set '+tempMime+' powder.desktop; echo; echo \'Association Complete! Press any key to close ...\'; read" & disown');
				});
			} else if (process.platform == 'darwin') {
				var powderPath = process.execPath.substr(0,process.execPath.lastIndexOf("/")+1)+"../../../../Resources/app.nw/";
				require('child_process').exec('"'+powderPath+'src/duti/duti" -s media.powder.player magnet');
				alert("Successfully Associated with Magnet Links");
			} else {
				fs.writeFile(gui.App.dataPath+'\\register-magnet.reg', 'REGEDIT4\r\n[HKEY_CLASSES_ROOT\\Magnet]\r\n@="URL:magnet Protocol"\r\n"Content Type"="application/x-magnet"\r\n"URL Protocol"=""\r\n\[HKEY_CLASSES_ROOT\\Magnet\\DefaultIcon]\r\n@="\\"'+process.execPath.split("\\").join("\\\\")+'\\"\r\n[HKEY_CLASSES_ROOT\\Magnet\\shell]\r\n[HKEY_CLASSES_ROOT\\Magnet\\shell\\open]\r\n[HKEY_CLASSES_ROOT\\Magnet\\shell\\open\\command]\r\n@="\\"'+process.execPath.split("\\").join("\\\\")+'\\" \\"%1\\""\r\n[HKEY_CURRENT_USER\\Software\\Classes\\Magnet]\r\n@="URL:magnet Protocol"\r\n"Content Type"="application/x-magnet"\r\n"URL Protocol"=""\r\n[HKEY_CURRENT_USER\\Software\\Classes\\Magnet\\DefaultIcon]\r\n@="\\"'+process.execPath.split("\\").join("\\\\")+'\\"\r\n[HKEY_CURRENT_USER\\Software\\Classes\\Magnet\\shell]\r\n[HKEY_CURRENT_USER\\Software\\Classes\\Magnet\\shell\\open]\r\n[HKEY_CURRENT_USER\\Software\\Classes\\Magnet\\shell\\open\\command]\r\n@="\\"'+process.execPath.split("\\").join("\\\\")+'\\" \\"%1\\""', function (err) {
					if (err) throw err;
					gui.Shell.openExternal(gui.App.dataPath+'\\register-magnet.reg'); 
				});
			}
		}
	}
}
