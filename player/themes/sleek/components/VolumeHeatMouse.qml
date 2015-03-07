import QtQuick 2.1

Rectangle {
	property alias dragger: mouseAreaVl
	property alias hover: mouseAreaVol
	signal pressAndHold(string mouseX, string mouseY)
	signal positionChanged(string mouseX, string mouseY)
	signal released(string mouseX, string mouseY)

	id: root
	anchors.fill: parent
	color: "transparent"

	// Mouse Area for Dragging
	MouseArea {
		id: mouseAreaVl
		anchors.fill: parent
		anchors.left: parent.left
		hoverEnabled: true
	}
	// End Mouse Area for Dragging
	MouseArea {
		id: mouseAreaVol
		cursorShape: toolbar.opacity == 1 ? Qt.PointingHandCursor : mousesurface.cursorShape
		anchors.fill: parent
		anchors.left: parent.left
		onPressAndHold: root.pressAndHold(mouse.x,mouse.y);
		onPositionChanged: root.positionChanged(mouse.x,mouse.y);
		onReleased: root.released(mouse.x,mouse.y);
	}
}