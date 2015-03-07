import QtQuick 2.1

// Declare Artwork Layer
Image {
	source: "";
	visible: false;
    smooth: true;
	anchors.centerIn: parent;
	width: parent.width;
	height: parent.height;
	fillMode: Image.PreserveAspectFit;
}
// End Artwork Layer