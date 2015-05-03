import QtQuick 2.1
import QtQuick.Layouts 1.0
import QmlVlc 0.1
import QtGraphicalEffects 1.0

Rectangle {
	property alias backgroundColor: progressBackground.color
	property alias viewedColor: movepos.color
	property alias back: rowLayer
	property alias mpos: movepos
	property alias dragpos: dragpos
	signal pressed(string mouseX, string mouseY)
	signal changed(string mouseX, string mouseY)
	signal released(string mouseX, string mouseY)
	
	id: root
	anchors.fill: parent
	color: "transparent"
	visible: !fullscreen ? settings.tooSmall ? true : false : false
	
	property var checkWheel: false;
	property var lastTimestamp: 0;
	property var lastCalc: 0;
	
	RowLayout {
		id: rowLayer
		anchors.left: parent.left
		anchors.leftMargin: 10
		anchors.right: parent.right
		anchors.rightMargin: 10
		anchors.bottom: parent.bottom
		anchors.bottomMargin: 10
		opacity: mousesurface.containsMouse ? true : false
		Behavior on opacity {
			PropertyAnimation {
				duration: 100
			}
		}		
		// Start Progress Bar Functionality (Time Chat Bubble, Seek)
		MouseArea {
			id: dragpos
			cursorShape: Qt.PointingHandCursor
			hoverEnabled: true
			anchors.fill: parent
			onPressed: root.pressed(mouse.x,mouse.y);
			onPositionChanged: root.changed(mouse.x,mouse.y);
			onReleased: root.released(mouse.x,mouse.y);
			onWheel: {

				if (wheel.angleDelta.y > 0) progressBar.seekProgress(1);
				if (wheel.angleDelta.y < 0) progressBar.seekProgress(-1);
				
			}
		}
		Rectangle {
			id: progressBackground
			anchors.left: parent.left
			anchors.right: parent.right
			height: 14
			anchors.verticalCenter: parent.verticalCenter
			color: "transparent"
			opacity: 0.8
			border.color: "white"
			border.width: 1
			Rectangle {
				id: movepos
				width: settings.dragging ? dragpos.mouseX <= progressBackground.width && dragpos.mouseX > 0 ? dragpos.mouseX : dragpos.mouseX < 0 ? 0 : dragpos.mouseX > progressBackground.width ? progressBackground.width : 0 : progressBackground.width * (progressBar.movep.width / theview.width)
				color: "white"
				anchors.top: parent.top
				anchors.left: parent.left
				anchors.bottom: parent.bottom
			}
		}
		// End Progress Bar Functionality (Time Chat Bubble, Seek)
	}
}