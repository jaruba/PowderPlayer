import QtQuick 2.1
import QmlVlc 0.1

Rectangle {
	width: parent.width
	anchors.bottom: parent.bottom
	anchors.bottomMargin: fullscreen ? 0 : parent.containsMouse ? 0 : -height
	color: "transparent"
	visible: settings.uiVisible == 0 ? false : settings.toolbar == 0 ? false : settings.multiscreen == 1 ? fullscreen ? true : false : true // Multiscreen - Edit
	opacity: fullscreen ? settings.ismoving > 5 ? 0 : 1 : 1
	Behavior on anchors.bottomMargin { PropertyAnimation { duration: settings.multiscreen == 0 ? 250 : 0 } }
	Behavior on opacity { PropertyAnimation { duration: 250 } }
}