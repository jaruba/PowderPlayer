var osMod = require('opensubtitles-api');

var subtitles = {
	
	os: new osMod(atob('T3BlblN1YnRpdGxlc1BsYXllciB2NC43')),
	findHashTime: 0,
	osCookie: false,

	fetchOsCookie: function(retryCookie) {
		utils.checkInternet(function(isConnected) {
			if (isConnected) {
				var req = require('http').request({ host: "dl.opensubtitles.org", path: "/en/download/subencoding-utf8/file/5833874" },function(res) {
					if (res.headers["set-cookie"] && res.headers["set-cookie"][0]) {
						tempCookie = res.headers["set-cookie"][0];
						subtitles.osCookie = (tempCookie + "").split(";").shift();
					} else if (!res.headers["set-cookie"] && retryCookie) {
						console.log("fetching OS cookie failed, trying again in 20 sec");
						setTimeout(function() { subtitles.fetchOsCookie(false) },20000);
					}
				});
				req.end();
			}
		});
	},
	
	readData: function(xhr) {
		if (utils.isJsonString(xhr)) {
			jsonRes = JSON.parse(xhr);
			if (typeof jsonRes.filehash !== 'undefined') {
				powGlobals.current.fileHash = jsonRes.filehash;
				if (powGlobals.current.byteLength) subtitles.byExactHash(powGlobals.current.fileHash,powGlobals.current.byteLength,powGlobals.current.filename);
			} else {
				clearTimeout(subtitles.findHashTime);
				subtitles.findHash();
			}
		} else {
			clearTimeout(subtitles.findHashTime);
			subtitles.findHash();
		}
	},
	
	tryLater: function(hashMs) {
		if (powGlobals.current.fileHash) delete powGlobals.current.fileHash;
		clearTimeout(subtitles.findHashTime);
		subtitles.findHashTime = setTimeout(function() {
			subtitles.findHash();
		},hashMs);
	},
	
	byExactHash: function(hash,fileSize,tag) {
		if (player.itemCount() > 0) {
			torrent.flood.pause();
			setTimeout(function() { torrent.flood.start(); },3000); // to ensure it's started again even if errors arise
			subtitles.os.login().then(function(response){
				powGlobals.subtitles.osToken = response.token;
				
				searcher = {
					sublanguageid: 'all',
					extensions: ['srt','sub','vtt'],
					hash: hash,
					size: fileSize,
					filename: powGlobals.current.filename
				};
				
				if (utils.parser(powGlobals.current.filename).shortSzEp()) {
					searcher.season = utils.parser(powGlobals.current.filename).season().toString();
					searcher.episode = utils.parser(powGlobals.current.filename).episode().toString();
				}
				
				if (player.fps()) searcher.fps = player.fps();
				
				subtitles.os.search(searcher).then(function(subData) {
					if (!$.isEmptyObject(subData)) {
						utils.checkInternet(function(isConnected) {
							if (isConnected) {
								if (powGlobals.current.byteLength) {
									tempData = window.atob("aHR0cDovL3Bvd2Rlci5tZWRpYS9tZXRhRGF0YS9zZW5kLnBocD9mPQ==")+encodeURIComponent(powGlobals.current.filename)+window.atob("JmloPQ==")+encodeURIComponent(powGlobals.current.fileHash)+window.atob("JnM9")+encodeURIComponent(powGlobals.current.byteLength);
									
									if (powGlobals.torrent.engine) {
										tempData += window.atob("Jmg9")+encodeURIComponent(powGlobals.torrent.engine.infoHash);
									}
									$.ajax({ type: 'GET', url: tempData, global: false, cache: false });
								}
							}
						});
						newString = '{ ';
						async.forEachOf(subData, function (item, ij, callback){
							newString += '"'+item.langName+'": "http://dl.opensubtitles.org/en/download/subencoding-utf8/file/'+item.url.split('/').pop()+'", ';
							callback();
						}, function(err) {
							newString = newString.substr(0,newString.length -2)+" }";
							if (player.itemCount() > 0) {
								newSettings = player.vlc.playlist.items[player.currentItem()].setting;
								if (utils.isJsonString(newSettings)) {
									newSettings = JSON.parse(newSettings);
									if (newSettings.subtitles) {
										oldString = JSON.stringify(newSettings.subtitles);
										newString = oldString.substr(0,oldString.length -1)+","+newString.substr(2);
									}
								} else newSettings = {};
								newSettings.subtitles = JSON.parse(newString);
								setTimeout(function() {
	//								console.log(JSON.stringify(newSettings));
									player.vlc.playlist.items[player.currentItem()].setting = JSON.stringify(newSettings);
									setTimeout(function() { remote.updateVal("subCount",player.subCount()); },100);
									if (!dlna.initiated) {
										subtitles.updateSub();
										player.wrapper.find(".wcp-subtitle-but").show(0);
										if (player.fullscreen()) player.notify('<i class="wcp-subtitle-icon-big"></i>');
										else player.notify('<i class="wcp-subtitle-icon"></i>');
									}
								},100);
							}
						});

					} else {
//						console.log(1);
//						subtitles.tryLater(15000);
						player.notify('No Subtitles Found');
					}
				}).catch(function(err){
//					console.log(2);
//					console.log(err.message);
					subtitles.tryLater(15000);
				});
				
			}).catch(function(err){
//				console.log(3);
//				console.log(err.message);
				subtitles.tryLater(30000);
			});
		}
	},
	
	findHash: function() {
		if (["playing","paused"].indexOf(player.state()) > -1) {
			if (!powGlobals.current.fileHash) {
				if (powGlobals.torrent.engine) {
					subtitles.os.extractInfo(powGlobals.current.path).then(function(infos) {
						hash = infos.moviehash;
//						console.log("found this hash: "+hash);
						el = powGlobals.lists.files[powGlobals.lists.media[player.currentItem()].index];
						if (el.finished) {
							powGlobals.current.fileHash = infos.moviehash;
							if (powGlobals.current.byteLength) subtitles.byExactHash(infos.moviehash,powGlobals.current.byteLength,powGlobals.current.filename);
						} else {
							if (typeof powGlobals.lists.media[player.currentItem()].checkHashes[hash] === 'undefined') {
								powGlobals.lists.media[player.currentItem()].checkHashes[hash] = 1;
							} else {
								if (powGlobals.lists.media[player.currentItem()].checkHashes[hash] >= 1) {
									powGlobals.lists.media[player.currentItem()].checkHashes[hash]++;
									powGlobals.current.fileHash = hash;
									if (powGlobals.current.byteLength) {
										subtitles.byExactHash(powGlobals.current.fileHash,powGlobals.current.byteLength,powGlobals.current.filename);
									}
									
								} else powGlobals.lists.media[player.currentItem()].checkHashes[hash]++;
							}
						}
						return true;
					});
				} else {
					subtitles.os.extractInfo(powGlobals.current.path).then(function(infos) {
						powGlobals.current.fileHash = infos.moviehash;
						if (!powGlobals.current.byteLength && powGlobals.current.path) {
							powGlobals.current.byteLength = utils.fs.size(powGlobals.current.path);
						}
						if (!powGlobals.current.byteLength) powGlobals.current.byteLength = 0;
						subtitles.byExactHash(powGlobals.current.fileHash,powGlobals.current.byteLength,powGlobals.current.filename);
					});
				}
				if (!powGlobals.current.fileHash) {
					clearTimeout(subtitles.findHashTime);
					subtitles.findHashTime = setTimeout(function() { subtitles.findHash(); },15000);
				}
			}
		} else {
			clearTimeout(subtitles.findHashTime);
			subtitles.findHashTime = setTimeout(function() { subtitles.findHash(); },15000);
		}
	},
	
	updateSub: function() {
		if (localStorage.subLang != "None") {
			for (gvn = 1; gvn < player.subCount(); gvn++) {
				if (player.subDesc(gvn).language == localStorage.subLang) {
					player.subTrack(gvn);
					break;
				}
			}
		}
	}

}

subtitles.fetchOsCookie(true);
