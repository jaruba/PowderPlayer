// drag and drop
// prevent default behavior from changing page on ped file
window.ondragover = function(e) { e.preventDefault(); return false };
window.ondrop = function(e) { e.preventDefault(); return false };

var holder = document.getElementById('holder');
holder.ondragover = function () { this.className = 'hover'; return false; };
holder.ondragleave = function () { this.className = ''; return false; };
holder.ondrop = function (e) {
  e.preventDefault();
  win.focus();
  resetPowGlobals();
  
  if (e.dataTransfer.files.length == 1) {
	  runURL(e.dataTransfer.files[0].path);
  } else {
	  var newFiles = [];
	  for (var i = 0; i < e.dataTransfer.files.length; ++i) newFiles[i] = e.dataTransfer.files[i].path;
	  runMultiple(newFiles);
  }
  this.className = '';
  return false;
  wjs().emitJsMessage("[refresh-playlist]");
};
// end drag and drop

$('#torrentDialog').change(function(evt) {
	var torDial = $(this);
	checkInternet(function(isConnected) {
		if (isConnected) {
			resetPowGlobals();
			if (torDial.val().indexOf(";") > -1) {
				runMultiple(torDial.val().split(";"));
			} else {
				runURL(torDial.val());
			}
			wjs().emitJsMessage("[refresh-playlist]");
		} else {
			$('.easy-modal-animated').trigger('openModal');
		}
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
	if ($(this).val().indexOf(";") > -1) {
		$(this).val().split(";").forEach(function(e) { playlistAddVideo(e); });
	} else {
		playlistAddVideo($(this).val());
	}
	wjs().emitJsMessage("[refresh-playlist]");
});

$('#fileDialog').change(function(evt) {
	resetPowGlobals();
	if ($(this).val().indexOf(";") > -1) {
		runMultiple($(this).val().split(";"));
	} else {
		runURL($(this).val());
	}
	wjs().emitJsMessage("[refresh-playlist]");
});


function chooseFile(name) {
	$(name).trigger('click');
}