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
	
	property var alternative: "none";
	property var lastSub: "none";
	
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
					
	// Load External Subtitles
	function playSubtitles(subtitleElement) {
		if (subtitleElement.indexOf("[-alt-]") > -1) {
			alternative = "http://dl.opensubtitles.org/en/download/subencoding-"+subtitleElement.split('[-alt-]')[1]+"/file/"+subtitleElement.split('[-alt-]')[0].split('/').pop();
			lastSub = subtitleElement.split('[-alt-]')[0];
			vlcPlayer.subtitle.load(lastSub);
		} else {
			alternative = "none";
			lastSub = subtitleElement;
			vlcPlayer.subtitle.load(lastSub);
		}
//		wjs.setText(lastSub);
	}
	// End Load External Subtitles
	
	// External Subtitle Error Handler
	function subtitleError() {
		if (alternative == "none") {
			if (lastSub.indexOf("http://dl.opensubtitles.org/en/download/subencoding-") > -1) {
				lastSub = "http://dl.opensubtitles.org/en/download/file/"+lastSub.split('/').pop();
				vlcPlayer.subtitle.load(lastSub);
//				wjs.setText(lastSub);
			} else {
				if (supressSubError == 1) {
					supressSubError = 0;
				} else {
					wjs.setText("Subtitle Error");
				}
			}
		} else {
			lastSub = alternative;
			alternative = "none";
			vlcPlayer.subtitle.load(lastSub);
//			wjs.setText(lastSub);
		}
	}
	// End External Subtitle Error Handler

	
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
	
	// Start Clear External Subtitles (SRT, SUB)
	function clearSubtitles() {
		subtitlebox.changeText = "";
		currentSubtitle = -2;
		subtitles = [];
	}
	// End Clear External Subtitles (SRT, SUB)

	function addSubtitleItems(target) {
		// Remove Old Subtitle Menu Items
		clearAll();
	
		// Adding Subtitle Menu Items
		var plstring = "None";
		var pli = 0;
		
		subItems[pli] = Qt.createQmlObject('import QtQuick 2.1; import QtQuick.Layouts 1.0; import QmlVlc 0.1; Rectangle { id: dstitem'+ pli +'; anchors.left: parent.left; anchors.top: parent.top; anchors.topMargin: 32 + ('+ pli +' *40); color: "transparent"; width: subMenublock.width < 694 ? (subMenublock.width -56) : 638; height: 40; MouseArea { id: sitem'+ pli +'; cursorShape: Qt.PointingHandCursor; hoverEnabled: true; anchors.fill: parent; onClicked: { toggleSubtitles(); clearSubtitles(); subPlaying = '+ pli +'; wjs.setText("Subtitle Unloaded"); vlcPlayer.subtitle.track = 0; fireQmlMessage("[save-sub]'+plstring+'"); savedSub = "'+plstring+'"; } } Rectangle { width: subMenublock.width < 694 ? (subMenublock.width -56) : 638; clip: true; height: 40; color: vlcPlayer.state == 1 ? subPlaying == '+ pli +' ? sitem'+ pli +'.containsMouse ? "#3D3D3D" : "#e5e5e5" : sitem'+ pli +'.containsMouse ? "#3D3D3D" : "transparent" : subPlaying == '+ pli +' ? sitem'+ pli +'.containsMouse ? "#3D3D3D" : "#e5e5e5" : sitem'+ pli +'.containsMouse ? "#3D3D3D" : "transparent"; Text { anchors.left: parent.left; anchors.leftMargin: 12; anchors.verticalCenter: parent.verticalCenter; text: "'+ plstring +'"; font.pointSize: 10; color: vlcPlayer.state == 1 ? subPlaying == '+ pli +' ? sitem'+ pli +'.containsMouse ? "#e5e5e5" : "#2f2f2f" : sitem'+ pli +'.containsMouse ? "#e5e5e5" : "#e5e5e5" : subPlaying == '+ pli +' ? sitem'+ pli +'.containsMouse ? "#e5e5e5" : "#2f2f2f" : sitem'+ pli +'.containsMouse ? "#e5e5e5" : "#e5e5e5"; } } }', root, 'smenustr' +pli);
		pli++;
		
		var jli = 1;
		if (vlcPlayer.subtitle.count > 1) while (jli < vlcPlayer.subtitle.count) {
//			if (vlcPlayer.subtitle.track == pli) subPlaying = pli;
			var showThisSub = true;
			if (vlcPlayer.subtitle.description(jli).indexOf("Track ") > -1) {
				if (vlcPlayer.subtitle.description(jli).replace("Track ","").indexOf(" ") == -1) {
					if (isNaN(parseInt(vlcPlayer.subtitle.description(jli).replace("Track ",""))) === false) {
						showThisSub = false;
					}
				}
			}
			if (showThisSub === true) {
				subItems[pli] = Qt.createQmlObject('import QtQuick 2.1; import QtQuick.Layouts 1.0; import QmlVlc 0.1; Rectangle { id: dstitem'+ pli +'; anchors.left: parent.left; anchors.top: parent.top; anchors.topMargin: 32 + ('+ pli +' *40); color: "transparent"; width: subMenublock.width < 694 ? (subMenublock.width -56) : 638; height: 40; MouseArea { id: sitem'+ pli +'; cursorShape: Qt.PointingHandCursor; hoverEnabled: true; anchors.fill: parent; onClicked: { toggleSubtitles(); clearSubtitles(); subPlaying = '+ pli +'; wjs.setText("Subtitle: '+ vlcPlayer.subtitle.description(jli) +'"); vlcPlayer.subtitle.track = '+ jli +'; } } Rectangle { width: subMenublock.width < 694 ? (subMenublock.width -56) : 638; clip: true; height: 40; color: vlcPlayer.state == 1 ? subPlaying == '+ pli +' ? sitem'+ pli +'.containsMouse ? "#3D3D3D" : "#e5e5e5" : sitem'+ pli +'.containsMouse ? "#3D3D3D" : "transparent" : subPlaying == '+ pli +' ? sitem'+ pli +'.containsMouse ? "#3D3D3D" : "#e5e5e5" : sitem'+ pli +'.containsMouse ? "#3D3D3D" : "transparent"; Text { anchors.left: parent.left; anchors.leftMargin: 12; anchors.verticalCenter: parent.verticalCenter; text: "'+ vlcPlayer.subtitle.description(jli) +'"; font.pointSize: 10; color: vlcPlayer.state == 1 ? subPlaying == '+ pli +' ? sitem'+ pli +'.containsMouse ? "#e5e5e5" : "#2f2f2f" : sitem'+ pli +'.containsMouse ? "#e5e5e5" : "#e5e5e5" : subPlaying == '+ pli +' ? sitem'+ pli +'.containsMouse ? "#e5e5e5" : "#2f2f2f" : sitem'+ pli +'.containsMouse ? "#e5e5e5" : "#e5e5e5"; } } }', root, 'smenustr' +pli);
				pli++;
			}
			jli++;
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
			
 			subItems[pli] = Qt.createQmlObject('import QtQuick 2.1; import QtQuick.Layouts 1.0; import QmlVlc 0.1; Rectangle { id: dstitem'+ pli +'; anchors.left: parent.left; anchors.top: parent.top; anchors.topMargin: 32 + ('+ pli +' *40); color: "transparent"; width: subMenublock.width < 694 ? (subMenublock.width -56) : 638; height: 40; MouseArea { id: sitem'+ pli +'; cursorShape: Qt.PointingHandCursor; hoverEnabled: true; anchors.fill: parent; onClicked: { toggleSubtitles(); playSubtitles("'+ slink +'"); wjs.setText("Subtitle: '+ plstring +'"); subPlaying = '+ pli +'; vlcPlayer.subtitle.track = 0; fireQmlMessage("[save-sub]'+plstring+'"); savedSub = "'+tempSub+'"; } } Rectangle { width: subMenublock.width < 694 ? (subMenublock.width -56) : 638; clip: true; height: 40; color: vlcPlayer.state == 1 ? subPlaying == '+ pli +' ? sitem'+ pli +'.containsMouse ? "#3D3D3D" : "#e5e5e5" : sitem'+ pli +'.containsMouse ? "#3D3D3D" : "transparent" : subPlaying == '+ pli +' ? sitem'+ pli +'.containsMouse ? "#3D3D3D" : "#e5e5e5" : sitem'+ pli +'.containsMouse ? "#3D3D3D" : "transparent"; Text { anchors.left: parent.left; anchors.leftMargin: 12; anchors.verticalCenter: parent.verticalCenter; text: "'+ plstring +'"; font.pointSize: 10; color: vlcPlayer.state == 1 ? subPlaying == '+ pli +' ? sitem'+ pli +'.containsMouse ? "#e5e5e5" : "#2f2f2f" : sitem'+ pli +'.containsMouse ? "#e5e5e5" : "#e5e5e5" : subPlaying == '+ pli +' ? sitem'+ pli +'.containsMouse ? "#e5e5e5" : "#2f2f2f" : sitem'+ pli +'.containsMouse ? "#e5e5e5" : "#e5e5e5"; } } }', root, 'smenustr' +pli);
			pli++
		}

		settings.totalSubs = pli;
		// End Adding Subtitle Menu Items
	}
		
	// This is where the Subtitle Items will be loaded
}
