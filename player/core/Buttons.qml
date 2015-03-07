import QtQuick 2.1
import QmlVlc 0.1

Rectangle {
	// START BUTTON ACTIONS
	function clicked(action) {
	
		// send data back to On Page JavaScript for .onClicked
		fireQmlMessage("[clicked]"+action);
		// end send data back to On Page JavaScript for .onClicked

		if (contextblock.visible === true) contextblock.close();
		
		if (action == "play") if (typeof settings.preventClicked[action] === "undefined") {
			wjs.togPause();
		}
		if (action == "prev") if (typeof settings.preventClicked[action] === "undefined") {
			vlcPlayer.playlist.prev();
		}
		if (action == "next") if (typeof settings.preventClicked[action] === "undefined") {
			vlcPlayer.playlist.next();
		}
		if (action == "mute") if (typeof settings.preventClicked[action] === "undefined") {
			wjs.toggleMute();
		}
		if (action == "subtitles") if (typeof settings.preventClicked[action] === "undefined") {
			subMenu.toggleSubtitles();
		}
		if (action == "playlist") if (typeof settings.preventClicked[action] === "undefined") {
			wjs.togglePlaylist();
		}
		if (action == "fullscreen") if (typeof settings.preventClicked[action] === "undefined") {
			if (settings.allowfullscreen == 1) {
				fireQmlMessage("[check-fullscreen]");
				if (settings.multiscreen == 1) wjs.toggleMute(); // Multiscreen - Edit
			}
		}
	}
	// END BUTTON ACTIONS	
}