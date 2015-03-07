import QtQuick 2.1
import QmlVlc 0.1

Rectangle {
	property alias fontColor: buftext.color
	property alias fontShadow: bufshadow.color
	property alias changeText: buftext.text	
	
	anchors.fill: parent
	color: "transparent"
	Rectangle {
		visible: vlcPlayer.state == 1 ? true : settings.buffering > 0 && settings.buffering < 100 ? true : false
		color: 'transparent'
		width: fullscreen ? parent.width -4 : parent.width -2
		anchors.top: parent.top
		anchors.topMargin: fullscreen ? 37 : topText.isVisible ? 30 : 11
		anchors.horizontalCenter: parent.horizontalCenter
		Text {
			id: bufshadow
			visible: vlcPlayer.state == 1 ? true : settings.buffering > 0 && settings.buffering < 100 ? true : false
			anchors.horizontalCenter: parent.horizontalCenter
			text: buftext.text
			font.pointSize: buftext.font.pointSize
			style: Text.Outline
			styleColor: bufshadow.color
			font.weight: Font.DemiBold
			font.family: fonts.secondaryFont.name
			smooth: true
			opacity: 0.5
		}
	}
	Rectangle {
		visible: vlcPlayer.state == 1 ? true : settings.buffering > 0 && settings.buffering < 100 ? true : false
		color: 'transparent'
		width: parent.width
		anchors.top: parent.top
		anchors.topMargin: fullscreen ? 35 : topText.isVisible ? 28 : 10
		anchors.horizontalCenter: parent.horizontalCenter
		Text {
			id: buftext
			visible: vlcPlayer.state == 1 ? true : settings.buffering > 0 && settings.buffering < 100 ? true : false
			anchors.horizontalCenter: parent.horizontalCenter
			text: ""
			font.pointSize: fullscreen ? mousesurface.height * 0.030 : (mousesurface.height * 0.035) < 16 ? 16 : mousesurface.height * 0.035
			style: Text.Outline
			styleColor: bufshadow.color
			font.weight: Font.DemiBold
			font.family: fonts.secondaryFont.name
			smooth: true
		}
	}
}