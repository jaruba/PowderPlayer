import QtQuick 2.1
import QmlVlc 0.1

Rectangle {
	id: root
	anchors.top: parent.top
	anchors.topMargin: 0
	width: playlistblock.width < 694 ? (playlistblock.width -12) : 682
	height: 260
	visible: false
	color: "#292929"
	z: 10000
	
	Text {
		anchors.centerIn: parent
		text: "Scanning Library Folder for Episodes ..."
		color: ui.colors.playlistMenu.closeHover
		font.pointSize: 11;
	}

	MouseArea {
		hoverEnabled: true
		anchors.fill: parent
	}

}
