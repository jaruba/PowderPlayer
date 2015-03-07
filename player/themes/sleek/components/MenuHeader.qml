import QtQuick 2.1

Rectangle {
	property alias text: headerText.text
	property alias textColor: headerText.color
	property alias backgroundColor: headerBack.color
	
	anchors.fill: parent
	anchors.centerIn: parent
	width: parent.width
	height: 26
	color: "transparent"
	// Top "Title" text Holder
	Rectangle {
		id: headerBack
		width: parent.width -44
		anchors.left: parent.left

		anchors.leftMargin: 0
		height: 26
		Text {
			id: headerText
			anchors.verticalCenter: parent.verticalCenter
			anchors.left: parent.left
			anchors.leftMargin: 12
			font.pointSize: 10
		}
	}
	// End Top "Title" text Holder
}