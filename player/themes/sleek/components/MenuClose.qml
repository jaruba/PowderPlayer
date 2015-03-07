import QtQuick 2.1

Rectangle {
	property alias icon: icon.text
	property alias iconSize: icon.font.pointSize
	property alias iconColor: icon.color
	property alias hover: mouseAreaClose

	anchors.right: parent.right
	anchors.rightMargin: 0
	width: 35
	height: 26
	color: mouseAreaClose.containsMouse ? "#232323" : "#2f2f2f";
	Text {
		id: icon
		anchors.centerIn: parent
		font.family: fonts.icons.name
		color: mouseAreaClose.containsMouse ? "#eaeaea" : "#c0c0c0"
	}
	MouseArea {
		id: mouseAreaClose
		anchors.fill: parent
		cursorShape: Qt.PointingHandCursor
		hoverEnabled: true
	}
}
