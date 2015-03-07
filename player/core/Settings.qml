import QtQuick 2.1

QtObject {
	property alias data: root;
	
	id: root;
	property var subNotifTimer: 0;
	property var gobigplay: false;
	property var gobigpause: false;
	property var dragging: false;
	property var ismoving: 1;
	property var buffering: 0;
	property var autoloop: 0;
	property var automute: 0;
	property var autoplay: 0;
	property var allowfullscreen: 1;
	property var playlistmenu: false;
	property var subtitlemenu: false;
	property var totalSubs: 0;
	property var title: "";
    property var multiscreen: 0;
	property var timervolume: 0;
	property var glyphsLoaded: false;
	property var firsttime: 1;
	property var firstvolume: 1;
	property var cache: 0;
	property var lastTime: 0;
	property var cursorX: 0;
	property var cursorY: 0;
	property var contextmenu: false;
	property var curZoom: 0;
	property var curCrop: "Default";
	property var curAspect: "Default";
	property var mouseevents: 0;
	property var downloaded: 0;
	property var customLength: 0;
	property var oldLength: 0;
	property var errorLength: 0;
	property var newProgress: 0;
	property var openingText: "Loading Resource";
	property variant preventKey: [];
	property variant preventClicked: [];
	property variant aspectRatios: ["Default", "1:1", "4:3", "16:9", "16:10", "2.21:1", "2.35:1", "2.39:1", "5:4"];
	property variant crops: ["Default", "16:10", "16:9", "1.85:1", "2.21:1", "2.35:1", "2.39:1", "5:3", "4:3", "5:4", "1:1"];
	property variant zooms: [[1, "Default"], [2, "2x Double"], [0.25, "0.25x Quarter"], [0.5, "0.5x Half"]];
}