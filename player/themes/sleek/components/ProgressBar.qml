import QtQuick 2.1
import QtQuick.Layouts 1.0
import QmlVlc 0.1
import QtGraphicalEffects 1.0

Rectangle {
	property alias backgroundColor: progressBackground.color
	property alias viewedColor: movepos.color
	property alias positionColor: curpos.color
	property alias dragpos: dragpos
	property alias effectDuration: effect.duration
	property alias cache: cache
	signal pressed(string mouseX, string mouseY)
	signal changed(string mouseX, string mouseY)
	signal released(string mouseX, string mouseY)
	
	id: root
	anchors.fill: parent
	color: "transparent"
	visible: settings.uiVisible == 0 ? false : settings.toolbar == 0 ? false : true
	
	property var checkWheel: false;
	property var lastTimestamp: 0;
	property var lastCalc: 0;
	
	RowLayout {
		id: rowLayer
		anchors.left: parent.left
		anchors.right: parent.right
		anchors.bottom: parent.bottom
		anchors.bottomMargin: settings.multiscreen == 1 ? fullscreen ? 32 : -8 : fullscreen ? 32 : mousesurface.containsMouse ? 30 : 0 // Multiscreen - Edit
		opacity: settings.multiscreen == 1 ? fullscreen ? settings.ismoving > 5 ? 0 : 1 : 0 : fullscreen ? settings.ismoving > 5 ? 0 : 1 : 1 // Multiscreen - Edit
		Behavior on anchors.bottomMargin {
			PropertyAnimation {
				id: effect
				duration: settings.multiscreen == 0 ? 250 : 0				
			}
		}
		Behavior on opacity { PropertyAnimation { duration: settings.multiscreen == 1 ? fullscreen ? 250 : 0 : 250 } }
		
		// Start Progress Bar Functionality (Time Chat Bubble, Seek)
		MouseArea {
			id: dragpos
			cursorShape: toolbar.opacity == 1 ? Qt.PointingHandCursor : mousesurface.cursorShape
			hoverEnabled: true
			anchors.fill: parent
			onPressed: root.pressed(mouse.x,mouse.y);
			onPositionChanged: root.changed(mouse.x,mouse.y);
			onReleased: root.released(mouse.x,mouse.y);
			onWheel: {
				settings.newProgress = (vlcPlayer.time + lastCalc) / wjs.getLength();
				settings = settings;
				if (vlcPlayer.playing) vlcPlayer.togglePause();
				lastTimestamp = Date.now();
				checkWheel = true;
				if (wjs.getLength() > 0) var newDif = Math.floor(wjs.getLength() /100);
				else var newDif = 30000;

				if (wheel.angleDelta.y > 0) lastCalc = lastCalc +newDif;
				if (wheel.angleDelta.y < 0) lastCalc = lastCalc + (newDif * (-1));
				
			}
		}
		Timer {
			interval: 1010; running: checkWheel ? true : false; repeat: true
			onTriggered: {
				if (lastTimestamp + 1000 < Date.now()) {
					checkWheel = false;
					if (!vlcPlayer.playing) vlcPlayer.togglePause();
					vlcPlayer.time = wjs.getLength() * settings.newProgress;
					lastCalc = 0;
				}
			}
		}
		Rectangle {
			id: progressBackground
			anchors.left: parent.left
			anchors.right: parent.right
			height: 8
			anchors.verticalCenter: parent.verticalCenter
			Rectangle {
				id: cache
				visible: false
				height: 8
				anchors.left: parent.left
				anchors.bottom: parent.bottom
				color: "#3E3E3E"
				width: settings.downloaded > 0 ? vlcPlayer.state == 3 || vlcPlayer.state == 4 ? parent.width * settings.downloaded : 0 : vlcPlayer.state <= 1 ? 0 : settings.dragging ? 0 : ((parent.width - anchors.leftMargin - anchors.rightMargin) * settings.newProgress) + ((parent.width - anchors.leftMargin - anchors.rightMargin) * ((settings.cache / ((vlcPlayer.time * (1 / settings.newProgress)) /100)) /100) /100 * settings.buffering)
//				Behavior on width { PropertyAnimation { duration: settings.dragging ? 0 : vlcPlayer.time - lastTime > 0 ? vlcPlayer.time - lastTime : 0 } }
			}
			Rectangle {
				id: movepos
				width: vlcPlayer.state <= 1 ? 0 : settings.dragging ? dragpos.mouseX -4 : (parent.width - anchors.leftMargin - anchors.rightMargin) * settings.newProgress
				anchors.top: parent.top
				anchors.left: parent.left
				anchors.bottom: parent.bottom
//				Behavior on width { PropertyAnimation { duration: settings.dragging ? 0 : vlcPlayer.time - lastTime > 0 ? vlcPlayer.time - lastTime : 0 } }
			}
		}
		// End Progress Bar Functionality (Time Chat Bubble, Seek)
	}
	RowLayout {
		id: movecur
		spacing: 0
		anchors.left: parent.left
		anchors.right: parent.right
		anchors.bottom: parent.bottom
		anchors.leftMargin: vlcPlayer.state <= 1 ? 0 : settings.dragging ? dragpos.mouseX -4 > 0 ? dragpos.mouseX < parent.width -4 ? dragpos.mouseX -4 : parent.width -8 : 0 : (parent.width - anchors.rightMargin) * settings.newProgress > 0 ? (parent.width - anchors.rightMargin) * settings.newProgress < parent.width -8 ? (parent.width - anchors.rightMargin) * settings.newProgress : parent.width -8 : 0
		
		// Start Multiscreen - Edit
		anchors.bottomMargin: settings.multiscreen == 1 ? fullscreen ? toolbar.height : -16 : fullscreen ? toolbar.height : mousesurface.containsMouse ? toolbar.height : 0
		opacity: settings.multiscreen == 1 ? fullscreen ? settings.ismoving > 5 ? 0 : 1 : 0 : fullscreen ? settings.ismoving > 5 ? 0 : 1 : 1
		// End Multiscreen - Edit

//		Behavior on anchors.leftMargin { PropertyAnimation { duration: settings.dragging ? 0 : vlcPlayer.time - lastTime > 0 ? vlcPlayer.time - lastTime : 0 } }
		Behavior on anchors.bottomMargin { PropertyAnimation { duration: settings.multiscreen == 1 ? 0 : 250 } }
		Behavior on opacity { PropertyAnimation { duration: 250 } }
		Rectangle {
			Layout.fillWidth: true
			height: 8
			color: 'transparent'
			anchors.verticalCenter: parent.verticalCenter
			Rectangle {
				id: shadowEffect
				color: fullscreen ? Qt.rgba(0, 0, 0, 0.3) : mousesurface.containsMouse ? Qt.rgba(0, 0, 0, 0.3) : Qt.rgba(0, 0, 0, 0.2)
				height: fullscreen ? 16 : mousesurface.containsMouse ? 16 : 10
				width: fullscreen ? 16 : mousesurface.containsMouse ? 16 : 10
				radius: width == 10 ? 0 : width * 0.5
				anchors.bottom: parent.bottom
				anchors.bottomMargin: fullscreen ? -4 : mousesurface.containsMouse ? -4 : -2
				anchors.left: parent.left
				anchors.leftMargin: fullscreen ? -4 : mousesurface.containsMouse ? -4 : -1
				Behavior on anchors.bottomMargin { PropertyAnimation { duration: 250 } }
				Behavior on anchors.leftMargin { PropertyAnimation { duration: 250 } }
				Behavior on width { PropertyAnimation { duration: 250 } }
				Behavior on height { PropertyAnimation { duration: 250 } }
				Behavior on color { PropertyAnimation { duration: 250 } }
			}
			Rectangle {
				id: curpos
				height: fullscreen ? 14 : mousesurface.containsMouse ? 14 : 8
				width: fullscreen ? 14 : mousesurface.containsMouse ? 14 : 8
				radius: width == 8 ? 0 : width * 0.5
				anchors.bottom: parent.bottom
				anchors.bottomMargin: fullscreen ? -3 : mousesurface.containsMouse ? -3 : 0
				anchors.left: parent.left
				anchors.leftMargin: fullscreen ? -3 : mousesurface.containsMouse ? -3 : 0
				Behavior on anchors.bottomMargin { PropertyAnimation { duration: 250 } }
				Behavior on anchors.leftMargin { PropertyAnimation { duration: 250 } }
				Behavior on width { PropertyAnimation { duration: 250 } }
				Behavior on height { PropertyAnimation { duration: 250 } }		
				Rectangle {
					height: fullscreen ? 6 : mousesurface.containsMouse ? 6 : 0
					width: fullscreen ? 6 : mousesurface.containsMouse ? 6 : 0
					radius: width * 0.5
					anchors.centerIn: parent
					color: cache.visible ? settings.dragging ? movepos.color : dragpos.containsMouse ? movepos.width -3 < dragpos.mouseX && dragpos.mouseX < movepos.width + 11 ? movepos.color : cache.color : cache.color : settings.dragging ? movepos.color : dragpos.containsMouse ? movepos.width -3 < dragpos.mouseX && dragpos.mouseX < movepos.width + 11 ? movepos.color : progressBackground.color : progressBackground.color
					Behavior on width { PropertyAnimation { duration: 250 } }
					Behavior on height { PropertyAnimation { duration: 250 } }
				}
			}
		}
	}
}