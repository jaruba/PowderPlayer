import QtQuick 2.1
import QmlVlc 0.1

// Declare Video Layer
VlcVideoSurface {
	source: vlcPlayer;
	anchors.centerIn: parent;
	anchors.top: parent.top;
	anchors.left: parent.left;
	width: parent.width;
	height: parent.height;
	fillMode: VlcVideoSurface.PreserveAspectFit
}
// End Video Layer