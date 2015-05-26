import QtQuick 2.1
import QmlVlc 0.1

Rectangle {
	id: root
	anchors.top: parent.top
	anchors.topMargin: 0
	width: sleeptimerblock.width < 694 ? (sleeptimerblock.width -12) : 682
	height: 272
	color: "transparent"
	property variant sleeptimeritems: [];
	property var sleepSelected: 0;
	
	// Start Remove all Sleep Timer Options
	function clearAll() {
		var pli = 0;
		
		if (settings.totalSleepOpts > 0) for (pli = 0; pli < settings.totalSleepOpts; pli++) if (typeof sleeptimeritems[pli] !== 'undefined') {
			sleeptimeritems[pli].destroy();
			delete sleeptimeritems[pli];
		}
	
		sleeptimeritems = [];
		settings.totalSleepOpts = 0;
	}
	// End Remove all Sleep Timer Options
	
	function addSleepTimerItems(target) {
		// Remove Old Sleep Timer Menu Items
		clearAll();
	
		// Adding Sleep Timer Menu Items
		var pli = 0;

		var plstring = "Disabled";
		
		sleeptimeritems[pli] = Qt.createQmlObject('import QtQuick 2.1; import QtQuick.Layouts 1.0; import QmlVlc 0.1; Rectangle { id: slptmritem'+ pli +'; anchors.left: parent.left; anchors.top: parent.top; anchors.topMargin: 32 + ('+ pli +' *40); color: "transparent"; width: sleeptimerblock.width < 694 ? (sleeptimerblock.width -56) : 638; height: 40; MouseArea { id: sleepitem'+ pli +'; cursorShape: Qt.PointingHandCursor; hoverEnabled: true; anchors.fill: parent; onWheel: { if (wheel.angleDelta.y > 0) wjs.moveSleepTimerMenu(parseInt(sleepTimerScroll.dragger.anchors.topMargin) + (parseInt(sleepTimerScroll.dragger.height) /2) -5); if (wheel.angleDelta.y < 0) wjs.moveSleepTimerMenu(parseInt(sleepTimerScroll.dragger.anchors.topMargin) + (parseInt(sleepTimerScroll.dragger.height) /2) +5); } onClicked: { fireQmlMessage("[sleep-timer]0"); wjs.toggleSleepTimer(); wjs.setText("Sleep Timer: Disabled"); sleepSelected = '+ pli +'; } } Rectangle { width: sleeptimerblock.width < 694 ? (sleeptimerblock.width -56) : 638; clip: true; height: 40; color: sleepSelected == '+ pli +' ? sleepitem'+ pli +'.containsMouse ? "#3D3D3D" : "#e5e5e5" : sleepitem'+ pli +'.containsMouse ? "#3D3D3D" : "transparent"; Text { anchors.left: parent.left; anchors.leftMargin: 12; anchors.verticalCenter: parent.verticalCenter; text: "'+ plstring +'"; font.pointSize: 10; color: sleepSelected == '+ pli +' ? sleepitem'+ pli +'.containsMouse ? "#e5e5e5" : "#2f2f2f" : sleepitem'+ pli +'.containsMouse ? "#e5e5e5" : "#e5e5e5"; } } }', root, 'smenustr' +pli);
		pli++;

		
		var plstring = "15 min";
		
		sleeptimeritems[pli] = Qt.createQmlObject('import QtQuick 2.1; import QtQuick.Layouts 1.0; import QmlVlc 0.1; Rectangle { id: slptmritem'+ pli +'; anchors.left: parent.left; anchors.top: parent.top; anchors.topMargin: 32 + ('+ pli +' *40); color: "transparent"; width: sleeptimerblock.width < 694 ? (sleeptimerblock.width -56) : 638; height: 40; MouseArea { id: sleepitem'+ pli +'; cursorShape: Qt.PointingHandCursor; hoverEnabled: true; anchors.fill: parent; onWheel: { if (wheel.angleDelta.y > 0) wjs.moveSleepTimerMenu(parseInt(sleepTimerScroll.dragger.anchors.topMargin) + (parseInt(sleepTimerScroll.dragger.height) /2) -5); if (wheel.angleDelta.y < 0) wjs.moveSleepTimerMenu(parseInt(sleepTimerScroll.dragger.anchors.topMargin) + (parseInt(sleepTimerScroll.dragger.height) /2) +5); } onClicked: { fireQmlMessage("[sleep-timer]900000"); wjs.toggleSleepTimer(); wjs.setText("Sleep Timer: 15 min"); sleepSelected = '+ pli +'; } } Rectangle { width: sleeptimerblock.width < 694 ? (sleeptimerblock.width -56) : 638; clip: true; height: 40; color: sleepSelected == '+ pli +' ? sleepitem'+ pli +'.containsMouse ? "#3D3D3D" : "#e5e5e5" : sleepitem'+ pli +'.containsMouse ? "#3D3D3D" : "transparent"; Text { anchors.left: parent.left; anchors.leftMargin: 12; anchors.verticalCenter: parent.verticalCenter; text: "'+ plstring +'"; font.pointSize: 10; color: sleepSelected == '+ pli +' ? sleepitem'+ pli +'.containsMouse ? "#e5e5e5" : "#2f2f2f" : sleepitem'+ pli +'.containsMouse ? "#e5e5e5" : "#e5e5e5"; } } }', root, 'smenustr' +pli);
		pli++;
		

		var plstring = "30 min";
		
		sleeptimeritems[pli] = Qt.createQmlObject('import QtQuick 2.1; import QtQuick.Layouts 1.0; import QmlVlc 0.1; Rectangle { id: slptmritem'+ pli +'; anchors.left: parent.left; anchors.top: parent.top; anchors.topMargin: 32 + ('+ pli +' *40); color: "transparent"; width: sleeptimerblock.width < 694 ? (sleeptimerblock.width -56) : 638; height: 40; MouseArea { id: sleepitem'+ pli +'; cursorShape: Qt.PointingHandCursor; hoverEnabled: true; anchors.fill: parent; onWheel: { if (wheel.angleDelta.y > 0) wjs.moveSleepTimerMenu(parseInt(sleepTimerScroll.dragger.anchors.topMargin) + (parseInt(sleepTimerScroll.dragger.height) /2) -5); if (wheel.angleDelta.y < 0) wjs.moveSleepTimerMenu(parseInt(sleepTimerScroll.dragger.anchors.topMargin) + (parseInt(sleepTimerScroll.dragger.height) /2) +5); } onClicked: { fireQmlMessage("[sleep-timer]1800000"); wjs.toggleSleepTimer(); wjs.setText("Sleep Timer: 30 min"); sleepSelected = '+ pli +'; } } Rectangle { width: sleeptimerblock.width < 694 ? (sleeptimerblock.width -56) : 638; clip: true; height: 40; color: sleepSelected == '+ pli +' ? sleepitem'+ pli +'.containsMouse ? "#3D3D3D" : "#e5e5e5" : sleepitem'+ pli +'.containsMouse ? "#3D3D3D" : "transparent"; Text { anchors.left: parent.left; anchors.leftMargin: 12; anchors.verticalCenter: parent.verticalCenter; text: "'+ plstring +'"; font.pointSize: 10; color: sleepSelected == '+ pli +' ? sleepitem'+ pli +'.containsMouse ? "#e5e5e5" : "#2f2f2f" : sleepitem'+ pli +'.containsMouse ? "#e5e5e5" : "#e5e5e5"; } } }', root, 'smenustr' +pli);
		pli++;

		var plstring = "45 min";
		
		sleeptimeritems[pli] = Qt.createQmlObject('import QtQuick 2.1; import QtQuick.Layouts 1.0; import QmlVlc 0.1; Rectangle { id: slptmritem'+ pli +'; anchors.left: parent.left; anchors.top: parent.top; anchors.topMargin: 32 + ('+ pli +' *40); color: "transparent"; width: sleeptimerblock.width < 694 ? (sleeptimerblock.width -56) : 638; height: 40; MouseArea { id: sleepitem'+ pli +'; cursorShape: Qt.PointingHandCursor; hoverEnabled: true; anchors.fill: parent; onWheel: { if (wheel.angleDelta.y > 0) wjs.moveSleepTimerMenu(parseInt(sleepTimerScroll.dragger.anchors.topMargin) + (parseInt(sleepTimerScroll.dragger.height) /2) -5); if (wheel.angleDelta.y < 0) wjs.moveSleepTimerMenu(parseInt(sleepTimerScroll.dragger.anchors.topMargin) + (parseInt(sleepTimerScroll.dragger.height) /2) +5); } onClicked: { fireQmlMessage("[sleep-timer]2700000"); wjs.toggleSleepTimer(); wjs.setText("Sleep Timer: 45 min"); sleepSelected = '+ pli +'; } } Rectangle { width: sleeptimerblock.width < 694 ? (sleeptimerblock.width -56) : 638; clip: true; height: 40; color: sleepSelected == '+ pli +' ? sleepitem'+ pli +'.containsMouse ? "#3D3D3D" : "#e5e5e5" : sleepitem'+ pli +'.containsMouse ? "#3D3D3D" : "transparent"; Text { anchors.left: parent.left; anchors.leftMargin: 12; anchors.verticalCenter: parent.verticalCenter; text: "'+ plstring +'"; font.pointSize: 10; color: sleepSelected == '+ pli +' ? sleepitem'+ pli +'.containsMouse ? "#e5e5e5" : "#2f2f2f" : sleepitem'+ pli +'.containsMouse ? "#e5e5e5" : "#e5e5e5"; } } }', root, 'smenustr' +pli);
		pli++;

		var plstring = "1 hour";
		
		sleeptimeritems[pli] = Qt.createQmlObject('import QtQuick 2.1; import QtQuick.Layouts 1.0; import QmlVlc 0.1; Rectangle { id: slptmritem'+ pli +'; anchors.left: parent.left; anchors.top: parent.top; anchors.topMargin: 32 + ('+ pli +' *40); color: "transparent"; width: sleeptimerblock.width < 694 ? (sleeptimerblock.width -56) : 638; height: 40; MouseArea { id: sleepitem'+ pli +'; cursorShape: Qt.PointingHandCursor; hoverEnabled: true; anchors.fill: parent; onWheel: { if (wheel.angleDelta.y > 0) wjs.moveSleepTimerMenu(parseInt(sleepTimerScroll.dragger.anchors.topMargin) + (parseInt(sleepTimerScroll.dragger.height) /2) -5); if (wheel.angleDelta.y < 0) wjs.moveSleepTimerMenu(parseInt(sleepTimerScroll.dragger.anchors.topMargin) + (parseInt(sleepTimerScroll.dragger.height) /2) +5); } onClicked: { fireQmlMessage("[sleep-timer]3600000"); wjs.toggleSleepTimer(); wjs.setText("Sleep Timer: 1 hour"); sleepSelected = '+ pli +'; } } Rectangle { width: sleeptimerblock.width < 694 ? (sleeptimerblock.width -56) : 638; clip: true; height: 40; color: sleepSelected == '+ pli +' ? sleepitem'+ pli +'.containsMouse ? "#3D3D3D" : "#e5e5e5" : sleepitem'+ pli +'.containsMouse ? "#3D3D3D" : "transparent"; Text { anchors.left: parent.left; anchors.leftMargin: 12; anchors.verticalCenter: parent.verticalCenter; text: "'+ plstring +'"; font.pointSize: 10; color: sleepSelected == '+ pli +' ? sleepitem'+ pli +'.containsMouse ? "#e5e5e5" : "#2f2f2f" : sleepitem'+ pli +'.containsMouse ? "#e5e5e5" : "#e5e5e5"; } } }', root, 'smenustr' +pli);
		pli++;

		var plstring = "1 hour 30 min";
		
		sleeptimeritems[pli] = Qt.createQmlObject('import QtQuick 2.1; import QtQuick.Layouts 1.0; import QmlVlc 0.1; Rectangle { id: slptmritem'+ pli +'; anchors.left: parent.left; anchors.top: parent.top; anchors.topMargin: 32 + ('+ pli +' *40); color: "transparent"; width: sleeptimerblock.width < 694 ? (sleeptimerblock.width -56) : 638; height: 40; MouseArea { id: sleepitem'+ pli +'; cursorShape: Qt.PointingHandCursor; hoverEnabled: true; anchors.fill: parent; onWheel: { if (wheel.angleDelta.y > 0) wjs.moveSleepTimerMenu(parseInt(sleepTimerScroll.dragger.anchors.topMargin) + (parseInt(sleepTimerScroll.dragger.height) /2) -5); if (wheel.angleDelta.y < 0) wjs.moveSleepTimerMenu(parseInt(sleepTimerScroll.dragger.anchors.topMargin) + (parseInt(sleepTimerScroll.dragger.height) /2) +5); } onClicked: { fireQmlMessage("[sleep-timer]5400000"); wjs.toggleSleepTimer(); wjs.setText("Sleep Timer: 1 hour 30 min"); sleepSelected = '+ pli +'; } } Rectangle { width: sleeptimerblock.width < 694 ? (sleeptimerblock.width -56) : 638; clip: true; height: 40; color: sleepSelected == '+ pli +' ? sleepitem'+ pli +'.containsMouse ? "#3D3D3D" : "#e5e5e5" : sleepitem'+ pli +'.containsMouse ? "#3D3D3D" : "transparent"; Text { anchors.left: parent.left; anchors.leftMargin: 12; anchors.verticalCenter: parent.verticalCenter; text: "'+ plstring +'"; font.pointSize: 10; color: sleepSelected == '+ pli +' ? sleepitem'+ pli +'.containsMouse ? "#e5e5e5" : "#2f2f2f" : sleepitem'+ pli +'.containsMouse ? "#e5e5e5" : "#e5e5e5"; } } }', root, 'smenustr' +pli);
		pli++;


		var plstring = "2 hours";
		
		sleeptimeritems[pli] = Qt.createQmlObject('import QtQuick 2.1; import QtQuick.Layouts 1.0; import QmlVlc 0.1; Rectangle { id: slptmritem'+ pli +'; anchors.left: parent.left; anchors.top: parent.top; anchors.topMargin: 32 + ('+ pli +' *40); color: "transparent"; width: sleeptimerblock.width < 694 ? (sleeptimerblock.width -56) : 638; height: 40; MouseArea { id: sleepitem'+ pli +'; cursorShape: Qt.PointingHandCursor; hoverEnabled: true; anchors.fill: parent; onWheel: { if (wheel.angleDelta.y > 0) wjs.moveSleepTimerMenu(parseInt(sleepTimerScroll.dragger.anchors.topMargin) + (parseInt(sleepTimerScroll.dragger.height) /2) -5); if (wheel.angleDelta.y < 0) wjs.moveSleepTimerMenu(parseInt(sleepTimerScroll.dragger.anchors.topMargin) + (parseInt(sleepTimerScroll.dragger.height) /2) +5); } onClicked: { fireQmlMessage("[sleep-timer]7200000"); wjs.toggleSleepTimer(); wjs.setText("Sleep Timer: 2 hours"); sleepSelected = '+ pli +'; } } Rectangle { width: sleeptimerblock.width < 694 ? (sleeptimerblock.width -56) : 638; clip: true; height: 40; color: sleepSelected == '+ pli +' ? sleepitem'+ pli +'.containsMouse ? "#3D3D3D" : "#e5e5e5" : sleepitem'+ pli +'.containsMouse ? "#3D3D3D" : "transparent"; Text { anchors.left: parent.left; anchors.leftMargin: 12; anchors.verticalCenter: parent.verticalCenter; text: "'+ plstring +'"; font.pointSize: 10; color: sleepSelected == '+ pli +' ? sleepitem'+ pli +'.containsMouse ? "#e5e5e5" : "#2f2f2f" : sleepitem'+ pli +'.containsMouse ? "#e5e5e5" : "#e5e5e5"; } } }', root, 'smenustr' +pli);
		pli++;

		
		settings.totalSleepOpts = pli;
		// End Adding Sleep Timer Menu Items
	}
		
	// This is where the Sleep Timer Options will be loaded
}
