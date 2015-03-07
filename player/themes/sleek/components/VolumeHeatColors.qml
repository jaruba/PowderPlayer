import QtQuick 2.1

Rectangle {
	property alias volColor: volColor.color
	
	height: 8
	width: 116
	color: "transparent"
	
	Rectangle {
		id: volColor
		height: parent.width
		width: parent.height
		anchors.centerIn: parent
		rotation: 90
		color: "transparent"
	}
}