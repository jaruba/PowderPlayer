import QtQuick 2.1
import QmlVlc 0.1

Rectangle {
	property alias bottomtab: bottomtab
	width: parent.width
	height: parent.height
	anchors.verticalCenter: parent.verticalCenter
	MouseArea {
		id: bottomtab
		hoverEnabled: true
		anchors.fill: parent
	}
}
