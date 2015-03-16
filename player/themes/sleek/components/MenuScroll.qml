import QtQuick 2.1
import QmlVlc 0.1

Rectangle {
	property alias draggerColor: playmdrag.color
	property alias backgroundColor: scrollerBack.color
	property alias dragger: playmdrag
	signal drag(string mouseY)
	
	id: root
	anchors.top: parent.top
	anchors.topMargin: 38
	anchors.right: parent.right
	anchors.rightMargin: 6
	width: 35
	height: 200
	color: "transparent"
	Rectangle {
		id: scrollerBack
		anchors.horizontalCenter: parent.horizontalCenter
		width: 10
		height: root.height
		opacity: playmdrag.height == root.height ? 0.5 : 1
	}
	Rectangle {
		id: playmdrag
		anchors.top: parent.top
		anchors.topMargin: 0
		anchors.left: parent.left
		anchors.leftMargin: 13
		width: 10
		opacity: playmdrag.height == root.height ? 0 : 1
	}
	MouseArea {
		id: playmdragger
		anchors.fill: parent
		cursorShape: playmdrag.opacity == 1 ? Qt.PointingHandCursor : mousesurface.cursorShape
		onPressed: root.drag(mouse.y)
		onPressAndHold: root.drag(mouse.y)
		onPositionChanged: root.drag(mouse.y)
		onReleased: root.drag(mouse.y)
	}
}
