import QtQuick 2.1
import QmlVlc 0.1

Rectangle {
	id: root
	anchors.top: parent.top
	anchors.topMargin: 0
	width: settingsblock.width < 694 ? (settingsblock.width -12) : 682
	height: 272
	color: "transparent"
	property variant settingsetitems: [];
	
	// Start Remove all Settings
	function clearAll() {
		var pli = 0;
		
		if (settings.totalSettings > 0) for (pli = 0; pli < settings.totalSettings; pli++) if (typeof settingsetitems[pli] !== 'undefined') {
			settingsetitems[pli].destroy();
			delete settingsetitems[pli];
		}
	
		settingsetitems = [];
		settings.totalSettings = 0;
	}
	// End Remove all Settings
	
	function addSettingsItems(target) {
		// Remove Old Setting Menu Items
		clearAll();
	
		// Adding Setting Menu Items
		var pli = 0;
		
		if (torDataBut == 1) {
			var plstring = "Torrent Data";
			
			settingsetitems[pli] = Qt.createQmlObject('import QtQuick 2.1; import QtQuick.Layouts 1.0; import QmlVlc 0.1; Rectangle { id: settitem'+ pli +'; anchors.left: parent.left; anchors.top: parent.top; anchors.topMargin: 32 + ('+ pli +' *40); color: "transparent"; width: settingsblock.width < 694 ? (settingsblock.width -56) : 638; height: 40; MouseArea { id: setitem'+ pli +'; cursorShape: Qt.PointingHandCursor; hoverEnabled: true; anchors.fill: parent; onWheel: { if (wheel.angleDelta.y > 0) wjs.moveSettingsMenu(parseInt(settingsScroll.dragger.anchors.topMargin) + (parseInt(settingsScroll.dragger.height) /2) -5); if (wheel.angleDelta.y < 0) wjs.moveSettingsMenu(parseInt(settingsScroll.dragger.anchors.topMargin) + (parseInt(settingsScroll.dragger.height) /2) +5); } onClicked: { wjs.toggleSettings(); fireQmlMessage("[torrent-data]"); if (vlcPlayer.playing) vlcPlayer.togglePause(); } } Rectangle { width: settingsblock.width < 694 ? (settingsblock.width -56) : 638; clip: true; height: 40; color: setitem'+ pli +'.containsMouse ? "#3D3D3D" : "transparent"; Text { anchors.left: parent.left; anchors.leftMargin: 12; anchors.verticalCenter: parent.verticalCenter; text: "'+ plstring +'"; font.pointSize: 10; color: "#e5e5e5"; } } }', root, 'smenustr' +pli);
			pli++;
		}

		var plstring = "Download Folder";
		
		settingsetitems[pli] = Qt.createQmlObject('import QtQuick 2.1; import QtQuick.Layouts 1.0; import QmlVlc 0.1; Rectangle { id: settitem'+ pli +'; anchors.left: parent.left; anchors.top: parent.top; anchors.topMargin: 32 + ('+ pli +' *40); color: "transparent"; width: settingsblock.width < 694 ? (settingsblock.width -56) : 638; height: 40; MouseArea { id: setitem'+ pli +'; cursorShape: Qt.PointingHandCursor; hoverEnabled: true; anchors.fill: parent; onWheel: { if (wheel.angleDelta.y > 0) wjs.moveSettingsMenu(parseInt(settingsScroll.dragger.anchors.topMargin) + (parseInt(settingsScroll.dragger.height) /2) -5); if (wheel.angleDelta.y < 0) wjs.moveSettingsMenu(parseInt(settingsScroll.dragger.anchors.topMargin) + (parseInt(settingsScroll.dragger.height) /2) +5); } onClicked: { fireQmlMessage("[select-download-folder]"); } } Rectangle { width: settingsblock.width < 694 ? (settingsblock.width -56) : 638; clip: true; height: 40; color: setitem'+ pli +'.containsMouse ? "#3D3D3D" : "transparent"; Text { anchors.left: parent.left; anchors.leftMargin: 12; anchors.verticalCenter: parent.verticalCenter; text: "'+ plstring +'"; font.pointSize: 10; color: "#e5e5e5"; } } }', root, 'smenustr' +pli);
		pli++;
		
		var plstring = "Library Folder";
		
		settingsetitems[pli] = Qt.createQmlObject('import QtQuick 2.1; import QtQuick.Layouts 1.0; import QmlVlc 0.1; Rectangle { id: settitem'+ pli +'; anchors.left: parent.left; anchors.top: parent.top; anchors.topMargin: 32 + ('+ pli +' *40); color: "transparent"; width: settingsblock.width < 694 ? (settingsblock.width -56) : 638; height: 40; MouseArea { id: setitem'+ pli +'; cursorShape: Qt.PointingHandCursor; hoverEnabled: true; anchors.fill: parent; onWheel: { if (wheel.angleDelta.y > 0) wjs.moveSettingsMenu(parseInt(settingsScroll.dragger.anchors.topMargin) + (parseInt(settingsScroll.dragger.height) /2) -5); if (wheel.angleDelta.y < 0) wjs.moveSettingsMenu(parseInt(settingsScroll.dragger.anchors.topMargin) + (parseInt(settingsScroll.dragger.height) /2) +5); } onClicked: { fireQmlMessage("[select-library]"); } } Rectangle { width: settingsblock.width < 694 ? (settingsblock.width -56) : 638; clip: true; height: 40; color: setitem'+ pli +'.containsMouse ? "#3D3D3D" : "transparent"; Text { anchors.left: parent.left; anchors.leftMargin: 12; anchors.verticalCenter: parent.verticalCenter; text: "'+ plstring +'"; font.pointSize: 10; color: "#e5e5e5"; } } }', root, 'smenustr' +pli);
		pli++;
		
		var plstring = "Sleep Timer";
		
		settingsetitems[pli] = Qt.createQmlObject('import QtQuick 2.1; import QtQuick.Layouts 1.0; import QmlVlc 0.1; Rectangle { id: settitem'+ pli +'; anchors.left: parent.left; anchors.top: parent.top; anchors.topMargin: 32 + ('+ pli +' *40); color: "transparent"; width: settingsblock.width < 694 ? (settingsblock.width -56) : 638; height: 40; MouseArea { id: setitem'+ pli +'; cursorShape: Qt.PointingHandCursor; hoverEnabled: true; anchors.fill: parent; onWheel: { if (wheel.angleDelta.y > 0) wjs.moveSettingsMenu(parseInt(settingsScroll.dragger.anchors.topMargin) + (parseInt(settingsScroll.dragger.height) /2) -5); if (wheel.angleDelta.y < 0) wjs.moveSettingsMenu(parseInt(settingsScroll.dragger.anchors.topMargin) + (parseInt(settingsScroll.dragger.height) /2) +5); } onClicked: { wjs.toggleSleepTimer(); } } Rectangle { width: settingsblock.width < 694 ? (settingsblock.width -56) : 638; clip: true; height: 40; color: setitem'+ pli +'.containsMouse ? "#3D3D3D" : "transparent"; Text { anchors.left: parent.left; anchors.leftMargin: 12; anchors.verticalCenter: parent.verticalCenter; text: "'+ plstring +'"; font.pointSize: 10; color: "#e5e5e5"; } } }', root, 'smenustr' +pli);
		pli++;

		var plstring = "Back to Main Menu";
		
		settingsetitems[pli] = Qt.createQmlObject('import QtQuick 2.1; import QtQuick.Layouts 1.0; import QmlVlc 0.1; Rectangle { id: settitem'+ pli +'; anchors.left: parent.left; anchors.top: parent.top; anchors.topMargin: 32 + ('+ pli +' *40); color: "transparent"; width: settingsblock.width < 694 ? (settingsblock.width -56) : 638; height: 40; MouseArea { id: setitem'+ pli +'; cursorShape: Qt.PointingHandCursor; hoverEnabled: true; anchors.fill: parent; onWheel: { if (wheel.angleDelta.y > 0) wjs.moveSettingsMenu(parseInt(settingsScroll.dragger.anchors.topMargin) + (parseInt(settingsScroll.dragger.height) /2) -5); if (wheel.angleDelta.y < 0) wjs.moveSettingsMenu(parseInt(settingsScroll.dragger.anchors.topMargin) + (parseInt(settingsScroll.dragger.height) /2) +5); } onClicked: { wjs.toggleSettings(); wjs.goBack(); } } Rectangle { width: settingsblock.width < 694 ? (settingsblock.width -56) : 638; clip: true; height: 40; color: setitem'+ pli +'.containsMouse ? "#3D3D3D" : "transparent"; Text { anchors.left: parent.left; anchors.leftMargin: 12; anchors.verticalCenter: parent.verticalCenter; text: "'+ plstring +'"; font.pointSize: 10; color: "#e5e5e5"; } } }', root, 'smenustr' +pli);
		pli++;

		var plstring = "Close Powder";
		
		settingsetitems[pli] = Qt.createQmlObject('import QtQuick 2.1; import QtQuick.Layouts 1.0; import QmlVlc 0.1; Rectangle { id: settitem'+ pli +'; anchors.left: parent.left; anchors.top: parent.top; anchors.topMargin: 32 + ('+ pli +' *40); color: "transparent"; width: settingsblock.width < 694 ? (settingsblock.width -56) : 638; height: 40; MouseArea { id: setitem'+ pli +'; cursorShape: Qt.PointingHandCursor; hoverEnabled: true; anchors.fill: parent; onWheel: { if (wheel.angleDelta.y > 0) wjs.moveSettingsMenu(parseInt(settingsScroll.dragger.anchors.topMargin) + (parseInt(settingsScroll.dragger.height) /2) -5); if (wheel.angleDelta.y < 0) wjs.moveSettingsMenu(parseInt(settingsScroll.dragger.anchors.topMargin) + (parseInt(settingsScroll.dragger.height) /2) +5); } onClicked: { wjs.toggleSettings(); fireQmlMessage("[quit]"); } } Rectangle { width: settingsblock.width < 694 ? (settingsblock.width -56) : 638; clip: true; height: 40; color: setitem'+ pli +'.containsMouse ? "#3D3D3D" : "transparent"; Text { anchors.left: parent.left; anchors.leftMargin: 12; anchors.verticalCenter: parent.verticalCenter; text: "'+ plstring +'"; font.pointSize: 10; color: "#e5e5e5"; } } }', root, 'smenustr' +pli);
		pli++;
		
		settings.totalSettings = pli;
		// End Adding Setting Menu Items
	}
		
	// This is where the Setting Items will be loaded
}
