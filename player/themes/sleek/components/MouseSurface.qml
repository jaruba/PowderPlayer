import QtQuick 2.1
import QmlVlc 0.1

MouseArea {
	cursorShape: vlcPlayer.time == 0 ? Qt.ArrowCursor : fullscreen ? settings.ismoving > 5 ? Qt.BlankCursor : Qt.ArrowCursor : settings.multiscreen == 1 ? Qt.PointingHandCursor : Qt.ArrowCursor
	hoverEnabled: true
	anchors.fill: parent
	focus: true
	acceptedButtons: Qt.LeftButton | Qt.RightButton
}