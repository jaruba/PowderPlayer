var playerMenu = new gui.Menu(),
	audioMenu = new gui.Menu(),
	aspectRatioMenu = new gui.Menu(),
	cropMenu = new gui.Menu(),
	zoomMenu = new gui.Menu(),
	aspectRatios = ['Default','1:1','4:3','16:9','16:10','2.21:1','2.35:1','2.39:1','5:4'],
	crops = ['Default','16:10','16:9','1.85:1','2.21:1','2.35:1','2.39:1','5:3','4:3','5:4','1:1'],
	zooms = [['Default',1],['2x Double',2],['0.25x Quarter',0.25],['0.5x Half',0.5]];

// submenus
audioMenu.append(new gui.MenuItem({
	label: 'Disable',
	type: 'checkbox',
	checked: true,
	click: function() { selectAudio(0); }
}));

aspectRatios.forEach(function(el,i) {
	mnOpts = {
		label: el,
		type: 'checkbox',
		click: function() { selectAspect(i); }
	};
	if (i == 0) mnOpts.checked = true;
	aspectRatioMenu.append(new gui.MenuItem(mnOpts));
});

crops.forEach(function(el,i) {
	mnOpts = {
		label: el,
		type: 'checkbox',
		click: function() { selectCrop(i); }
	};
	if (i == 0) mnOpts.checked = true;
	cropMenu.append(new gui.MenuItem(mnOpts));
});

zooms.forEach(function(el,i) {
	mnOpts = {
		label: el[0],
		type: 'checkbox',
		click: function() { selectZoom(i,el[1]); }
	};
	if (i == 0) mnOpts.checked = true;
	zoomMenu.append(new gui.MenuItem(mnOpts));
});

function resetMenus(menus,sel) {
	menus.forEach(function(subMenu) {
		if (playerMenu.items[subMenu].submenu.items[sel] && !playerMenu.items[subMenu].submenu.items[sel].checked) {
			playerMenu.items[subMenu].submenu.items.forEach(function(el,ij) {
				if (ij == sel) el.checked = true;
				else if (el.checked) el.checked = false;
			});
		}
	});
}

function selectAudio(i) {
	playerMenu.items[2].submenu.items.forEach(function(el,ij) {
		if (el.checked) el.checked = false;
	});
	playerMenu.items[2].submenu.items[i].checked = true;
	wjs().audioTrack(i);
}

function selectAspect(i) {
	resetMenus([5,6]);
	playerMenu.items[4].submenu.items.forEach(function(el,ij) {
		if (el.checked) el.checked = false;
	});
	playerMenu.items[4].submenu.items[i].checked = true;
	wjs().aspectRatio(playerMenu.items[4].submenu.items[i].label);
}

function selectCrop(i) {
	resetMenus([4,6]);
	playerMenu.items[5].submenu.items.forEach(function(el,ij) {
		if (el.checked) el.checked = false;
	});
	playerMenu.items[5].submenu.items[i].checked = true;
	wjs().crop(playerMenu.items[5].submenu.items[i].label);
}

function selectZoom(i,newZoom) {
	resetMenus([4,5]);
	playerMenu.items[6].submenu.items.forEach(function(el,ij) {
		if (el.checked) el.checked = false;
	});
	playerMenu.items[6].submenu.items[i].checked = true;
	wjs().zoom(newZoom);
}
// end submenus

// context menu
playerMenu.append(new gui.MenuItem({
	label: 'Torrent Data',
	click: function() { torrentData(); }
}));
playerMenu.append(new gui.MenuItem({ type: 'separator' }));
playerMenu.append(new gui.MenuItem({ label: 'Audio Tracks', submenu: audioMenu }));
playerMenu.append(new gui.MenuItem({ type: 'separator' }));
playerMenu.append(new gui.MenuItem({ label: 'Aspect Ratio', submenu: aspectRatioMenu }));
playerMenu.append(new gui.MenuItem({ label: 'Crop', submenu: cropMenu }));
playerMenu.append(new gui.MenuItem({ label: 'Zoom', submenu: zoomMenu }));
playerMenu.append(new gui.MenuItem({ type: 'separator' }));
playerMenu.append(new gui.MenuItem({
	label: 'Always on Top',
	type: 'checkbox',
	checked: false,
	click: function() {
		if (onTop) {
			clearTimeout(frameTimer);
			onTop = false;
			win.setAlwaysOnTop(false);
			if (playerMenu.items[6].checked) playerMenu.items[6].checked = false;
		} else {
			setTimeout(win.setAlwaysOnTop(true),1);
			clearTimeout(frameTimer);
			frameTimer = setTimeout(function() { hideFrame(); },5000);
			onTop = true;
			if (!playerMenu.items[6].checked) playerMenu.items[6].checked = true;
		}
	}
}));
playerMenu.append(new gui.MenuItem({
	label: 'Back to Menu',
	click: function() {
		goBack();
	}
}));

function refreshCtxMenu() {
	audioMenu = new gui.Menu();
	for (i = 0; i < player.audioCount(); i++) {
		mnOpts = {
			label: player.audioDesc(i),
			type: 'checkbox',
			click: function(newAudio) { return function(event) { selectAudio(newAudio); } }(i)
		};
		if (i == 1) mnOpts.checked = true;
		audioMenu.append(new gui.MenuItem(mnOpts));
	}
	playerMenu.items[2].submenu = audioMenu;
	playerMenu.items[2].enabled = true;
	
	audioMenuBackup = playerMenu.items[2];
	
	playerMenu.removeAt(2);
	playerMenu.insert(audioMenuBackup,2);

	playerMenu.items[4].submenu.items.forEach(function(el,ij) { if (el.checked) el.checked = false; });
	playerMenu.items[4].submenu.items[0].checked = true;
	playerMenu.items[4].enabled = true;

	playerMenu.items[5].submenu.items.forEach(function(el,ij) { if (el.checked) el.checked = false; });
	playerMenu.items[5].submenu.items[0].checked = true;
	playerMenu.items[5].enabled = true;

	playerMenu.items[6].submenu.items.forEach(function(el,ij) { if (el.checked) el.checked = false; });
	playerMenu.items[6].submenu.items[0].checked = true;
	playerMenu.items[6].enabled = true;
	
	if (powGlobals.engine) playerMenu.items[0].enabled = true;
	else playerMenu.items[0].enabled = false;
}

function disableCtxMenu() {
	if (powGlobals.engine) playerMenu.items[0].enabled = true;
	else playerMenu.items[0].enabled = false;
	playerMenu.items[2].enabled = false;
	playerMenu.items[4].enabled = false;
	playerMenu.items[5].enabled = false;
	playerMenu.items[6].enabled = false;
}
// end context menu
