import QtQuick 2.1
import QmlVlc 0.1

Rectangle {
	property alias icon: icon.text
	property alias iconSize: icon.font.pointSize
	property alias fontColor: toptext.color
	property alias backgroundColor: topBarBackground.color
	property alias isVisible: topBarBackground.visible
	
	anchors.fill: parent
	color: "transparent"
	Rectangle {
		id: topBarBackground
		visible: (vlcPlayer.state == 3 || vlcPlayer.state == 4 || vlcPlayer.state == 6) ? fullscreen ? true : false : false
		width: parent.width
		height: 34
		anchors.top: parent.top
		opacity: vlcPlayer.time == 0 ? 0 : fullscreen ? settings.ismoving > 5 ? 0 : 0.7 : 0.7
		Behavior on opacity { PropertyAnimation { duration: 250} }
	}
	Rectangle {
		visible: topBarBackground.visible
		width: parent.width
		height: 34
		color: 'transparent'
		anchors.top: parent.top
		opacity: vlcPlayer.time == 0 ? 0 : fullscreen ? settings.ismoving > 5 ? 0 : 1 : 1
		Behavior on opacity { PropertyAnimation { duration: 250} }
		Text {
			id: toptext
			anchors.verticalCenter: parent.verticalCenter
			anchors.left: parent.left;
			anchors.leftMargin: 14
			text: settings.title
			font.pointSize: 13
			font.family: fonts.defaultFont.name
		}
		Text {
			id: icon
			color: mouseAreaButton.containsMouse ? ui.colors.toolbar.buttonHover : ui.colors.toolbar.button
			anchors.verticalCenter: parent.verticalCenter
			anchors.right: parent.right;
			anchors.rightMargin: 14
			text: ""
			font.family: fonts.icons.name
		}
		MouseArea {
			id: mouseAreaButton
			cursorShape: mouseAreaButton.containsMouse ? Qt.PointingHandCursor : mousesurface.cursorShape
			anchors.fill: icon
			hoverEnabled: true
			onClicked: wjs.toggleSettings();
		}
		
	}
}