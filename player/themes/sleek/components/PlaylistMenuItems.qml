import QtQuick 2.1
import QmlVlc 0.1

Rectangle {
	id: root
	anchors.top: parent.top
	anchors.topMargin: 0
	width: playlistblock.width < 694 ? (playlistblock.width -12) : 682
	height: 200
	color: "transparent"
	property var totalPlay: 0;
	property variant vplItems: [];
	
	function disableItem(pli) {
		vlcPlayer.playlist.items[pli].disabled = true;
		disables[pli] = true;
		disables = disables;
	}
	
	function refreshDisabled() {
		for (var jkl = 0; typeof vlcPlayer.playlist.items[jkl] !== 'undefined'; jkl++) {
			if (vlcPlayer.playlist.items[jkl].disabled === true) {
				disables[jkl] = true;
			} else {
				delete disables[jkl];
			}
		}
		if (jkl < disables.length) {
			for (var mkl = jkl; mkl < disables.length; mkl++) {
				if (typeof disables[mkl] !== 'undefined') {
					delete disables[mkl];
				}
			}
		}
		disables = disables;
	}

	function setYoutubeTitle(xhr,pli) {
		return function() {
			if (xhr.readyState == 4) {
				var plstring = xhr.responseText;
				plstring = plstring.substr(plstring.indexOf('"title":"')+9);
				plstring = plstring.substr(0,plstring.indexOf('"'));
		
				vlcPlayer.playlist.items[pli].title = "[custom]"+plstring;
								
				addPlaylistItems();
			}
		};
	}
	
	// Start Remove all Playlist Menu Items
	function clearAll() {
		var pli = 0;
		while (typeof vplItems[pli] !== 'undefined') {
			vplItems[pli].destroy(1);
			delete vplItems[pli];
			pli++;
		}
	
		vplItems = [];
		totalPlay = 0;
	}
	// End Remove all Playlist Menu Items
	
	function addPlaylistItems() {
		// Remove Old Playlist Menu Items
		clearAll();
	
		// Adding Playlist Menu Items
		var pli = 0;
		for (pli = 0; pli < vlcPlayer.playlist.itemCount; pli++) {
			if (vlcPlayer.playlist.items[pli].title.indexOf("[custom]") == -1) {
				var plstring = vlcPlayer.playlist.items[pli].title;
				if (plstring.indexOf("http://") == 0) {
					// extract filename from url
					var tempPlstring = plstring.substring(plstring.lastIndexOf('/')+1);
					if (tempPlstring.length > 3) plstring = tempPlstring;
					delete tempPlstring;
				}
				if (plstring.indexOf(".") > -1) {
					// remove extension
					var tempPlstring = plstring.replace("."+plstring.split('.').pop(),"");
					if (tempPlstring.length > 3) plstring = tempPlstring;
					delete tempPlstring;
				}
				plstring = unescape(plstring);
				plstring = plstring.split('_').join(' ');
				plstring = plstring.split('.').join(' ');
				plstring = plstring.split('  ').join(' ');
				plstring = plstring.split('  ').join(' ');
				plstring = plstring.split('  ').join(' ');
				
				// capitalize first letter
				plstring = plstring.charAt(0).toUpperCase() + plstring.slice(1);
	
				if (plstring != vlcPlayer.playlist.items[pli].title) vlcPlayer.playlist.items[pli].title = "[custom]"+plstring;
			} else {
				var plstring = vlcPlayer.playlist.items[pli].title.replace("[custom]","");
			}
			
			if (plstring.indexOf("youtube.com") > 0) {
				var youtubeID =	plstring.substr(plstring.lastIndexOf("/")+1).replace("watch?v=","");
				if (youtubeID.indexOf("&") > 0) youtubeID =	youtubeID.substr(0,youtubeID.IndexOf("&"));
				var xhr = new XMLHttpRequest;
				xhr.onreadystatechange = setYoutubeTitle(xhr,pli);
				xhr.open("get", 'http://gdata.youtube.com/feeds/api/videos/'+youtubeID+'?v=2&alt=jsonc', true);
				xhr.send();
			} else {
		
				if (plstring.indexOf("/") > 0) {
					plstring = unescape(plstring);
					plstring = plstring.substr(plstring.lastIndexOf("/")+1);
				}
				if (plstring.split('.').pop().length == 3) {
					plstring = plstring.slice(0, -4);
					vlcPlayer.playlist.items[pli].title = "[custom]"+plstring;
				}
				if (plstring.length > 85) plstring = plstring.substr(0,85) +'...';
		
				vplItems[pli] = Qt.createQmlObject('import QtQuick 2.1; import QtQuick.Layouts 1.0; import QmlVlc 0.1; Rectangle { property var dragit: 0; property var mouseit: 0; id: itemBlock'+ pli +'; opacity: disables['+ pli +'] === true ? 0.5 : 1; anchors.left: parent.left; anchors.top: parent.top; anchors.topMargin: 32 + ('+ pli +' *40); color: "transparent"; width: playlistblock.width < 694 ? (playlistblock.width -56) : 638; height: 40; MouseArea { id: pitem'+ pli +'; cursorShape: dragit == 1 ? Qt.ClosedHandCursor : Qt.PointingHandCursor; hoverEnabled: true; anchors.fill: parent; onWheel: { openHand.opacity = 0; if (wheel.angleDelta.y > 0) wjs.movePlaylist(parseInt(playlistScroll.dragger.anchors.topMargin) + (parseInt(playlistScroll.dragger.height) /2) -5); if (wheel.angleDelta.y < 0) wjs.movePlaylist(parseInt(playlistScroll.dragger.anchors.topMargin) + (parseInt(playlistScroll.dragger.height) /2) +5); } onClicked: { vlcPlayer.playlist.playItem('+ pli +'); vlcPlayer.playlist.items['+ pli +'].disabled = false; delete disables['+ pli +']; disables = disables; } onPressAndHold: { dragit = 1; mouseit = mouse.y; itemBlock'+ pli +'.z = 100; itemBlock'+ pli +'.opacity = 0.7; itemShadow.anchors.topMargin = 32 + ('+ pli +' *40); itemShadow.visible = true } onPositionChanged: { if (dragit == 1) { itemBlock'+ pli +'.anchors.topMargin = itemBlock'+ pli +'.anchors.topMargin + mouse.y -mouseit; } } onReleased: { if (dragit == 1) { dragit = 0; var newid = Math.floor((itemBlock'+ pli +'.anchors.topMargin + mouse.y -32) / 40); if (newid > '+ pli +') { if (newid > vlcPlayer.playlist.itemCount -1) { var newcount = vlcPlayer.playlist.itemCount -1 - '+ pli +'; } else { var newcount = newid - '+ pli +'; } } else { if (newid < 0) { var newcount = '+ pli +' * (-1); } else { var newcount = ('+ pli +' - newid) * (-1); } } fireQmlMessage("[playlist-swap]'+pli+':"+newcount); vlcPlayer.playlist.advanceItem('+ pli +',newcount); itemBlock'+ pli +'.z = 1; itemBlock'+ pli +'.opacity = 1; itemBlock'+ pli +'.parent.addPlaylistItems(); itemBlock'+ pli +'.parent.refreshDisabled(); } itemShadow.visible = false } } Rectangle { id: backHover'+ pli +'; width: playlistblock.width < 694 ? (playlistblock.width -56) : 638; clip: true; height: 40; color: vlcPlayer.state == 1 ? vlcPlayer.playlist.currentItem == '+ pli +' ? pitem'+ pli +'.containsMouse || dragitem'+ pli +'.containsMouse ? "#3D3D3D" : "#e5e5e5" : pitem'+ pli +'.containsMouse || dragitem'+ pli +'.containsMouse ? "#3D3D3D" : "transparent" : vlcPlayer.playlist.currentItem == '+ pli +' ? pitem'+ pli +'.containsMouse || dragitem'+ pli +'.containsMouse ? "#3D3D3D" : "#e5e5e5" : pitem'+ pli +'.containsMouse || dragitem'+ pli +'.containsMouse ? "#3D3D3D" : "transparent"; Text { anchors.left: parent.left; anchors.leftMargin: 42; anchors.verticalCenter: parent.verticalCenter; text: "'+ plstring +'"; font.pointSize: 10; color: vlcPlayer.state == 1 ? vlcPlayer.playlist.currentItem == '+ pli +' ? pitem'+ pli +'.containsMouse || dragitem'+ pli +'.containsMouse ? "#e5e5e5" : "#2f2f2f" : pitem'+ pli +'.containsMouse || dragitem'+ pli +'.containsMouse ? "#e5e5e5" : "#e5e5e5" : vlcPlayer.playlist.currentItem == '+ pli +' ? pitem'+ pli +'.containsMouse || dragitem'+ pli +'.containsMouse ? "#e5e5e5" : "#2f2f2f" : pitem'+ pli +'.containsMouse || dragitem'+ pli +'.containsMouse ? "#e5e5e5" : "#e5e5e5"; } } Rectangle { anchors.left: parent.left; anchors.verticalCenter: parent.verticalCenter; width:40; height: 40; color: "transparent"; Image { id: dragimg'+ pli +'; source: "../../../images/dragger.png"; anchors.left: parent.left; anchors.leftMargin: 3; anchors.verticalCenter: parent.verticalCenter; opacity: pitem'+ pli +'.containsMouse ? 1 : dragitem'+ pli +'.containsMouse ? 1 : 0 } MouseArea { id: dragitem'+ pli +'; anchors.fill: parent; cursorShape: dragit == 1 ? Qt.ClosedHandCursor : Qt.BlankCursor; hoverEnabled: true; onPressAndHold: { dragit = 1; openHand.opacity = 0; mouseit = mouse.y; itemBlock'+ pli +'.z = 100; itemBlock'+ pli +'.opacity = 0.7; itemShadow.anchors.topMargin = 32 + ('+ pli +' *40); itemShadow.visible = true } onReleased: { if (dragit == 1) { dragit = 0; var newid = Math.floor((itemBlock'+ pli +'.anchors.topMargin + mouse.y -32) / 40); if (newid > '+ pli +') { if (newid > vlcPlayer.playlist.itemCount -1) { var newcount = vlcPlayer.playlist.itemCount -1 - '+ pli +'; } else { var newcount = newid - '+ pli +'; } } else { if (newid < 0) { var newcount = '+ pli +' * (-1); } else { var newcount = ('+ pli +' - newid) * (-1); } } fireQmlMessage("[playlist-swap]'+pli+':"+newcount); vlcPlayer.playlist.advanceItem('+ pli +',newcount); itemBlock'+ pli +'.z = 1; itemBlock'+ pli +'.opacity = 1; itemBlock'+ pli +'.parent.addPlaylistItems(); itemBlock'+ pli +'.parent.refreshDisabled(); } itemShadow.visible = false } onPositionChanged: { if (dragit == 1) { openHand.opacity = 0; itemBlock'+ pli +'.anchors.topMargin = itemBlock'+ pli +'.anchors.topMargin + mouse.y -mouseit; } else { if (mouse.x > 40) { openHand.opacity = 0 } else { openHand.anchors.topMargin = mouse.y -4; openHand.anchors.leftMargin = mouse.x -8; openHand.opacity = 1 } } } onEntered: { openHand.anchors.top = itemBlock'+ pli +'.top; openHand.anchors.left = itemBlock'+ pli +'.left; openHand.anchors.topMargin = dragitem'+ pli +'.mouseY -4; openHand.anchors.leftMargin = dragitem'+ pli +'.mouseX -8; openHand.opacity = 1 } onExited: { openHand.opacity = 0 } onWheel: { openHand.opacity = 0; if (wheel.angleDelta.y > 0) wjs.movePlaylist(parseInt(playlistScroll.dragger.anchors.topMargin) + (parseInt(playlistScroll.dragger.height) /2) -5); if (wheel.angleDelta.y < 0) wjs.movePlaylist(parseInt(playlistScroll.dragger.anchors.topMargin) + (parseInt(playlistScroll.dragger.height) /2) +5); } onClicked: { if (vlcPlayer.playlist.items['+ pli +'].disabled) { vlcPlayer.playlist.items['+ pli +'].disabled = false; delete disables['+ pli +']; disables = disables; } else { vlcPlayer.playlist.items['+ pli +'].disabled = true; disables['+ pli +'] = true; disables = disables; } } } Rectangle { anchors.verticalCenter: parent.verticalCenter; anchors.left: parent.left; anchors.leftMargin: 17; width: 14; height: 14; radius: width /2; color: "#131313"; Rectangle { id: plDot'+ pli +'; opacity: disables['+ pli +'] === true ? 0 : 1; anchors.verticalCenter: parent.verticalCenter; anchors.horizontalCenter: parent.horizontalCenter; width: 8; height: 8; radius: width /2; color: backHover'+ pli +'.color == "#e5e5e5" ? "#e5e5e5" : "#696969" } } } }', root, 'plmenustr' +pli);

			}
		}
		// End Adding Playlist Menu Items
		totalPlay = pli;
	}
	Rectangle {
		id: itemShadow
		color: "#000000"
		anchors.top: parent.top
		anchors.left: parent.left
		width: playlistblock.width < 694 ? (playlistblock.width -56) : 638
		height: 40
		z: 99
		opacity: 0.2
		visible: false
	}
	// hack for wrong open hand cursor (qt 5.4 bug)
	Image {
		id: openHand
		visible: platform == "OSX" ? false : true
		source: "../../../images/cursor-openhand.png"
		z: 101
		opacity: 0
	}
	// end hack for wrong open hand cursor (qt 5.4 bug)
	// This is where the Playlist Items will be loaded
}
