import QtQuick 2.1
import QmlVlc 0.1

Rectangle {
	property alias fontColor: volumebox.color
	property alias fontShadow: volumeBoxShadow.color
	property alias changeText: volumebox.text
	property alias shadowEffectDuration: shadowTextEffect.duration
	property alias textEffectDuration: volTextEffect.duration
	property alias shadowHolder: shadowHolder
	property alias textHolder: textHolder
	
	
	anchors.fill: parent
	color: "transparent"
	Rectangle {
		id: shadowHolder
		color: "transparent"
		opacity: 0
		anchors.right: parent.right
		anchors.rightMargin: fullscreen ? volumebox.paintedWidth +38 : volumebox.paintedWidth +24
		anchors.top: parent.top
		anchors.topMargin: fullscreen ? 37 : topText.isVisible ? 30 : 11
        Behavior on opacity { PropertyAnimation { id: shadowTextEffect; duration: 500 } }
		Text {
			id: volumeBoxShadow
			font.family: fonts.icons.name
			horizontalAlignment: Text.AlignHRight
			text: volumebox.text
			font.pointSize: fullscreen ? mousesurface.height * 0.045 : mousesurface.height * 0.055
			style: Text.Outline
			styleColor: volumeBoxShadow.color
			smooth: true
			opacity: 0.5
            Behavior on visible { PropertyAnimation { duration: 0 } }
		}
	}
	Rectangle {
		id: textHolder
		visible: true
		color: 'transparent'
		anchors.right: parent.right
		anchors.rightMargin: fullscreen ? volumebox.paintedWidth +40 : volumebox.paintedWidth +25
		anchors.top: parent.top
		anchors.topMargin: fullscreen ? 35 : topText.isVisible ? 28 : 10
		opacity: 0
		Behavior on opacity { PropertyAnimation { id: volTextEffect; duration: 0 } }
		Text {
			id: volumebox
			font.family: fonts.icons.name
			horizontalAlignment: Text.AlignHRight
			text: settings.glyphsLoaded ? ui.icon.subtitles : ""
			font.pointSize: fullscreen ? mousesurface.height * 0.045 : mousesurface.height * 0.055
			style: Text.Outline
			styleColor: volumeBoxShadow.color
			smooth: true
		}
	}
	// Fade Out Top Right text box after 3 seconds
	Timer {
		interval: 3000; running: settings.subNotifTimer == 1 ? true : false; repeat: false
		onTriggered: {
			shadowTextEffect.duration = 150;
			shadowHolder.opacity = 0;
			textHolder.opacity = 0;
			settings.timervolume = 0;
		}
	}
	// End Fade Out Top Right text box after 3 seconds
}