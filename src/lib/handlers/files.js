// drag and drop

// prevent default behavior from changing page on file drop
window.ondragover = function(e) { e.preventDefault(); return false };
window.ondrop = function(e) { e.preventDefault(); return false };

// drag and drop over main menu
var holder = document.getElementById('holder');
holder.ondragover = function () { this.className = 'hover'; return false; };
holder.ondragleave = function () { this.className = ''; return false; };
holder.ondrop = function(e) {
	win.gui.focus();
	this.className = '';
	e.preventDefault();
	if (e.dataTransfer.files.length > 0) {
		utils.resetPowGlobals();
		load.dropped(e.dataTransfer.files);
	} else {
		// drag and drop links
		// thanks @vankasteelj and @luigiplr
		droppedLink = e.dataTransfer.getData("text/plain");
		if (droppedLink) {
			utils.resetPowGlobals();
			load.url(droppedLink);
		}
	}
	return false;
};
// end drag and drop

$('#torrentDialog').change(function(evt) {
	var torDial = $(this);
	utils.checkInternet(function(isConnected) {
		if (isConnected) {
			utils.resetPowGlobals();
			if (torDial.val().indexOf(";") > -1) load.multiple(torDial.val().split(";"));
			else load.url(torDial.val());
		} else $('.easy-modal-animated').trigger('openModal');
	});
});

$('#libraryDialog').change(function(evt) {
	$("#lib-folder").text(i18n($(this).val()));
	localStorage.libDir = $(this).val();
});


$('#folderDialog').change(function(evt) {
	$("#def-folder").text($(this).val());
	localStorage.tmpDir = $(this).val();
});

$('#addPlaylistDialog').change(function(evt) {
	if ($(this).val().indexOf(";") > -1) $(this).val().split(";").forEach(function(e) { load.playlistItem(e); });
	else load.playlistItem($(this).val());
});

$('#fileDialog').change(function(evt) {
	utils.resetPowGlobals();
	if ($(this).val().indexOf(";") > -1) load.multiple($(this).val().split(";"));
	else load.url($(this).val());
});

$('#subtitleDialog').change(function(evt) {
	  var targetSub = $(this).val();
	  if (["sub","srt","vtt","gz"].indexOf(utils.parser(targetSub).extension()) > -1) {
		newString = '{"'+utils.parser(targetSub).filename()+'":"';
		if (targetSub.indexOf("/") > -1) newString += targetSub+'"}';
		else newString += targetSub.split('\\').join('\\\\')+'"}';
		newSettings = player.vlc.playlist.items[player.currentItem()].setting;
		if (utils.isJsonString(newSettings)) {
			newSettings = JSON.parse(newSettings);
			if (newSettings.subtitles) {
				oldString = JSON.stringify(newSettings.subtitles);
				newString = oldString.substr(0,oldString.length -1)+","+newString.substr(1);
			}
		} else newSettings = {};
		newSettings.subtitles = JSON.parse(newString);
		player.vlc.playlist.items[player.currentItem()].setting = JSON.stringify(newSettings);
		player.subTrack(player.subCount()-1);
		player.notify(i18n("Subtitle Loaded"));
	  } else if (["zip"].indexOf(utils.parser(targetSub).extension()) > -1) {
		require('subtitles-grouping/lib/retriever').retrieveSrt(targetSub,function(err,res,subnm) {
			if (subnm) {
				newString = '{"'+subnm.replace(/\.[^/.]+$/, "")+'":"';
				if (targetSub.indexOf("/") > -1) newString += targetSub+'"}';
				else newString += targetSub.split('\\').join('\\\\')+'"}';
				newSettings = player.vlc.playlist.items[player.currentItem()].setting;
				if (utils.isJsonString(newSettings)) {
					newSettings = JSON.parse(newSettings);
					if (newSettings.subtitles) {
						oldString = JSON.stringify(newSettings.subtitles);
						newString = oldString.substr(0,oldString.length -1)+","+newString.substr(1);
					}
				} else newSettings = {};
				newSettings.subtitles = JSON.parse(newString);
				player.vlc.playlist.items[player.currentItem()].setting = JSON.stringify(newSettings);
				player.subTrack(player.subCount()-1);
				player.notify(i18n("Subtitle Loaded"));
			}
	    },{ charset: window.localStorage.subEncoding });
	  } else {
		  player.notify(i18n("Subtitle Unsupported"));
	  }
});

function chooseFile(name) {
	$(name).trigger('click');
}
