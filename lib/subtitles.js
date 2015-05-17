var opensubtitles = require('opensubtitles-client');
var OS = require("opensubtitles-api");
var os = new OS();

function readData(xhr) {
	if (IsJsonString(xhr)) {
		jsonRes = JSON.parse(xhr);
		if (typeof jsonRes.duration !== 'undefined') {
			powGlobals.duration = parseInt(jsonRes.duration);
		}
		if (typeof jsonRes.filehash !== 'undefined') {
			powGlobals.fileHash = jsonRes.filehash;
			if (powGlobals.byteLength) subtitlesByExactHash(powGlobals.fileHash,powGlobals.byteLength,powGlobals.filename);
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
	if (parseInt(wjs().itemCount()) > 0) {
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
						
						if (powGlobals.engine) checkInternet(function(isConnected) {
							if (isConnected && powGlobals.byteLength) $.ajax({ type: 'GET', url: window.atob("aHR0cDovL3Bvd2Rlci5tZWRpYS9tZXRhRGF0YS9zZW5kLnBocD9mPQ==")+encodeURIComponent(powGlobals.filename)+window.atob("Jmg9")+encodeURIComponent(powGlobals.engine.infoHash)+window.atob("JnM9")+encodeURIComponent(powGlobals.byteLength)+window.atob("JmloPQ==")+encodeURIComponent(powGlobals.fileHash), global: false, cache: false });
						});
						
						var howMany = [];
						var theSubs = [];
						
						results.forEach(function(el,ij) {
							if (el.SubFormat.toLowerCase() == "srt" || el.SubFormat.toLowerCase() == "sub") {
								subLang = el.LanguageName;
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
											return false;
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
						theSubs.forEach(function(el) { newString += el.string; });
						newString = newString.substr(0,newString.length -2)+" }";
						if (parseInt(wjs().itemCount()) > 0) { // check if playlist has any items again, otherwise js might error out
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
						}
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
}

function findHash() {
	if (wjs().state() == "playing" || wjs().state() == "paused") {
		if (!powGlobals.fileHash) {
			if (powGlobals.engine) {
				os.computeHash(powGlobals.path, function(err, hash){
					if (err) return;
					powGlobals.files.some(function(el,ij) {
						if (el.index == powGlobals.videos[wjs().currentItem()].index) {
							if (ij == powGlobals.files.length) {
								powGlobals.fileHash = hash;
								if (powGlobals.byteLength) subtitlesByExactHash(hash,powGlobals.byteLength,powGlobals.filename);
							} else if (el.finished) {
								powGlobals.fileHash = hash;
								if (powGlobals.byteLength) subtitlesByExactHash(hash,powGlobals.byteLength,powGlobals.filename);
							} else {
								if (typeof powGlobals.videos[wjs().currentItem()].checkHashes[hash] === 'undefined') {
									powGlobals.videos[wjs().currentItem()].checkHashes[hash] = 1;
								} else {
									if (powGlobals.videos[wjs().currentItem()].checkHashes[hash] == 4) {
										powGlobals.videos[wjs().currentItem()].checkHashes[hash]++;
										powGlobals.fileHash = hash;
										if (powGlobals.byteLength) {
											subtitlesByExactHash(powGlobals.fileHash,powGlobals.byteLength,powGlobals.filename);
										}
										
									} else powGlobals.videos[wjs().currentItem()].checkHashes[hash]++;
								}
							}
							return false;
						}
					});
				});
			} else {
				os.computeHash(powGlobals.path, function(err, hash){
					if (err) return;
					powGlobals.fileHash = hash;
					subtitlesByExactHash(powGlobals.fileHash,altLength,powGlobals.filename);
				});
			}
			if (!powGlobals.fileHash) {
				clearTimeout(findHashTime);
				findHashTime = setTimeout(function() { findHash(); },15000);
			}
		}
	} else {
		clearTimeout(findHashTime);
		findHashTime = setTimeout(function() {
			findHash();
		},15000);
	}
}
