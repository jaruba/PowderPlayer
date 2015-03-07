import QtQuick 2.1

Rectangle {
	clip: true
	height: parent.height
	width: settings.firstvolume == 1 ? 0 : vlcPlayer.state <= 1 && volumeBorder.anchors.leftMargin == 0 ? 0 : mutebut.hover.containsMouse ? 120 : volumeMouse.dragger.containsMouse ? 120 : 0
	anchors.verticalCenter: parent.verticalCenter
	anchors.left: mutebut.right
	color: 'transparent'
	Behavior on width { PropertyAnimation { duration: vlcPlayer.state <= 1 && volumeBorder.anchors.leftMargin == 0 && width > 0 ? 0 : 250 } }
}
