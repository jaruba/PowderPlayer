
var utils = {
	
	portrange: 45032,
	
	_supportedProtocols: ['magnet','http','https'],
	
	ga: { loaded: false },
	
	checkUrl: require('valid-url'),

	availPlugins: {},
	
	eventMod: require('events'),
	
	download: function(url, dest, cb) {
	  var http = require('http');
	  var fs = require('fs');
	  var file = fs.createWriteStream(dest);
	  var request = http.get(url, function(response) {
		response.pipe(file);
		file.on('finish', function() {
		  file.close(cb);  // close() is async, call cb after close completes.
		});
	  }).on('error', function(err) { // Handle errors
		fs.unlink(dest); // Delete the file async. (But we don't check the result)
		if (cb) cb(err.message);
	  });
	},

	validateUrl: function(torLink) {
		
		if (torLink.indexOf(':') > -1 && this._supportedProtocols.indexOf(torLink.substr(0,torLink.indexOf(':'))) > -1) {

			if (this.checkUrl.isUri(torLink)){
				return torLink;
			} else {
				// let's try to fix it
				if (torLink.indexOf('&') > -1) {
					procLink = torLink.substr(0,torLink.lastIndexOf('&'));
					if (this.checkUrl.isUri(procLink)) return procLink;
				}
				if (torLink.indexOf('?') > -1) {
					procLink = torLink.substr(0,torLink.indexOf('?'));
					if (this.checkUrl.isUri(procLink)) return procLink;
				}
			}
			
		}

		return torLink;

	},
	
	getContentType: function(torLink,cb) {
		require('needle').get(torLink, {
			follow_max: 4, open_timeout: 3500,
			headers: { "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.99 Safari/537.36" }
		}).on('headers', function(headers) {
			if (headers['content-type']) {
				cb(null,headers['content-type'])
			} else cb(true);
		}).on("error", function(e) {
			cb(true);
		}).on("end", function() { 
			// no headers
			cb(true);
		});
	},
	
	createWindow: function(pluginId, pluginPage, winSettings, cb) {
		
		utils.unusedPort(function(port) {

			if (cb) var io = require('socket.io').listen(port);
			
			if (!winSettings) winSettings = {};
			if (!winSettings.icon) winSettings.icon = 'icon.png';
			if (!winSettings.toolbar) winSettings.toolbar = false;

			if (pluginId) newURL = 'file://'+gui.App.dataPath+pathBreak+'plugins'+pathBreak+pluginId+pathBreak+pluginPage+'#'+port;
			else newURL = 'app://powder/src/'+pluginPage;
			
			if (cb) newWindow = gui.Window.open(newURL+'#'+port, winSettings);
			else newWindow = gui.Window.open(newURL, winSettings);
			
			win.childWindows.push(newWindow);
	
			if (cb) io.on('connection', function(socket){
				cb(socket, newWindow);
			});
	
			if (cb) newWindow.on('close', function() {
				io.close();
			});
			
		});

	},
	
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
					win32: ["C:\\Program Files\\VideoLAN\\VLC\\vlc.exe", "C:\\Program Files (x86)\\VideoLAN\\VLC\\vlc.exe"]
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
	
	unusedPort: function(cb) {
		var port = utils.portrange
		utils.portrange += 1
		var server = require('net').createServer()
		server.listen(port, function (err) {
			server.once('close', function () { cb(port) })
			server.close()
		})
		server.on('error', function (err) { utils.unusedPort(cb) })
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
	
	processArgs: function(args, willReset) {
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
			if (!willReset) utils.resetPowGlobals();
			load.url(load.argData.keepFirst);
			delete load.argData.keepFirst;
		}
	},
	
	reprocessArgs: function(newArgs, attention, cb) {
		if (newArgs) {
			if (newArgs.length) {
				if (!gui) var gui = require('nw.gui');
				if (JSON.stringify(newArgs) != JSON.stringify(gui.App.argv)) {
	
					if (powGlobals.torrent.engine && !powGlobals.torrent.hasVideo) {
						if (torrent.timers.peers) clearInterval(torrent.timers.peers);
						if (torrent.timers.setDownload) clearTimeout(torrent.timers.setDownload);
						clearTimeout(torrent.timers.down);
						powGlobals.torrent.engine.kill();
						utils.resetPowGlobals();
						player.stop();
						player.clearPlaylist();
						$('#main').css("display","table");
						$("#inner-in-content").css("overflow-y","hidden");
						utils.processArgs(newArgs);
					} else {
						if (player && player.itemCount() == 0) {
							utils.processArgs(newArgs);
						} else {
							utils.processArgs(newArgs,true);
							player.notify('Added to Playlist');
						}
					}
	
					cb();
	
				} else cb();
			} else if (!newArgs.length) cb();

			if (attention) {
				var tmpWin = gui.Window.get();
				tmpWin.requestAttention(2);
				setTimeout(function() {
					tmpWin.requestAttention(false);
				}, 1000);
			}
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
				
				ui.settings.loadPluginList();

				// analytics
				var ua = require('universal-analytics');
				if (!localStorage.cid) {
					utils.ga.visitor = ua('UA-65979437-3');
					localStorage.cid = utils.ga.visitor.cid;
				} else {
					utils.ga.visitor = ua('UA-65979437-3', localStorage.cid);
				}
				utils.ga.visitor.pageview("/mask.html").send();
				utils.ga.loaded = true;
			} else $('#select-plugin-list').empty().html('<div onClick="ui.settings.loadPluginList(); return false" class="actionButton wrap-text"><span class="droid-bold">Couldn\'t connect. Press to try again.</span></div>');
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
	
	parser: require('ultimate-parser'),
	
	register: {
		
		_writeDesktopFile: function(cb) {
			var powderPath = process.execPath.substr(0,process.execPath.lastIndexOf("/")+1);
			fs.writeFile(gui.App.dataPath+'/powder.desktop', '[Desktop Entry]\nVersion=1.0\nName=Powder Player\nComment=Powder Player is a hybrid between a Torrent Client and a Player (torrent streaming)\nExec="'+process.execPath+'" %U\nPath="'+powderPath+'"\nIcon="'+powderPath+'icon.png"\nTerminal=false\nType=Application\nMimeType=application/x-bittorrent;x-scheme-handler/magnet;x-scheme-handler/pow;video/avi;video/msvideo;video/x-msvideo;video/mp4;video/x-matroska;video/mpeg;\n', cb);
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
		},
		
		powLinks: function() {
			if (process.platform == 'linux') {
				this._writeDesktopFile(function(err) {
					if (err) throw err;
					var desktopFile = gui.App.dataPath+'/powder.desktop';
					var tempMime = 'x-scheme-handler/pow';
					require('child_process').exec('gnome-terminal -x bash -c "echo \'Associating Files or URls with Applications requires Admin Rights\'; echo; sudo echo; sudo echo \'Authentication Successful\'; sudo echo; sudo mv -f '+desktopFile+' /usr/share/applications; sudo xdg-mime default powder.desktop '+tempMime+'; sudo gvfs-mime --set '+tempMime+' powder.desktop; echo; echo \'Association Complete! Press any key to close ...\'; read" & disown');
				});
			} else if (process.platform == 'darwin') {
				var powderPath = process.execPath.substr(0,process.execPath.lastIndexOf("/")+1)+"../../../../Resources/app.nw/";
				require('child_process').exec('"'+powderPath+'src/duti/duti" -s media.powder.player pow');
			}
		}
	}
}
