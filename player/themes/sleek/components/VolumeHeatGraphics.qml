import QtQuick 2.1
import QmlVlc 0.1
import "./" as Loader

Rectangle {
	property alias volColor: backgroundColors.volColor
	property alias volume: moveposa.width
	property alias backgroundColor: root.color

	width: 120
	height: parent.height
	color: "transparent"

	Rectangle {
		id: root
		width: 120
		height: 8
		anchors.verticalCenter: parent.verticalCenter
		Rectangle {
			id: moveposa
			clip: true
			width: 0
			anchors.top: parent.top
			anchors.left: parent.left
			anchors.bottom: parent.bottom
			
			Loader.VolumeHeatColors { id: backgroundColors } // Draw Volume Heat Background Colors
			
		}
		Rectangle {
			id: movecura
			color: '#ffffff'
			width: 4
			height: 14
			anchors.verticalCenter: parent.verticalCenter
			anchors.left: parent.left
			anchors.leftMargin: moveposa.width
		}
	
	}
}