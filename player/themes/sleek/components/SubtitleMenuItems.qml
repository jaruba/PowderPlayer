import QtQuick 2.1
import QmlVlc 0.1

Rectangle {
	id: root
	anchors.top: parent.top
	anchors.topMargin: 0
	width: subMenublock.width < 694 ? (subMenublock.width -12) : 682
	height: 272
	color: "transparent"
	property var subPlaying: 0;

	property var currentSubtitle: -2;
	property var subtitles: [];
	
	property variant subItems: [];
	
	// Start Toggle Subtitle Menu (open/close)
	function toggleSubtitles() {
		if (settings.subtitlemenu === false) {
			if (settings.playlistmenu === true) {
				playlistblock.visible = false;
				settings.playlistmenu = false;
			}
			subMenublock.visible = true;
			settings.subtitlemenu = true;
		} else {
			subMenublock.visible = false;
			settings.subtitlemenu = false;
		}
	}
	// End Toggle Subtitle Menu (open/close)

	// Start External Subtitles (SRT, SUB)
	
	// Start Convert Time to Seconds (needed for External Subtitles)
	function toSeconds(t) {
		var s = 0.0
		if (t) {
			var p = t.split(':');
			var i = 0;
			for (i=0;i<p.length;i++) s = s * 60 + parseFloat(p[i].replace(',', '.'))
		}
		return s;
	}
	// End Convert Time to Seconds (needed for External Subtitles)
				
	function playSubtitles(subtitleElement) {
		if (typeof(currentSubtitle) !== "undefined") currentSubtitle = -1;
		if (typeof(subtitles) !== "undefined") if (subtitles.length) subtitles = {};
		var xhr = new XMLHttpRequest;
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4) {
	
				var srt = xhr.responseText;
				if (srt.indexOf("[CRITICAL ERROR]") > -1) {
					if (subtitleElement.indexOf("http://dl.opensubtitles.org/en/download/subencoding-") > -1) {
						if (subtitleElement.indexOf("[-alt-]") > -1) {
							 playSubtitles("http://dl.opensubtitles.org/en/download/subencoding-"+subtitleElement.split('[-alt-]')[1]+"/file/"+subtitleElement.split('[-alt-]')[0].split('/').pop());
						} else {
							playSubtitles("http://dl.opensubtitles.org/en/download/file/"+subtitleElement.split('/').pop());
						}
					} else {
						wjs.setText("Subtitle Error");
					}
					return;
				}
				subtitles = {};
				
				if (subtitleElement.indexOf("[-alt-]") > -1) {
					var extension = subtitleElement.split("[-alt-]")[0].split('.').pop();
				} else {
					var extension = subtitleElement.split('.').pop();
				}
				if (extension.toLowerCase() == "srt" || extension.toLowerCase() == "vtt") {
					
					srt = srt.replace(/\r\n|\r|\n/g, '\n');
					
					if (typeof srt === 'undefined') {
						if (subtitleElement.indexOf("http://dl.opensubtitles.org/en/download/subencoding-") > -1) {
							if (subtitleElement.indexOf("[-alt-]") > -1) {
								playSubtitles("http://dl.opensubtitles.org/en/download/subencoding-"+subtitleElement.split('[-alt-]')[1]+"/file/"+subtitleElement.split('[-alt-]')[0].split('/').pop());
							} else {
								playSubtitles("http://dl.opensubtitles.org/en/download/file/"+subtitleElement.split('/').pop());
							}
						} else {
							wjs.setText("Subtitle Error");
						}
						return;
					}
					srt = wjs.strip(srt);
					var srty = srt.split('\n\n');
	
					var s = 0;
					if (srty[0].substr(0,6).toLowerCase() == "webvtt") {
						for (s = 0; s < srty.length; s++) {
							var st = srty[s].split('\n');
							if (st.length >=2) {
								if (st[0].split(' --> ')[0]) if (st[0].split(' --> ')[1]) {
									var is = Math.round(toSeconds(wjs.strip(st[0].split(' --> ')[0])));
									var os = Math.round(toSeconds(wjs.strip(st[0].split(' --> ')[1])));
									var t = st[2];
									if( st.length > 2) {
										var j = 3;
										for (j=3; j<st.length; j++) t = t + '\n'+st[j];
									}
									subtitles[is] = {i:is, o: os, t: t};
								}
							}
						}
					} else {
						for (s = 0; s < srty.length; s++) {
							var st = srty[s].split('\n');
							if (st.length >=2) {
						
							  var n = st[0];
							  if (typeof st[1].split(' --> ')[0] === 'undefined') {
	
								if (subtitleElement.indexOf("http://dl.opensubtitles.org/en/download/subencoding-") > -1) {
	
									if (subtitleElement.indexOf("[-alt-]") > -1) {
									playSubtitles("http://dl.opensubtitles.org/en/download/subencoding-"+subtitleElement.split('[-alt-]')[1]+"/file/"+subtitleElement.split('[-alt-]')[0].split('/').pop());
									} else {
										playSubtitles("http://dl.opensubtitles.org/en/download/file/"+subtitleElement.split('/').pop());
									}
								} else {
									wjs.setText("Subtitle Error");
								}
								  return;
							  }
							  if (typeof st[1].split(' --> ')[1] === 'undefined') {
								if (subtitleElement.indexOf("http://dl.opensubtitles.org/en/download/subencoding-") > -1) {
									if (subtitleElement.indexOf("[-alt-]") > -1) {
										playSubtitles("http://dl.opensubtitles.org/en/download/subencoding-"+subtitleElement.split('[-alt-]')[1]+"/file/"+subtitleElement.split('[-alt-]')[0].split('/').pop());
									} else {
										playSubtitles("http://dl.opensubtitles.org/en/download/file/"+subtitleElement.split('/').pop());
									}
								} else {
									wjs.setText("Subtitle Error");
								}
								  return;
							  }
							  var is = Math.round(toSeconds(wjs.strip(st[1].split(' --> ')[0])));
							  var os = Math.round(toSeconds(wjs.strip(st[1].split(' --> ')[1])));
							  var t = st[2];
							  
							  if( st.length > 2) {
								var j = 3;
								for (j=3; j<st.length; j++) {
									t = t + '\n'+st[j];
								}
		
							  }
							  subtitles[is] = {i:is, o: os, t: t};
							}
						}
					}
				} else if (extension.toLowerCase() == "sub") {
					srt = srt.replace(/\r\n|\r|\n/g, '\n');
					
					if (typeof srt === 'undefined') {
						if (subtitleElement.indexOf("http://dl.opensubtitles.org/en/download/subencoding-") > -1) {
							if (subtitleElement.indexOf("[-alt-]") > -1) {
								playSubtitles("http://dl.opensubtitles.org/en/download/subencoding-"+subtitleElement.split('[-alt-]')[1]+"/file/"+subtitleElement.split('[-alt-]')[0].split('/').pop());
							} else {
								playSubtitles("http://dl.opensubtitles.org/en/download/file/"+subtitleElement.split('/').pop());
							}
						} else {
							wjs.setText("Subtitle Error");
						}
						return;
					}
					srt = wjs.strip(srt);
					var srty = srt.split('\n');
	
					var s = 0;
					for (s = 0; s < srty.length; s++) {
						var st = srty[s].split('}{');
						if (st.length >=2) {
						  var is = Math.round(st[0].substr(1) /10);
						  var os = Math.round(st[1].split('}')[0] /10);
						  var t = st[1].split('}')[1].replace('|', '\n');
						  if (is != 1 && os != 1) subtitles[is] = {i:is, o: os, t: t};
						}
					}
				}
				currentSubtitle = -1;
			}
		}
//		if (subtitleElement.indexOf("http://dl.opensubtitles.org/en/download/filead/") == 0) subtitleElement = "http://dl.opensubtitles.org/en/download/subencoding-utf8/file/"+subtitleElement.split('/').pop();
		if (subtitleElement.indexOf("[-alt-]") > -1) {
			xhr.open("get", subtitleElement.split('[-alt-]')[0]);
		} else {
			xhr.open("get", subtitleElement);
		}
		xhr.send();
	}
	// End External Subtitles (SRT, SUB)
	
	// Start Remove all Subtitles
	function clearAll() {
		var pli = 0;
		
		if (settings.totalSubs > 0) for (pli = 0; pli < settings.totalSubs; pli++) if (typeof subItems[pli] !== 'undefined') {
			subItems[pli].destroy();
			delete subItems[pli];
		}
	
		clearSubtitles();
		subPlaying = 0;
		subItems = [];
		settings.totalSubs = 0;
	}
	// End Remove all Subtitles
	
	// save current subtitle to item settings to expose it to JS
	function saveSub(newSaved) {
		var itemSettings = {};
		wjs.setText(vlcPlayer.playlist.currentItem);
		wjs.setText(vlcPlayer.playlist.items[0].setting);
		wjs.setText(vlcPlayer.playlist.items[vlcPlayer.playlist.currentItem].setting);
		if (wjs.isJson(vlcPlayer.playlist.items[vlcPlayer.playlist.currentItem].setting)) itemSettings = JSON.parse(vlcPlayer.playlist.items[vlcPlayer.playlist.currentItem].setting);
		itemSettings.subPlaying = newSaved;
		vlcPlayer.playlist.items[vlcPlayer.playlist.currentItem].setting = JSON.stringify(itemSettings);
	}
	// end save current subtitle to item settings to expose it to JS
	
	// select subtitle
	function selectSubtitle(selSub) {
		if (selSub == 0) {
			clearSubtitles();
		} else if (selSub < vlcPlayer.subtitle.count) {
			clearSubtitles();
			subPlaying = selSub;
			saveSub(selSub);
			vlcPlayer.subtitle.track = selSub;
		} else {
			var getSettings = {};
			if (wjs.isJson(vlcPlayer.playlist.items[vlcPlayer.playlist.currentItem].setting)) getSettings = JSON.parse(vlcPlayer.playlist.items[vlcPlayer.playlist.currentItem].setting);
			if (getSettings.subtitles) {
				var wjs_target = getSettings.subtitles;
				var wjs_keepIndex = vlcPlayer.subtitle.count;
				if (wjs_keepIndex == 0) wjs_keepIndex = 1;
				for (var newDesc in wjs_target) if (wjs_target.hasOwnProperty(newDesc)) {
					if (selSub == wjs_keepIndex) {
						vlcPlayer.subtitle.track = 0;
						playSubtitles(wjs_target[newDesc]);
						subPlaying = wjs_keepIndex;
						saveSub(wjs_keepIndex);
						return;
					}
					wjs_keepIndex++;
				}
				return;
			}
		}
	}
	// end select subtitle
	
	// Start Clear External Subtitles (SRT, SUB)
	function clearSubtitles() {
		subtitlebox.changeText = "";
		currentSubtitle = -2;
		subtitles = [];
		vlcPlayer.subtitle.track = 0;
		subPlaying = 0;
		saveSub(0);
	}
	// End Clear External Subtitles (SRT, SUB)

	function addSubtitleItems(target) {
		// Remove Old Subtitle Menu Items
		clearAll();
	
		// Adding Subtitle Menu Items
		var plstring = "None";
		var pli = 0;
		
		subItems[pli] = Qt.createQmlObject('import QtQuick 2.1; import QtQuick.Layouts 1.0; import QmlVlc 0.1; Rectangle { id: dstitem'+ pli +'; anchors.left: parent.left; anchors.top: parent.top; anchors.topMargin: 32 + ('+ pli +' *40); color: "transparent"; width: subMenublock.width < 694 ? (subMenublock.width -56) : 638; height: 40; MouseArea { id: sitem'+ pli +'; cursorShape: Qt.PointingHandCursor; hoverEnabled: true; anchors.fill: parent; onWheel: { if (wheel.angleDelta.y > 0) wjs.moveSubMenu(parseInt(subMenuScroll.dragger.anchors.topMargin) + (parseInt(subMenuScroll.dragger.height) /2) -5); if (wheel.angleDelta.y < 0) wjs.moveSubMenu(parseInt(subMenuScroll.dragger.anchors.topMargin) + (parseInt(subMenuScroll.dragger.height) /2) +5); } onClicked: { toggleSubtitles(); clearSubtitles(); subPlaying = '+ pli +'; saveSub('+ pli +'); wjs.setText("Subtitle Unloaded"); vlcPlayer.subtitle.track = 0; fireQmlMessage("[save-sub]'+plstring+'"); savedSub = "'+plstring+'"; } } Rectangle { width: subMenublock.width < 694 ? (subMenublock.width -56) : 638; clip: true; height: 40; color: vlcPlayer.state == 1 ? subPlaying == '+ pli +' ? sitem'+ pli +'.containsMouse ? "#3D3D3D" : "#e5e5e5" : sitem'+ pli +'.containsMouse ? "#3D3D3D" : "transparent" : subPlaying == '+ pli +' ? sitem'+ pli +'.containsMouse ? "#3D3D3D" : "#e5e5e5" : sitem'+ pli +'.containsMouse ? "#3D3D3D" : "transparent"; Text { anchors.left: parent.left; anchors.leftMargin: 12; anchors.verticalCenter: parent.verticalCenter; text: "'+ plstring +'"; font.pointSize: 10; color: vlcPlayer.state == 1 ? subPlaying == '+ pli +' ? sitem'+ pli +'.containsMouse ? "#e5e5e5" : "#2f2f2f" : sitem'+ pli +'.containsMouse ? "#e5e5e5" : "#e5e5e5" : subPlaying == '+ pli +' ? sitem'+ pli +'.containsMouse ? "#e5e5e5" : "#2f2f2f" : sitem'+ pli +'.containsMouse ? "#e5e5e5" : "#e5e5e5"; } } }', root, 'smenustr' +pli);
		pli++;
		
		if (vlcPlayer.subtitle.count > 1) while (pli < vlcPlayer.subtitle.count) {
//			if (vlcPlayer.subtitle.track == pli) subPlaying = pli;
			subItems[pli] = Qt.createQmlObject('import QtQuick 2.1; import QtQuick.Layouts 1.0; import QmlVlc 0.1; Rectangle { id: dstitem'+ pli +'; anchors.left: parent.left; anchors.top: parent.top; anchors.topMargin: 32 + ('+ pli +' *40); color: "transparent"; width: subMenublock.width < 694 ? (subMenublock.width -56) : 638; height: 40; MouseArea { id: sitem'+ pli +'; cursorShape: Qt.PointingHandCursor; hoverEnabled: true; anchors.fill: parent; onWheel: { if (wheel.angleDelta.y > 0) wjs.moveSubMenu(parseInt(subMenuScroll.dragger.anchors.topMargin) + (parseInt(subMenuScroll.dragger.height) /2) -5); if (wheel.angleDelta.y < 0) wjs.moveSubMenu(parseInt(subMenuScroll.dragger.anchors.topMargin) + (parseInt(subMenuScroll.dragger.height) /2) +5); } onClicked: { toggleSubtitles(); clearSubtitles(); subPlaying = '+ pli +'; saveSub('+ pli +'); wjs.setText("Subtitle: '+ vlcPlayer.subtitle.description(pli) +'"); vlcPlayer.subtitle.track = '+ pli +'; } } Rectangle { width: subMenublock.width < 694 ? (subMenublock.width -56) : 638; clip: true; height: 40; color: vlcPlayer.state == 1 ? subPlaying == '+ pli +' ? sitem'+ pli +'.containsMouse ? "#3D3D3D" : "#e5e5e5" : sitem'+ pli +'.containsMouse ? "#3D3D3D" : "transparent" : subPlaying == '+ pli +' ? sitem'+ pli +'.containsMouse ? "#3D3D3D" : "#e5e5e5" : sitem'+ pli +'.containsMouse ? "#3D3D3D" : "transparent"; Text { anchors.left: parent.left; anchors.leftMargin: 12; anchors.verticalCenter: parent.verticalCenter; text: "'+ vlcPlayer.subtitle.description(pli) +'"; font.pointSize: 10; color: vlcPlayer.state == 1 ? subPlaying == '+ pli +' ? sitem'+ pli +'.containsMouse ? "#e5e5e5" : "#2f2f2f" : sitem'+ pli +'.containsMouse ? "#e5e5e5" : "#e5e5e5" : subPlaying == '+ pli +' ? sitem'+ pli +'.containsMouse ? "#e5e5e5" : "#2f2f2f" : sitem'+ pli +'.containsMouse ? "#e5e5e5" : "#e5e5e5"; } } }', root, 'smenustr' +pli);
			pli++;
		}
		
		var subsArray = [];
		var kj = 0;

		for (var k in target) if (target.hasOwnProperty(k)) {
			var plstring = k;
			if (plstring.length > 85) plstring = plstring.substr(0,85) +'...';
			var slink = target[k];
			
			if (plstring.toLowerCase() == savedSub.toLowerCase()) {
				playSubtitles(slink);
				subPlaying = pli;
			}
			
			if (plstring.indexOf(" ") > -1) {
				var tempSub = plstring.split(" ")[0];
			} else {
				var tempSub = plstring;
			}
			
 			subItems[pli] = Qt.createQmlObject('import QtQuick 2.1; import QtQuick.Layouts 1.0; import QmlVlc 0.1; Rectangle { id: dstitem'+ pli +'; anchors.left: parent.left; anchors.top: parent.top; anchors.topMargin: 32 + ('+ pli +' *40); color: "transparent"; width: subMenublock.width < 694 ? (subMenublock.width -56) : 638; height: 40; MouseArea { id: sitem'+ pli +'; cursorShape: Qt.PointingHandCursor; hoverEnabled: true; anchors.fill: parent; onWheel: { if (wheel.angleDelta.y > 0) wjs.moveSubMenu(parseInt(subMenuScroll.dragger.anchors.topMargin) + (parseInt(subMenuScroll.dragger.height) /2) -5); if (wheel.angleDelta.y < 0) wjs.moveSubMenu(parseInt(subMenuScroll.dragger.anchors.topMargin) + (parseInt(subMenuScroll.dragger.height) /2) +5); } onClicked: { toggleSubtitles(); playSubtitles("'+ slink +'"); wjs.setText("Subtitle: '+ plstring +'"); subPlaying = '+ pli +'; saveSub('+ pli +'); vlcPlayer.subtitle.track = 0; fireQmlMessage("[save-sub]'+plstring+'"); savedSub = "'+tempSub+'"; } } Rectangle { width: subMenublock.width < 694 ? (subMenublock.width -56) : 638; clip: true; height: 40; color: vlcPlayer.state == 1 ? subPlaying == '+ pli +' ? sitem'+ pli +'.containsMouse ? "#3D3D3D" : "#e5e5e5" : sitem'+ pli +'.containsMouse ? "#3D3D3D" : "transparent" : subPlaying == '+ pli +' ? sitem'+ pli +'.containsMouse ? "#3D3D3D" : "#e5e5e5" : sitem'+ pli +'.containsMouse ? "#3D3D3D" : "transparent"; Text { anchors.left: parent.left; anchors.leftMargin: 12; anchors.verticalCenter: parent.verticalCenter; text: "'+ plstring +'"; font.pointSize: 10; color: vlcPlayer.state == 1 ? subPlaying == '+ pli +' ? sitem'+ pli +'.containsMouse ? "#e5e5e5" : "#2f2f2f" : sitem'+ pli +'.containsMouse ? "#e5e5e5" : "#e5e5e5" : subPlaying == '+ pli +' ? sitem'+ pli +'.containsMouse ? "#e5e5e5" : "#2f2f2f" : sitem'+ pli +'.containsMouse ? "#e5e5e5" : "#e5e5e5"; } } }', root, 'smenustr' +pli);
			pli++
		}

		settings.totalSubs = pli;
		saveSub(subPlaying);
		// End Adding Subtitle Menu Items
	}
	
	 Connections {
		 target: vlcPlayer
		 onMediaPlayerTimeChanged: {
			// Start show subtitle text (external subtitles)
			var nowSecond = (vlcPlayer.time - settings.subDelay) /1000;
			if (currentSubtitle > -2) {
				var subtitle = -1;
				
				var os = 0;
				for (os in subtitles) {
					if (os > nowSecond) break;
					subtitle = os;
				}
				
				if (subtitle > 0) {
					if(subtitle != currentSubtitle) {
						if ((subtitles[subtitle].t.match(new RegExp("<", "g")) || []).length == 2) {
							if (subtitles[subtitle].t.substr(0,1) == "<" && subtitles[subtitle].t.slice(-1) == ">") {
							} else {
								subtitles[subtitle].t = subtitles[subtitle].t.replace(/<\/?[^>]+(>|$)/g, "");
							}
						} else if ((subtitles[subtitle].t.match(new RegExp("<", "g")) || []).length > 2) {
							subtitles[subtitle].t = subtitles[subtitle].t.replace(/<\/?[^>]+(>|$)/g, "");
						}
						subtitlebox.changeText = subtitles[subtitle].t;
						currentSubtitle = subtitle;
					} else if (subtitles[subtitle].o < nowSecond) {
						subtitlebox.changeText = "";
					}
				}
			}
			// End show subtitle text (external subtitles)
		 }
	}
	
	// This is where the Subtitle Items will be loaded
}
