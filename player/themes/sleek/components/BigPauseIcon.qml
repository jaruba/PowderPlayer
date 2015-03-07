import QtQuick 2.1
import QmlVlc 0.1

// Draw Pause Icon (appears in center of screen when Toggle Pause)
Rectangle {
	property alias icon: icon.text
	property alias iconColor: icon.color

	anchors.centerIn: parent
	visible: false
	height: fullscreen ? settings.gobigpause ? 170 : 85 : settings.gobigpause ? 150 : 75
	width: fullscreen ? settings.gobigpause ? 170 : 85 : settings.gobigpause ? 150 : 75
	opacity: settings.gobigpause ? 0 : 1
	radius: 10
	smooth: true
	
	// Start Play Icon Effect when Visible
	Behavior on height { PropertyAnimation { duration: 300 } }
	Behavior on width { PropertyAnimation { duration: 300 } }
	Behavior on opacity { PropertyAnimation { duration: 300 } }
	// End Play Icon Effect when Visible

	Text {
		id: icon
		anchors.centerIn: parent
		font.family: fonts.icons.name
		text: UI.icon.bigPause
		font.pointSize: fullscreen ? settings.gobigpause ? 92 : 46 : settings.gobigpause ? 72 : 36
		opacity: settings.gobigpause ? 0 : 1

		// Start Play Icon Effect when Visible
		Behavior on font.pointSize { PropertyAnimation { duration: 300 } }
		Behavior on opacity { PropertyAnimation { duration: 300 } }
		// End Play Icon Effect when Visible
	}
	
	// Start Timer to Hide Big Pause Icon after 300ms
	Timer  {
		interval: 300; running: settings.gobigpause ? true : false; repeat: false
		onTriggered: {
			pausetog.visible = false;
			settings.gobigpause = false;
		}
	}
	// End Timer to Hide Big Pause Icon after 300ms
}
// End Draw Pause Icon (appears in center of screen when Toggle Pause)