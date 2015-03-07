import QtQuick 2.1
import QmlVlc 0.1

Rectangle {
	property alias srctime: srctime.text
	property alias fontColor: srctime.color
	property alias backgroundIcon: backgroundIcon.text
	property alias backgroundColor: backgroundIcon.color
	property alias backgroundBorder: backgroundIcon.styleColor
	property alias backgroundOpacity: backgroundIcon.opacity
	

	visible: settings.glyphsLoaded ? vlcPlayer.position > 0 ? settings.dragging ? true : progressBar.dragpos.containsMouse ? true : false : false : false
	anchors.bottom: parent.bottom
	anchors.bottomMargin: fullscreen ? 66 : 63
	anchors.left: parent.left
	anchors.leftMargin: srctime.text.length > 5 ? progressBar.dragpos.mouseX < 33 ? 3 : (progressBar.dragpos.mouseX +36) > theview.width ? (theview.width -65) : (progressBar.dragpos.mouseX -29) : progressBar.dragpos.mouseX < 23 ? -7 : (progressBar.dragpos.mouseX +25) > theview.width ? (theview.width -54) : (progressBar.dragpos.mouseX -30) // Move Time Chat Bubble dependant of Mouse Horizontal Position
	
	color: 'transparent'
	
	Rectangle {
		width: 62
		height: 25
		color: 'transparent'
		// Time Bubble Background Image
		Text {
			id: backgroundIcon
			anchors.centerIn: parent
			font.family: fonts.icons.name
			style: Text.Outline
			font.pointSize: 18
		}
		// End Time Bubble Background Image

		// Time Bubble Text
		Text {
			id: srctime
			anchors.top: parent.top
			anchors.topMargin: 3
			anchors.horizontalCenter: parent.horizontalCenter
			text: ""
			font.pointSize: 10
		}
		// End Time Bubble Text
	}
}
