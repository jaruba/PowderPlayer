import QtQuick 2.1
import QmlVlc 0.1

// Draw Play Icon (appears in center of screen when Toggle Pause)
Rectangle {
	property alias icon: icon.text
	property alias iconColor: icon.color
	
	anchors.centerIn: parent
	visible: false
	height: fullscreen ? settings.gobigplay ? 170 : 85 : settings.gobigplay ? 150 : 75
	width: fullscreen ? settings.gobigplay ? 170 : 85 : settings.gobigplay ? 150 : 75
	opacity: settings.gobigplay ? 0 : 1
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
		text: UI.icon.bigPlay
		font.pointSize: fullscreen ? settings.gobigplay ? 108 : 54 : settings.gobigplay ? 90 : 45
		color: UI.colors.bigIcon
		opacity: settings.gobigplay ? 0 : 1

		// Start Play Icon Effect when Visible
		Behavior on font.pointSize { PropertyAnimation { duration: 300 } }
		Behavior on opacity { PropertyAnimation { duration: 300 } }
		// End Play Icon Effect when Visible
	}
	
	// Start Timer to Hide Big Play Icon after 300ms
	Timer  {
		interval: 320; running: settings.gobigplay ? true : false; repeat: false
		onTriggered: {
			playtog.visible = false;
			settings.gobigplay = false;
		}
	}
	// End Timer to Hide Big Play Icon after 300ms
}
// End Draw Play Icon (appears in center of screen when Toggle Pause)
