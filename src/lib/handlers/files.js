// drag and drop
// prevent default behavior from changing page on ped file
window.ondragover = function(e) { e.preventDefault(); return false };
window.ondrop = function(e) { e.preventDefault(); return false };

var holder = document.getElementById('holder');
holder.ondragover = function () { this.className = 'hover'; return false; };
holder.ondragleave = function () { this.className = ''; return false; };
holder.ondrop = function (e) {
  e.preventDefault();
  win.gui.focus();
  utils.resetPowGlobals();
  
  if (e.dataTransfer.files.length == 1) {
	  if (fs.lstatSync(e.dataTransfer.files[0].path).isDirectory()) {
		 fs.readdir(e.dataTransfer.files[0].path,function(rootPath) {
			return function(err,files){
				if(err) throw err;
				for (var i = 0; i < files.length; i++) files[i] = rootPath + pathBreak + files[i];
				load.multiple(files);
			}
		  }(e.dataTransfer.files[0].path));
	  } else load.url(e.dataTransfer.files[0].path);
  } else {
	  var newFiles = [];
	  for (var i = 0; i < e.dataTransfer.files.length; ++i) {
		  if (fs.lstatSync(e.dataTransfer.files[i].path).isDirectory()) {
			 fs.readdir(e.dataTransfer.files[i].path,function(rootPath) {
				return function(err,files){
					if(err) throw err;
					for (var i = 0; i < files.length; i++) files[i] = rootPath + pathBreak + files[i];
					load.multiple(files);
				}
			  }(e.dataTransfer.files[i].path));
		  } else newFiles[i] = e.dataTransfer.files[i].path;
	  }
	  if (newFiles.length) load.multiple(newFiles);
  }
  this.className = '';
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
	$("#lib-folder").text($(this).val());
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
	  if (["sub","srt","vtt"].indexOf(utils.parser(targetSub).extension()) > -1) {
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
		player.notify("Subtitle Loaded");
	  } else {
		  player.notify("Subtitle Unsupported");
	  }
});

function chooseFile(name) {
	$(name).trigger('click');
}