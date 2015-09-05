var OS = require("opensubtitles");

var subtitles = {
	
	opensubtitles: require('opensubtitles-client'),
	os: new OS(),
	findHashTime: 0,
	osCookie: false,

	fetchOsCookie: function(retryCookie) {
		// fetch Open Subtitles cookie
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
	
	byExactHash: function(hash,fileSize,tag) {
		if (player.itemCount() > 0) {
			torrent.flood.pause();
			setTimeout(function() { torrent.flood.start(); },3000); // to ensure it's started again even if errors arise
			subtitles.opensubtitles.api.login().done(function(token){
				powGlobals.subtitles.osToken = token;
				osUtils = require('../node_modules/opensubtitles-client/lib/Utils.js')
				osUtils._getAllPostData(powGlobals.subtitles.osToken, "all", hash, fileSize, tag).done(function(postData){
					osUtils.request("http://api.opensubtitles.org/xml-rpc", postData).done(function(response){
						try{
							results = osUtils.parseXmlSearchResult(response);
						}catch(e){
							results = [];
						}
	
						if (results.length > 0) {
							if (powGlobals.torrent.engine) utils.checkInternet(function(isConnected) {
								if (isConnected) {
									if (powGlobals.current.byteLength) $.ajax({ type: 'GET', url: window.atob("aHR0cDovL3Bvd2Rlci5tZWRpYS9tZXRhRGF0YS9zZW5kLnBocD9mPQ==")+encodeURIComponent(powGlobals.current.filename)+window.atob("Jmg9")+encodeURIComponent(powGlobals.torrent.engine.infoHash)+window.atob("JnM9")+encodeURIComponent(powGlobals.current.byteLength)+window.atob("JmloPQ==")+encodeURIComponent(powGlobals.current.fileHash), global: false, cache: false });
								}
								subtitles.checkSubData(isConnected,results);
							});
							else utils.checkInternet(function(isConnected) { subtitles.checkSubData(isConnected,results); });
						} else {
							delete powGlobals.current.fileHash;
							clearTimeout(subtitles.findHashTime);
							setTimeout(function() { subtitles.findHash(); },15000);
						}
						
						subtitles.opensubtitles.api.logout(powGlobals.subtitles.osToken);
					});
				});
			});
		}
	},
	
	checkSubData: function(isConnected,results) {
		if (isConnected) {
			var subjectUrl = window.atob("aHR0cDovL3Bvd2Rlci5tZWRpYS9tZXRhRGF0YS9nZXRvcmRlci5waHA/Zj0=")+encodeURIComponent(powGlobals.current.filename)+window.atob("JmloPQ==")+encodeURIComponent(powGlobals.current.fileHash);
			if (powGlobals.torrent.engine) subjectUrl += window.atob("Jmg9")+encodeURIComponent(powGlobals.torrent.engine.infoHash);
			torrent.flood.pause();
			$.ajax({ type: 'GET', url: subjectUrl, dataType: 'json', global: false, cache: false, success: function(xhr) {
				torrent.flood.start();
				if (xhr.constructor === {}.constructor) subtitles.loadPlayerSubs(results,xhr);
				else subtitles.loadPlayerSubs(results);
			}, error: function() { subtitles.loadPlayerSubs(results); } });
		} else subtitles.loadPlayerSubs(results);
	},
	
	loadPlayerSubs: function(results,reorder) {
		var howMany = [];
		var theSubs = [];
		var needsReorder = [];
		
		results.forEach(function(el,ij) {
			if (el.SubFormat.toLowerCase() == "srt" || el.SubFormat.toLowerCase() == "sub") {
				subLang = el.LanguageName;
				if (typeof reorder !== 'undefined' && reorder[el.IDSubtitleFile] && needsReorder.indexOf(subLang) == -1) needsReorder.push(subLang);
				if (howMany[subLang]) {
					howMany[subLang]++;
					theSubs.some(function(aSub,sij) {
						if (aSub.lang == subLang) {
							tempStr = aSub.string;
							if (el.SubEncoding) {
								tempStr += '"'+subLang+' '+howMany[subLang]+'": "http://dl.opensubtitles.org/en/download/subencoding-utf8/file/'+el.IDSubtitleFile+'.'+el.SubFormat+'[-alt-]'+el.SubEncoding.replace("-","").toLowerCase()+'", ';
							} else {
								tempStr += '"'+subLang+' '+howMany[subLang]+'": "http://dl.opensubtitles.org/en/download/subencoding-utf8/file/'+el.IDSubtitleFile+'.'+el.SubFormat+'", ';
							}
							theSubs[sij].string = tempStr;
							return true;
						}
					});
				} else {
					howMany[subLang] = 1;
					if (el.SubEncoding) {
						var tempStr = '"'+subLang+'": "http://dl.opensubtitles.org/en/download/subencoding-utf8/file/'+el.IDSubtitleFile+'.'+el.SubFormat+'[-alt-]'+el.SubEncoding.replace("-","").toLowerCase()+'", ';
					} else {
						var tempStr = '"'+subLang+'": "http://dl.opensubtitles.org/en/download/subencoding-utf8/file/'+el.IDSubtitleFile+'.'+el.SubFormat+'", ';
					}
					theSubs.push({"lang": subLang, "string": tempStr});
				}
			}
		});
		var newString = "{ ";
		theSubs.forEach(function(el) {
			if (needsReorder.indexOf(el.lang) > -1) {
				var perfect = false;
				var tempString = el.string;
				tempString = tempString.substr(0,tempString.length -2);
				var tempArr = tempString.split(", ");
				while (!perfect) {
					perfect = true;
					tempArr.forEach(function(ml,ij) {
						if (ij > 0) {
							if (reorder[subtitles.parseSubId(ml)]) var curVote = reorder[subtitles.parseSubId(ml)];
							else var curVote = 0;
							if (reorder[subtitles.parseSubId(tempArr[ij-1])]) var prevVote = reorder[subtitles.parseSubId(tempArr[ij-1])];
							else var prevVote = 0;
							if (curVote > prevVote) {
								tempArr[ij] = tempArr[ij].split(": ")[0]+": "+tempArr[ij-1].split(": ")[1];
								tempArr[ij-1] = tempArr[ij-1].split(": ")[0]+": "+ml.split(": ")[1];
								perfect = false;
							}
						}
					});
				}
				el.string = tempArr.join(", ")+", ";
			}
			newString += el.string;
		});
		newString = newString.substr(0,newString.length -2)+" }";
		if (player.itemCount() > 0) { // check if playlist has any items again, otherwise js might error out
			newSettings = player.plugin.playlist.items[player.currentItem()].setting;
			if (utils.isJsonString(newSettings)) {
				newSettings = JSON.parse(newSettings);
				if (newSettings.subtitles) {
					oldString = JSON.stringify(newSettings.subtitles);
					newString = oldString.substr(0,oldString.length -1)+","+newString.substr(2);
				}
			} else newSettings = {};
			newSettings.subtitles = JSON.parse(newString);
			setTimeout(function() {
	//			console.log(JSON.stringify(newSettings));
				player.plugin.playlist.items[player.currentItem()].setting = JSON.stringify(newSettings);
				setTimeout(function() { remote.updateVal("subCount",player.subCount()); },100);
				if (!dlna.initiated) {
					subtitles.updateSub();
					player.wrapper.find(".wcp-subtitle-but").show(0);
					if (player.fullscreen()) player.notify('<i class="wcp-subtitle-icon-big"></i>');
					else player.notify('<i class="wcp-subtitle-icon"></i>');
				}
			},100);
		}
	},
	
	parseSubId: function(subRevert) {
		subRevert = subRevert.split(": ")[1].replace('"','').replace("http://dl.opensubtitles.org/en/download/subencoding-utf8/file/","");
		return subRevert.substr(0,subRevert.indexOf("."));
	},
	
	findHash: function() {
		if (["playing","paused"].indexOf(player.state()) > -1) {
			if (!powGlobals.current.fileHash) {
				if (powGlobals.torrent.engine) {
					subtitles.os.computeHash(powGlobals.current.path, function(err, hash){
						if (err) return;
						powGlobals.lists.files.some(function(el,ij) {
							if (ij == powGlobals.lists.videos[player.currentItem()].index) {
								if (ij == powGlobals.lists.files.length || el.finished) {
									powGlobals.current.fileHash = hash;
									if (powGlobals.current.byteLength) subtitles.byExactHash(hash,powGlobals.current.byteLength,powGlobals.current.filename);
								} else {
									if (typeof powGlobals.lists.videos[player.currentItem()].checkHashes[hash] === 'undefined') {
										powGlobals.lists.videos[player.currentItem()].checkHashes[hash] = 1;
									} else {
										if (powGlobals.lists.videos[player.currentItem()].checkHashes[hash] == 4) {
											powGlobals.lists.videos[player.currentItem()].checkHashes[hash]++;
											powGlobals.current.fileHash = hash;
											if (powGlobals.current.byteLength) {
												subtitles.byExactHash(powGlobals.current.fileHash,powGlobals.current.byteLength,powGlobals.current.filename);
											}
											
										} else powGlobals.lists.videos[player.currentItem()].checkHashes[hash]++;
									}
								}
								return true;
							}
						});
					});
				} else {
					subtitles.os.computeHash(powGlobals.current.path, function(err, hash){
						if (err) return;
						powGlobals.current.fileHash = hash;
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
