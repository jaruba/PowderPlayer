import QtQuick 2.1
import QmlVlc 0.1

Rectangle {	
	id: root
	anchors.top: parent.top
	anchors.topMargin: 0
	anchors.left: parent.left
	anchors.leftMargin: 0
	visible: false;
	width: 152
	height: 2+(totalCons * 30)
	color: "transparent"
	border.color: "transparent"
    border.width: 1
	
	property var totalCons: 0;
	property variant conItems: [];
	property variant conArrows: [];
	property var subTimer: false;
	property var rightPx: 0;
	property var bottomPx: 0;
	
	
	// Start Open/Close Context Menu Functions
	function open() {
		if (settings.cursorX + root.width > mousesurface.width) {
			root.anchors.leftMargin = mousesurface.width - root.width;
		} else root.anchors.leftMargin = settings.cursorX;
		
		rightPx = mousesurface.width - (root.anchors.leftMargin + root.width);

		if (settings.cursorY + root.height > mousesurface.height) {
			root.anchors.topMargin = mousesurface.height - root.height;
		} else root.anchors.topMargin = settings.cursorY;

		bottomPx = mousesurface.height - (root.anchors.topMargin + root.height);

		root.visible = true;
	}
	function close() {
		root.visible = false;
	}
	// End Open/Close Context Menu Functions
	
	// Start Remove all Context Menu Items
	function clearAll() {
		var pli = 0;
		
		if (totalCons > 0) for (pli = 0; pli < totalCons; pli++) if (typeof conItems[pli] !== 'undefined') {
			conItems[pli].destroy();
			delete conItems[pli];
		}
		for (pli = 0; pli < totalCons; pli++) if (typeof conArrows[pli] !== 'undefined') {
			conArrows[pli].destroy();
			delete conArrows[pli];
		}
	
		conItems = [];
		totalCons = 0;
	}
	// End Remove all Context Menu Items
	
	function href(target) {
		fireQmlMessage("[href]"+target);
	}
	
	function addContextItems() {
		// Remove Old Context Menu Items
		clearAll();

		// Adding Context Menu Items
		var pli = 0;
		
		if (vlcPlayer.state == 2 || vlcPlayer.state == 3 || vlcPlayer.state == 4) {
			if (!settings.tooSmall) {
				if (vlcPlayer.audio.count > 1) {
					var plstring = "Audio Tracks";
					var submenuIt = "";
					var logicIt = "";
					var clickIt = "";
					var preLogicIt = "";
					var selected = 0;
					var submenuWidth = 102;
					
					for (plsi = 0; plsi < vlcPlayer.audio.count; plsi++) if ((vlcPlayer.audio.description(plsi).length *6) +9 > submenuWidth) submenuWidth = (vlcPlayer.audio.description(plsi).length *6) +9;
					
					var submenuHeight = (vlcPlayer.audio.count *30) +2;
					if (submenuHeight < mousesurface.height) {
					
						var plsi = 0;
						for (plsi = 0; plsi < vlcPlayer.audio.count; plsi++) {
							if (vlcPlayer.audio.track == plsi) selected = plsi *30;
							submenuIt += ' Rectangle { id: sbmenu'+ plsi +'; height: 30; width: '+ submenuWidth +' -2; anchors.left: parent.left; anchors.leftMargin: 1; anchors.top: parent.top; anchors.topMargin: ('+ plsi +' * 30) +1; color: "transparent"; Text { anchors.left: parent.left; anchors.leftMargin: 15; anchors.top: parent.top; anchors.topMargin: 7; text: "'+ vlcPlayer.audio.description(plsi) +'"; color: "#e5e5e5"; font.pointSize: 9 } } ';
							preLogicIt += ' sbmenu'+ plsi +'.color = "transparent"; ';
						}
						for (plsi = 0; plsi < vlcPlayer.audio.count; plsi++) {
							if (logicIt != "") logicIt += ' else';
							logicIt += ' if (iTmouseY > ('+ plsi +' *30) && iTmouseY < (('+ plsi +' +1) *30)) { if (sbmenu'+ plsi +'.color != "#3D3D3D") { '+ preLogicIt +' sbmenu'+ plsi +'.color = "#3D3D3D"; } } ';
							clickIt += ' if (iTmouseY > ('+ plsi +' *30) && iTmouseY < (('+ plsi +' +1) *30)) { vlcPlayer.audio.track = '+ plsi +'; selectedIt.anchors.topMargin = '+ plsi +' *30 +11; wjs.setText("Audio Track: " + vlcPlayer.audio.description('+ plsi +')); } ';
						}
						
						submenuIt += ' Text { id: selectedIt; anchors.left: parent.left; anchors.leftMargin: 5; anchors.top: parent.top; anchors.topMargin: '+ selected +' +11; text: ui.icon.closePlaylist; font.family: fonts.icons.name; color: "#e5e5e5"; font.pointSize: 6 } ';
						
						var submenuTop = 0;
						var submenuLeft = 0;
				
						if (((pli *30) +submenuHeight) + root.anchors.topMargin > mousesurface.height) {
							submenuTop = (((pli *30) +submenuHeight) + root.anchors.topMargin - mousesurface.height) * (-1) -2;
						} else submenuTop = 0;
						
						if (rightPx < submenuWidth) {
							submenuLeft = (submenuWidth + root.width - 2) * (-1);
						} else submenuLeft = 0;
				
						conItems[pli] = Qt.createQmlObject('import QtQuick 2.1; import QtQuick.Layouts 1.0; import QmlVlc 0.1; Rectangle { property var iTmouseY: subcmitem'+ pli +'.mouseY; property var tempvar: false; id: ctxitem'+ pli +'; anchors.left: parent.left; anchors.leftMargin: 1; anchors.top: parent.top; anchors.topMargin: 1+ ('+ pli +' *30); color: "transparent"; width: root.width -2; height: 30; MouseArea { id: cmitem'+ pli +'; cursorShape: Qt.PointingHandCursor; hoverEnabled: true; anchors.fill: parent; onClicked: { } onExited: { tempvar = true; } } Rectangle { width: root.width -2; clip: true; height: 30; color: cmitem'+ pli +'.containsMouse ? "#3D3D3D" : "transparent"; Text { anchors.left: parent.left; anchors.leftMargin: 9; anchors.verticalCenter: parent.verticalCenter; text: "'+ plstring +'"; font.pointSize: 9; color: "#e5e5e5"; } } Rectangle { id: submenu'+ pli +'; visible: cmitem'+ pli +'.containsMouse ? true : subcmitem'+ pli +'.containsMouse ? true : false; anchors.left: parent.right; anchors.leftMargin: '+ submenuLeft +'; anchors.top: parent.top; anchors.topMargin: '+ submenuTop +'; border.color: root.border.color; border.width: 1; height: '+submenuHeight+'; width: '+submenuWidth+'; color: root.color; '+ submenuIt +' } MouseArea { id: subcmitem'+ pli +'; anchors.left: parent.right; anchors.leftMargin: '+ submenuLeft +'; anchors.top: parent.top; anchors.topMargin: '+ submenuTop +'; height: '+submenuHeight+'; width: '+submenuWidth+'; visible: submenu'+ pli +'.visible ? true : tempvar ? true : false; hoverEnabled: submenu'+ pli +'.visible ? true : tempvar ? true : false; cursorShape: Qt.PointingHandCursor; onEntered: { tempvar = true; } onExited: { tempvar = false; '+ preLogicIt +' } onPositionChanged: { '+ logicIt +' } onClicked: { '+ clickIt +' } } Timer { interval: 300; running: tempvar; repeat: false; onTriggered: { if (!subcmitem'+ pli +'.containsMouse) tempvar = false; } } }', root, 'cmenustr' +pli);
				
						conArrows[pli] = Qt.createQmlObject('import QtQuick 2.1; import QtQuick.Layouts 1.0; import QmlVlc 0.1; Text {  anchors.right: parent.right; anchors.rightMargin: 11; anchors.top: parent.top; anchors.topMargin: 10+ ('+ pli +' *30); text: settings.glyphsLoaded ? ui.icon.play : ""; font.family: fonts.icons.name; font.pointSize: 9; color: "#e5e5e5"; }', root, 'omenustr' +pli);
						pli++;
					}
				}
				
				var plstring = "Aspect Ratio";
				var submenuIt = "";
				var logicIt = "";
				var clickIt = "";
				var preLogicIt = "";
				var selected = 0;
				
				var submenuHeight = (settings.aspectRatios.length *30) +2;
				if (submenuHeight < mousesurface.height) {
				
					var plsi = 0;
					for (plsi = 0; plsi < settings.aspectRatios.length; plsi++) {
						if (settings.aspectRatios[plsi] == settings.curAspect) selected = plsi *30;
						submenuIt += ' Rectangle { id: sbmenu'+ plsi +'; height: 30; width: 100; anchors.left: parent.left; anchors.leftMargin: 1; anchors.top: parent.top; anchors.topMargin: ('+ plsi +' * 30) +1; color: "transparent"; Text { anchors.left: parent.left; anchors.leftMargin: 15; anchors.top: parent.top; anchors.topMargin: 7; text: "'+ settings.aspectRatios[plsi] +'"; color: "#e5e5e5"; font.pointSize: 9 } } ';
						preLogicIt += ' sbmenu'+ plsi +'.color = "transparent"; ';
					}
					for (plsi = 0; plsi < settings.aspectRatios.length; plsi++) {
						if (logicIt != "") logicIt += ' else';
						logicIt += ' if (iTmouseY > ('+ plsi +' *30) && iTmouseY < (('+ plsi +' +1) *30)) { if (sbmenu'+ plsi +'.color != "#3D3D3D") { '+ preLogicIt +' sbmenu'+ plsi +'.color = "#3D3D3D"; } } ';
						clickIt += ' if (iTmouseY > ('+ plsi +' *30) && iTmouseY < (('+ plsi +' +1) *30)) { settings.curAspect = "'+ settings.aspectRatios[plsi] +'"; if (settings.curAspect == "Default") { wjs.resetAspect(); } else { wjs.changeAspect(settings.curAspect,"ratio"); } wjs.setText("Aspect Ratio: " + settings.curAspect); selectedIt.anchors.topMargin = '+ plsi +' *30 +11; } ';
					}
					
					submenuIt += ' Text { id: selectedIt; anchors.left: parent.left; anchors.leftMargin: 5; anchors.top: parent.top; anchors.topMargin: '+ selected +' +11; text: ui.icon.closePlaylist; font.family: fonts.icons.name; color: "#e5e5e5"; font.pointSize: 6 } ';
					
					var submenuWidth = 102;
					var submenuTop = 0;
					var submenuLeft = 0;
			
					if (((pli *30) +submenuHeight) + root.anchors.topMargin > mousesurface.height) {
						submenuTop = (((pli *30) +submenuHeight) + root.anchors.topMargin - mousesurface.height) * (-1) -2;
					} else submenuTop = 0;
					
					if (rightPx < submenuWidth) {
						submenuLeft = (submenuWidth + root.width - 2) * (-1);
					} else submenuLeft = 0;
			
					conItems[pli] = Qt.createQmlObject('import QtQuick 2.1; import QtQuick.Layouts 1.0; import QmlVlc 0.1; Rectangle { property var iTmouseY: subcmitem'+ pli +'.mouseY; property var tempvar: false; id: ctxitem'+ pli +'; anchors.left: parent.left; anchors.leftMargin: 1; anchors.top: parent.top; anchors.topMargin: 1+ ('+ pli +' *30); color: "transparent"; width: root.width -2; height: 30; MouseArea { id: cmitem'+ pli +'; cursorShape: Qt.PointingHandCursor; hoverEnabled: true; anchors.fill: parent; onClicked: { } onExited: { tempvar = true; } } Rectangle { width: root.width -2; clip: true; height: 30; color: cmitem'+ pli +'.containsMouse ? "#3D3D3D" : "transparent"; Text { anchors.left: parent.left; anchors.leftMargin: 9; anchors.verticalCenter: parent.verticalCenter; text: "'+ plstring +'"; font.pointSize: 9; color: "#e5e5e5"; } } Rectangle { id: submenu'+ pli +'; visible: cmitem'+ pli +'.containsMouse ? true : subcmitem'+ pli +'.containsMouse ? true : false; anchors.left: parent.right; anchors.leftMargin: '+ submenuLeft +'; anchors.top: parent.top; anchors.topMargin: '+ submenuTop +'; border.color: root.border.color; border.width: 1; height: '+submenuHeight+'; width: '+submenuWidth+'; color: root.color; '+ submenuIt +' } MouseArea { id: subcmitem'+ pli +'; anchors.left: parent.right; anchors.leftMargin: '+ submenuLeft +'; anchors.top: parent.top; anchors.topMargin: '+ submenuTop +'; height: '+submenuHeight+'; width: '+submenuWidth+'; visible: submenu'+ pli +'.visible ? true : tempvar ? true : false; hoverEnabled: submenu'+ pli +'.visible ? true : tempvar ? true : false; cursorShape: Qt.PointingHandCursor; onEntered: { tempvar = true; } onExited: { tempvar = false; '+ preLogicIt +' } onPositionChanged: { '+ logicIt +' } onClicked: { '+ clickIt +' } } Timer { interval: 300; running: tempvar; repeat: false; onTriggered: { if (!subcmitem'+ pli +'.containsMouse) tempvar = false; } } }', root, 'cmenustr' +pli);
			
					conArrows[pli] = Qt.createQmlObject('import QtQuick 2.1; import QtQuick.Layouts 1.0; import QmlVlc 0.1; Text {  anchors.right: parent.right; anchors.rightMargin: 11; anchors.top: parent.top; anchors.topMargin: 10+ ('+ pli +' *30); text: settings.glyphsLoaded ? ui.icon.play : ""; font.family: fonts.icons.name; font.pointSize: 9; color: "#e5e5e5"; }', root, 'omenustr' +pli);
					pli++;
				}
		
				var plstring = "Crop";
				var submenuIt = "";
				var logicIt = "";
				var clickIt = "";
				var preLogicIt = "";
				var selected = 0;
				
				var submenuHeight = (settings.crops.length *30) +2;
				if (submenuHeight < mousesurface.height) {
				
					var plsi = 0;
					for (plsi = 0; plsi < settings.crops.length; plsi++) {
						if (settings.crops[plsi] == settings.curCrop) selected = plsi *30;
						submenuIt += ' Rectangle { id: sbmenu'+ plsi +'; height: 30; width: 100; anchors.left: parent.left; anchors.leftMargin: 1; anchors.top: parent.top; anchors.topMargin: ('+ plsi +' * 30) +1; color: "transparent"; Text { anchors.left: parent.left; anchors.leftMargin: 15; anchors.top: parent.top; anchors.topMargin: 7; text: "'+ settings.crops[plsi] +'"; color: "#e5e5e5"; font.pointSize: 9 } } ';
						preLogicIt += ' sbmenu'+ plsi +'.color = "transparent"; ';
					}
					for (plsi = 0; plsi < settings.crops.length; plsi++) {
						if (logicIt != "") logicIt += ' else';
						logicIt += ' if (iTmouseY > ('+ plsi +' *30) && iTmouseY < (('+ plsi +' +1) *30)) { if (sbmenu'+ plsi +'.color != "#3D3D3D") { '+ preLogicIt +' sbmenu'+ plsi +'.color = "#3D3D3D"; } } ';
						clickIt += ' if (iTmouseY > ('+ plsi +' *30) && iTmouseY < (('+ plsi +' +1) *30)) { settings.curCrop = "'+ settings.crops[plsi] +'"; if (settings.curCrop == "Default") { wjs.resetAspect(); } else { wjs.changeAspect(settings.curCrop,"crop"); } wjs.setText("Crop: " + settings.curCrop); selectedIt.anchors.topMargin = '+ plsi +' *30 +11; } ';
					}
					
					submenuIt += ' Text { id: selectedIt; anchors.left: parent.left; anchors.leftMargin: 5; anchors.top: parent.top; anchors.topMargin: '+ selected +' +11; text: ui.icon.closePlaylist; font.family: fonts.icons.name; color: "#e5e5e5"; font.pointSize: 6 } ';
					
					var submenuWidth = 102;
					var submenuTop = 0;
					var submenuLeft = 0;
			
					if (((pli *30) +submenuHeight) + root.anchors.topMargin > mousesurface.height) {
						submenuTop = (((pli *30) +submenuHeight) + root.anchors.topMargin - mousesurface.height) * (-1) -2;
					} else submenuTop = 0;
					
					if (rightPx < submenuWidth) {
						submenuLeft = (submenuWidth + root.width - 2) * (-1);
					} else submenuLeft = 0;
			
					conItems[pli] = Qt.createQmlObject('import QtQuick 2.1; import QtQuick.Layouts 1.0; import QmlVlc 0.1; Rectangle { property var iTmouseY: subcmitem'+ pli +'.mouseY; property var tempvar: false; id: ctxitem'+ pli +'; anchors.left: parent.left; anchors.leftMargin: 1; anchors.top: parent.top; anchors.topMargin: 1+ ('+ pli +' *30); color: "transparent"; width: root.width -2; height: 30; MouseArea { id: cmitem'+ pli +'; cursorShape: Qt.PointingHandCursor; hoverEnabled: true; anchors.fill: parent; onClicked: { } onExited: { tempvar = true; } } Rectangle { width: root.width -2; clip: true; height: 30; color: cmitem'+ pli +'.containsMouse ? "#3D3D3D" : "transparent"; Text { anchors.left: parent.left; anchors.leftMargin: 9; anchors.verticalCenter: parent.verticalCenter; text: "'+ plstring +'"; font.pointSize: 9; color: "#e5e5e5"; } } Rectangle { id: submenu'+ pli +'; visible: cmitem'+ pli +'.containsMouse ? true : subcmitem'+ pli +'.containsMouse ? true : false; anchors.left: parent.right; anchors.leftMargin: '+ submenuLeft +'; anchors.top: parent.top; anchors.topMargin: '+ submenuTop +'; border.color: root.border.color; border.width: 1; height: '+submenuHeight+'; width: '+submenuWidth+'; color: root.color; '+ submenuIt +' } MouseArea { id: subcmitem'+ pli +'; anchors.left: parent.right; anchors.leftMargin: '+ submenuLeft +'; anchors.top: parent.top; anchors.topMargin: '+ submenuTop +'; height: '+submenuHeight+'; width: '+submenuWidth+'; visible: submenu'+ pli +'.visible ? true : tempvar ? true : false; hoverEnabled: submenu'+ pli +'.visible ? true : tempvar ? true : false; cursorShape: Qt.PointingHandCursor; onEntered: { tempvar = true; } onExited: { tempvar = false; '+ preLogicIt +' } onPositionChanged: { '+ logicIt +' } onClicked: { '+ clickIt +' } } Timer { interval: 300; running: tempvar; repeat: false; onTriggered: { if (!subcmitem'+ pli +'.containsMouse) tempvar = false; } } }', root, 'cmenustr' +pli);
			
					conArrows[pli] = Qt.createQmlObject('import QtQuick 2.1; import QtQuick.Layouts 1.0; import QmlVlc 0.1; Text {  anchors.right: parent.right; anchors.rightMargin: 11; anchors.top: parent.top; anchors.topMargin: 10+ ('+ pli +' *30); text: settings.glyphsLoaded ? ui.icon.play : ""; font.family: fonts.icons.name; font.pointSize: 9; color: "#e5e5e5"; }', root, 'omenustr' +pli);
					pli++;
				}
		
				var plstring = "Zoom";
				var submenuIt = "";
				var logicIt = "";
				var clickIt = "";
				var preLogicIt = "";
				var selected = 0;
				
				var submenuHeight = (settings.zooms.length *30) +2;
				if (submenuHeight < mousesurface.height) {
				
					var plsi = 0;
					for (plsi = 0; plsi < settings.zooms.length; plsi++) {
						if (plsi == settings.curZoom) selected = plsi *30;
						submenuIt += ' Rectangle { id: sbmenu'+ plsi +'; height: 30; width: 100; anchors.left: parent.left; anchors.leftMargin: 1; anchors.top: parent.top; anchors.topMargin: ('+ plsi +' * 30) +1; color: "transparent"; Text { anchors.left: parent.left; anchors.leftMargin: 15; anchors.top: parent.top; anchors.topMargin: 7; text: "'+ settings.zooms[plsi][1] +'"; color: "#e5e5e5"; font.pointSize: 9 } } ';
						preLogicIt += ' sbmenu'+ plsi +'.color = "transparent"; ';
					}
					for (plsi = 0; plsi < settings.zooms.length; plsi++) {
						if (logicIt != "") logicIt += ' else';
						logicIt += ' if (iTmouseY > ('+ plsi +' *30) && iTmouseY < (('+ plsi +' +1) *30)) { if (sbmenu'+ plsi +'.color != "#3D3D3D") { '+ preLogicIt +' sbmenu'+ plsi +'.color = "#3D3D3D"; } } ';
						clickIt += ' if (iTmouseY > ('+ plsi +' *30) && iTmouseY < (('+ plsi +' +1) *30)) { settings.curZoom = "'+ plsi +'"; wjs.changeZoom('+ settings.zooms[plsi][0] +'); wjs.setText("Zoom Mode: '+ settings.zooms[plsi][1] +'"); selectedIt.anchors.topMargin = '+ plsi +' *30 +11; } ';
					}
					
					submenuIt += ' Text { id: selectedIt; anchors.left: parent.left; anchors.leftMargin: 5; anchors.top: parent.top; anchors.topMargin: '+ selected +' +11; text: ui.icon.closePlaylist; font.family: fonts.icons.name; color: "#e5e5e5"; font.pointSize: 6 } ';
					
					var submenuWidth = 102;
					var submenuTop = 0;
					var submenuLeft = 0;
			
					if (((pli *30) +submenuHeight) + root.anchors.topMargin > mousesurface.height) {
						submenuTop = (((pli *30) +submenuHeight) + root.anchors.topMargin - mousesurface.height) * (-1) -2;
					} else submenuTop = 0;
					
					if (rightPx < submenuWidth) {
						submenuLeft = (submenuWidth + root.width - 2) * (-1);
					} else submenuLeft = 0;
			
					conItems[pli] = Qt.createQmlObject('import QtQuick 2.1; import QtQuick.Layouts 1.0; import QmlVlc 0.1; Rectangle { property var iTmouseY: subcmitem'+ pli +'.mouseY; property var tempvar: false; id: ctxitem'+ pli +'; anchors.left: parent.left; anchors.leftMargin: 1; anchors.top: parent.top; anchors.topMargin: 1+ ('+ pli +' *30); color: "transparent"; width: root.width -2; height: 30; MouseArea { id: cmitem'+ pli +'; cursorShape: Qt.PointingHandCursor; hoverEnabled: true; anchors.fill: parent; onClicked: { } onExited: { tempvar = true; } } Rectangle { width: root.width -2; clip: true; height: 30; color: cmitem'+ pli +'.containsMouse ? "#3D3D3D" : "transparent"; Text { anchors.left: parent.left; anchors.leftMargin: 9; anchors.verticalCenter: parent.verticalCenter; text: "'+ plstring +'"; font.pointSize: 9; color: "#e5e5e5"; } } Rectangle { id: submenu'+ pli +'; visible: cmitem'+ pli +'.containsMouse ? true : subcmitem'+ pli +'.containsMouse ? true : false; anchors.left: parent.right; anchors.leftMargin: '+ submenuLeft +'; anchors.top: parent.top; anchors.topMargin: '+ submenuTop +'; border.color: root.border.color; border.width: 1; height: '+submenuHeight+'; width: '+submenuWidth+'; color: root.color; '+ submenuIt +' } MouseArea { id: subcmitem'+ pli +'; anchors.left: parent.right; anchors.leftMargin: '+ submenuLeft +'; anchors.top: parent.top; anchors.topMargin: '+ submenuTop +'; height: '+submenuHeight+'; width: '+submenuWidth+'; visible: submenu'+ pli +'.visible ? true : tempvar ? true : false; hoverEnabled: submenu'+ pli +'.visible ? true : tempvar ? true : false; cursorShape: Qt.PointingHandCursor; onEntered: { tempvar = true; } onExited: { tempvar = false; '+ preLogicIt +' } onPositionChanged: { '+ logicIt +' } onClicked: { '+ clickIt +' } } Timer { interval: 300; running: tempvar; repeat: false; onTriggered: { if (!subcmitem'+ pli +'.containsMouse) tempvar = false; } } }', root, 'cmenustr' +pli);
			
					conArrows[pli] = Qt.createQmlObject('import QtQuick 2.1; import QtQuick.Layouts 1.0; import QmlVlc 0.1; Text {  anchors.right: parent.right; anchors.rightMargin: 11; anchors.top: parent.top; anchors.topMargin: 10+ ('+ pli +' *30); text: settings.glyphsLoaded ? ui.icon.play : ""; font.family: fonts.icons.name; font.pointSize: 9; color: "#e5e5e5"; }', root, 'omenustr' +pli);
					pli++;
				}
			}
			
		}
		
		if (torDataBut == 1) {
		
			var plstring = "Torrent Data";
			
			conItems[pli] = Qt.createQmlObject('import QtQuick 2.1; import QtQuick.Layouts 1.0; import QmlVlc 0.1; Rectangle { id: ctxitem'+ pli +'; anchors.left: parent.left; anchors.leftMargin: 1; anchors.top: parent.top; anchors.topMargin: 1+ ('+ pli +' *30); color: "transparent"; width: root.width -2; height: 30; MouseArea { id: cmitem'+ pli +'; cursorShape: Qt.PointingHandCursor; hoverEnabled: true; anchors.fill: parent; onClicked: { close(); fireQmlMessage("[torrent-data]"); if (vlcPlayer.playing) vlcPlayer.togglePause(); } } Rectangle { width: root.width -2; clip: true; height: 30; color: cmitem'+ pli +'.containsMouse ? "#3D3D3D" : "transparent"; Text { anchors.left: parent.left; anchors.leftMargin: 9; anchors.verticalCenter: parent.verticalCenter; text: "'+ plstring +'"; font.pointSize: 9; color: "#e5e5e5"; } } }', root, 'cmenustr' +pli);
	
			pli++;
			
		}

		if (fullscreen === false) {
			var plstring = "Always on Top";
			
			conItems[pli] = Qt.createQmlObject('import QtQuick 2.1; import QtQuick.Layouts 1.0; import QmlVlc 0.1; Rectangle { id: ctxitem'+ pli +'; anchors.left: parent.left; anchors.leftMargin: 1; anchors.top: parent.top; anchors.topMargin: 1+ ('+ pli +' *30); color: "transparent"; width: root.width -2; height: 30; MouseArea { id: cmitem'+ pli +'; cursorShape: Qt.PointingHandCursor; hoverEnabled: true; anchors.fill: parent; onClicked: { close(); fireQmlMessage("[always-on-top]"); } } Rectangle { width: root.width -2; clip: true; height: 30; color: cmitem'+ pli +'.containsMouse ? "#3D3D3D" : "transparent"; Text { anchors.left: parent.left; anchors.leftMargin: 9; anchors.verticalCenter: parent.verticalCenter; text: "'+ plstring +'"; font.pointSize: 9; color: "#e5e5e5"; } } }', root, 'cmenustr' +pli);
			
			conArrows[pli] = Qt.createQmlObject('import QtQuick 2.1; import QtQuick.Layouts 1.0; import QmlVlc 0.1; Text { visible: onTop; anchors.right: parent.right; anchors.rightMargin: 11; anchors.top: parent.top; anchors.topMargin: 11+ ('+ pli +' *30); text: settings.glyphsLoaded ? ui.icon.closePlaylist : ""; font.family: fonts.icons.name; font.pointSize: 7; color: "#e5e5e5"; }', root, 'omenustr' +pli);
	
			pli++;
		}

		if (!settings.tooSmall) {
//			var plstring = "About WebChimera";
			
//			conItems[pli] = Qt.createQmlObject('import QtQuick 2.1; import QtQuick.Layouts 1.0; import QmlVlc 0.1; Rectangle { id: ctxitem'+ pli +'; anchors.left: parent.left; anchors.leftMargin: 1; anchors.top: parent.top; anchors.topMargin: 1+ ('+ pli +' *30); color: "transparent"; width: root.width -2; height: 30; MouseArea { id: cmitem'+ pli +'; cursorShape: Qt.PointingHandCursor; hoverEnabled: true; anchors.fill: parent; onClicked: { close(); href("http://www.webchimera.org/"); if (vlcPlayer.playing) vlcPlayer.togglePause(); } } Rectangle { width: root.width -2; clip: true; height: 30; color: cmitem'+ pli +'.containsMouse ? "#3D3D3D" : "transparent"; Text { anchors.left: parent.left; anchors.leftMargin: 9; anchors.verticalCenter: parent.verticalCenter; text: "'+ plstring +'"; font.pointSize: 9; color: "#e5e5e5"; } } }', root, 'cmenustr' +pli);
	
//			pli++;
		}
		
		if (vlcPlayer.state == 2 || vlcPlayer.state == 3 || vlcPlayer.state == 4) {
			if (!settings.tooSmall) {
				if (plugin.version == "0.2.8") {
					var plstring = "Screenshot";
					
					conItems[pli] = Qt.createQmlObject('import QtQuick 2.1; import QtQuick.Layouts 1.0; import QmlVlc 0.1; Rectangle { id: ctxitem'+ pli +'; anchors.left: parent.left; anchors.leftMargin: 1; anchors.top: parent.top; anchors.topMargin: 1+ ('+ pli +' *30); color: "transparent"; width: root.width -2; height: 30; MouseArea { id: cmitem'+ pli +'; cursorShape: Qt.PointingHandCursor; hoverEnabled: true; anchors.fill: parent; onClicked: { close(); takeSnapshot(videoSource); } } Rectangle { width: root.width -2; clip: true; height: 30; color: cmitem'+ pli +'.containsMouse ? "#3D3D3D" : "transparent"; Text { anchors.left: parent.left; anchors.leftMargin: 9; anchors.verticalCenter: parent.verticalCenter; text: "'+ plstring +'"; font.pointSize: 9; color: "#e5e5e5"; } } }', root, 'cmenustr' +pli);
					
					pli++;
				}
			}
		}

		var plstring = "Exit to Main Menu";
		
		conItems[pli] = Qt.createQmlObject('import QtQuick 2.1; import QtQuick.Layouts 1.0; import QmlVlc 0.1; Rectangle { id: ctxitem'+ pli +'; anchors.left: parent.left; anchors.leftMargin: 1; anchors.top: parent.top; anchors.topMargin: 1+ ('+ pli +' *30); color: "transparent"; width: root.width -2; height: 30; MouseArea { id: cmitem'+ pli +'; cursorShape: Qt.PointingHandCursor; hoverEnabled: true; anchors.fill: parent; onClicked: { close(); wjs.goBack(); } } Rectangle { width: root.width -2; clip: true; height: 30; color: cmitem'+ pli +'.containsMouse ? "#3D3D3D" : "transparent"; Text { anchors.left: parent.left; anchors.leftMargin: 9; anchors.verticalCenter: parent.verticalCenter; text: "'+ plstring +'"; font.pointSize: 9; color: "#e5e5e5"; } } }', root, 'cmenustr' +pli);
		pli++;

		totalCons = pli;
		
		// End Adding Context Menu Items
	}
	
	// This is where the Context Menu Items will be loaded
}
