import QtQuick 2.1
import QmlVlc 0.1

Rectangle {
	id: root
	anchors.top: parent.top
	anchors.topMargin: 0
	width: managefoldersblock.width < 694 ? (managefoldersblock.width -12) : 682
	height: 272
	color: "transparent"
	property variant managefoldersitems: [];
	
	// Start Remove all Manage Folders Options
	function clearAll() {
		var pli = 0;
		
		if (settings.totalManDirOpts > 0) for (pli = 0; pli < settings.totalManDirOpts; pli++) if (typeof managefoldersitems[pli] !== 'undefined') {
			managefoldersitems[pli].destroy();
			delete managefoldersitems[pli];
		}
	
		managefoldersitems = [];
		settings.totalManDirOpts = 0;
	}
	// End Remove all Manage Folders Options
	
	function addManageFoldersItems(target) {
		// Remove Old Manage Folders Menu Items
		clearAll();
	
		// Adding Manage Folders Menu Items
		var pli = 0;


		var plstring = "Download Folder";
		
		managefoldersitems[pli] = Qt.createQmlObject('import QtQuick 2.1; import QtQuick.Layouts 1.0; import QmlVlc 0.1; Rectangle { id: settitem'+ pli +'; anchors.left: parent.left; anchors.top: parent.top; anchors.topMargin: 32 + ('+ pli +' *40); color: "transparent"; width: managefoldersblock.width < 694 ? (managefoldersblock.width -56) : 638; height: 40; MouseArea { id: setitem'+ pli +'; cursorShape: Qt.PointingHandCursor; hoverEnabled: true; anchors.fill: parent; onWheel: { if (wheel.angleDelta.y > 0) wjs.moveManageFoldersMenu(parseInt(manageFoldersScroll.dragger.anchors.topMargin) + (parseInt(manageFoldersScrolldragger.height) /2) -5); if (wheel.angleDelta.y < 0) wjs.moveManageFoldersMenu(parseInt(manageFoldersScrolldragger.anchors.topMargin) + (parseInt(manageFoldersScrolldragger.height) /2) +5); } onClicked: { fireQmlMessage("[select-download-folder]"); } } Rectangle { width: managefoldersblock.width < 694 ? (managefoldersblock.width -56) : 638; clip: true; height: 40; color: setitem'+ pli +'.containsMouse ? "#3D3D3D" : "transparent"; Text { anchors.left: parent.left; anchors.leftMargin: 12; anchors.verticalCenter: parent.verticalCenter; text: "'+ plstring +'"; font.pointSize: 10; color: "#e5e5e5"; } } }', root, 'smenustr' +pli);
		pli++;
		
		var plstring = "Library Folder";
		
		managefoldersitems[pli] = Qt.createQmlObject('import QtQuick 2.1; import QtQuick.Layouts 1.0; import QmlVlc 0.1; Rectangle { id: settitem'+ pli +'; anchors.left: parent.left; anchors.top: parent.top; anchors.topMargin: 32 + ('+ pli +' *40); color: "transparent"; width: managefoldersblock.width < 694 ? (managefoldersblock.width -56) : 638; height: 40; MouseArea { id: setitem'+ pli +'; cursorShape: Qt.PointingHandCursor; hoverEnabled: true; anchors.fill: parent; onWheel: { if (wheel.angleDelta.y > 0) wjs.moveManageFoldersMenu(parseInt(manageFoldersScrolldragger.anchors.topMargin) + (parseInt(manageFoldersScrolldragger.height) /2) -5); if (wheel.angleDelta.y < 0) wjs.moveManageFoldersMenu(parseInt(manageFoldersScrolldragger.anchors.topMargin) + (parseInt(manageFoldersScrolldragger.height) /2) +5); } onClicked: { fireQmlMessage("[select-library]"); } } Rectangle { width: managefoldersblock.width < 694 ? (managefoldersblock.width -56) : 638; clip: true; height: 40; color: setitem'+ pli +'.containsMouse ? "#3D3D3D" : "transparent"; Text { anchors.left: parent.left; anchors.leftMargin: 12; anchors.verticalCenter: parent.verticalCenter; text: "'+ plstring +'"; font.pointSize: 10; color: "#e5e5e5"; } } }', root, 'smenustr' +pli);
		pli++;

		settings.totalManDirOpts = pli;
		// End Adding Manage Folders Menu Items
	}
		
	// This is where the Manage Folders Options will be loaded
}
