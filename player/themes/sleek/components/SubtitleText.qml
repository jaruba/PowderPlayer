import QtQuick 2.1
import QmlVlc 0.1

Rectangle {
	property alias fontColor: subtitlebox.color
	property alias fontShadow: subtitleboxShadow.color
	property alias changeText: subtitlebox.text
	
	anchors.fill: parent
	color: "transparent"
	Rectangle {
		visible: subtitlebox.text != "" ? true : false
		color: 'transparent'
		width: fullscreen ? parent.width -4 : parent.width -2
		anchors.bottom: parent.bottom
		anchors.bottomMargin: fullscreen ? subtitlebox.paintedHeight +46 : subtitlebox.paintedHeight +47
		anchors.left: parent.left
		anchors.leftMargin: fullscreen ? 4 : 2
		Text {
			id: subtitleboxShadow
			visible: subtitlebox.text != "" ? true : false
			anchors.horizontalCenter: parent.horizontalCenter
			horizontalAlignment: Text.AlignHCenter
			text: subtitlebox.text
			font.pointSize: fullscreen ? mousesurface.height * 0.033 : mousesurface.height * 0.037
			style: Text.Outline
			styleColor: subtitleboxShadow.color
			font.family: fonts.secondaryFont.name
			smooth: true
			opacity: 0.5
		}
	}
	Rectangle {
		visible: subtitlebox.text != "" ? true : false
		color: 'transparent'
		width: parent.width
		anchors.bottom: parent.bottom
		anchors.bottomMargin: subtitlebox.paintedHeight +48
		Text {
			id: subtitlebox
			visible: subtitlebox.text != "" ? true : false
			anchors.horizontalCenter: parent.horizontalCenter
			horizontalAlignment: Text.AlignHCenter
			text: ""
			font.pointSize: fullscreen ? mousesurface.height * 0.033 : mousesurface.height * 0.037
			style: Text.Outline
			styleColor: subtitleboxShadow.color
			font.weight: Font.DemiBold
			font.family: fonts.secondaryFont.name
			smooth: true
		}
	}
}