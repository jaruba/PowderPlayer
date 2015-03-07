import QtQuick 2.1
import QtQuick.Layouts 1.0

Rectangle {
	property alias linesColor: lines.color
	property alias linesOpacity: lines.opacity
	
	width: 120
	height: 20
	anchors.verticalCenter: parent.verticalCenter
	color: "transparent"
	RowLayout {
		spacing: 17
		height: 4
		anchors.left: parent.left
		anchors.leftMargin: 11
		Rectangle { id: lines; width: 2; height: parent.height; opacity: 0.7 }
		Rectangle { width: 2; height: parent.height; color: lines.color; opacity: lines.opacity }
		Rectangle { width: 2; height: parent.height; color: lines.color; opacity: lines.opacity }
		Rectangle { width: 2; height: parent.height; color: lines.color; opacity: lines.opacity }
		Rectangle { width: 2; height: parent.height; color: lines.color; opacity: lines.opacity }
		Rectangle { width: 2; height: parent.height; color: lines.color; opacity: lines.opacity }
	}
	RowLayout {
		spacing: 17
		height: 4
		anchors.bottom: parent.bottom
		anchors.left: parent.left
		anchors.leftMargin: 11
		Rectangle { width: 2; height: parent.height; color: lines.color; opacity: lines.opacity }
		Rectangle { width: 2; height: parent.height; color: lines.color; opacity: lines.opacity }
		Rectangle { width: 2; height: parent.height; color: lines.color; opacity: lines.opacity }
		Rectangle { width: 2; height: parent.height; color: lines.color; opacity: lines.opacity }
		Rectangle { width: 2; height: parent.height; color: lines.color; opacity: lines.opacity }
		Rectangle { width: 2; height: parent.height; color: lines.color; opacity: lines.opacity }
	}						
}
