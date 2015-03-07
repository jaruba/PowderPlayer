import QtQuick 2.1
import QmlVlc 0.1
import QtGraphicalEffects 1.0

Rectangle {
	property alias icon: icon.text
	property alias iconSize: icon.font.pointSize
	property alias iconElem: icon
	property alias hover: mouseAreaButton
	property alias glow: glowEffect.visible
	signal buttonClicked
	signal buttonEntered
	signal buttonExited
	
	id: root
	height: parent.height
	width: buttonWidth
	clip: false
	color: 'transparent'
	Text {
		id: icon
		anchors.centerIn: parent
		font.family: fonts.icons.name
		color: mouseAreaButton.containsMouse ? ui.colors.toolbar.buttonHover : ui.colors.toolbar.button
		height: paintedHeight + (glowEffect.radius * 2)
        width: paintedWidth + (glowEffect.radius * 2)
		horizontalAlignment: Text.AlignHCenter
        verticalAlignment: Text.AlignVCenter
	}
	Glow {
		id: glowEffect
        anchors.fill: icon
		visible: mouseAreaButton.containsMouse ? true : false
        radius: 2
        samples: 4
		smooth: true
        color: Qt.rgba(255, 255, 255, 0.6)
        source: icon
    }
	MouseArea {
		id: mouseAreaButton
		cursorShape: toolbar.opacity == 1 ? Qt.PointingHandCursor : mousesurface.cursorShape
		anchors.fill: parent
		hoverEnabled: true
		onClicked: root.buttonClicked()
		onEntered: root.buttonEntered()
		onExited: root.buttonExited()
	}
}