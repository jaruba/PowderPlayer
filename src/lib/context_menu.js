
var ctxMenu = {

	_torrentMenu: new gui.Menu(),
	_audioMenu: new gui.Menu(),
	_subtitleMenu: new gui.Menu(),
	_aspectRatioMenu: new gui.Menu(),
	_cropMenu: new gui.Menu(),
	_zoomMenu: new gui.Menu(),
	playerMenu: new gui.Menu(),
	aspectRatios: ['Default','1:1','4:3','16:9','16:10','2.21:1','2.35:1','2.39:1','5:4'],
	crops: ['Default','16:10','16:9','1.85:1','2.21:1','2.35:1','2.39:1','5:3','4:3','5:4','1:1'],
	zooms: [['Default',1],['2x Double',2],['0.25x Quarter',0.25],['0.5x Half',0.5]],
	
	init: function() {

		// submenus
		saveCtx = this;
		
		this._audioMenu.append(new gui.MenuItem({
			label: 'Disable',
			type: 'checkbox',
			checked: true,
			click: function() { saveCtx.selectAudio(0); }
		}));
		
		this._subtitleMenu.append(new gui.MenuItem({
			label: 'Add Subtitle',
			click: function() { chooseFile('#subtitleDialog'); }
		}));		
		
		this._subtitleMenu.append(new gui.MenuItem({
			label: 'Enlarge',
			click: function() { player.keymap().trigger('alt + up'); }
		}));		
		
		this._subtitleMenu.append(new gui.MenuItem({
			label: 'Shrink',
			click: function() { player.keymap().trigger('alt + down'); }
		}));		
		
		this._subtitleMenu.append(new gui.MenuItem({
			label: 'Move Up',
			click: function() { player.keymap().trigger('shift + up'); }
		}));		
		
		this._subtitleMenu.append(new gui.MenuItem({
			label: 'Move Down',
			click: function() { player.keymap().trigger('shift + down'); }
		}));		
		
		this._torrentMenu.append(new gui.MenuItem({
			label: 'Torrent Data',
			click: function() {
				ui.goto.torrentData();
			}
		}));
		
		this._torrentMenu.append(new gui.MenuItem({
			label: 'Open Folder',
			click: function() {
				if (powGlobals.torrent.engine) {
					gui.Shell.openItem(powGlobals.torrent.engine.path+pathBreak+powGlobals.torrent.engine.torrent.name+pathBreak);
				}
			}
		}));
		
		this._torrentMenu.append(new gui.MenuItem({
			label: 'Download All',
			click: function() {
				if (powGlobals.torrent.engine) {
					for (ij = 0; typeof powGlobals.lists.files[ij] !== 'undefined'; ij++) ui.buttons.play(ij);
					player.notify("Downloading All Files");
				}
			}
		}));
		
		this._torrentMenu.append(new gui.MenuItem({
			label: 'Force Download',
			click: function() {
				if (powGlobals.torrent.engine) {
					powGlobals.torrent.engine.discover();
					powGlobals.torrent.engine.swarm.reconnectAll();
					player.notify("Throttling Download");
				}
			}
		}));
		
		this._torrentMenu.append(new gui.MenuItem({
			label: 'Speed Pulsing',
			type: 'checkbox',
			checked: true,
			click: function() {
				if (powGlobals.torrent.engine) ui.settings.switchPulsing();
			}
		}));

		this._torrentMenu.append(new gui.MenuItem({
			label: 'Close + Keep Files',
			click: function() {
				if (powGlobals.torrent.engine) win.closeProcedure(false);
			}
		}));
		
		this.aspectRatios.forEach(function(el,i) {
			mnOpts = {
				label: el,
				type: 'checkbox',
				click: function() { saveCtx.selectAspect(i); }
			};
			if (i == 0) mnOpts.checked = true;
			saveCtx._aspectRatioMenu.append(new gui.MenuItem(mnOpts));
		});
		
		this.crops.forEach(function(el,i) {
			mnOpts = {
				label: el,
				type: 'checkbox',
				click: function() { saveCtx.selectCrop(i); }
			};
			if (i == 0) mnOpts.checked = true;
			saveCtx._cropMenu.append(new gui.MenuItem(mnOpts));
		});
		
		this.zooms.forEach(function(el,i) {
			mnOpts = {
				label: el[0],
				type: 'checkbox',
				click: function() { saveCtx.selectZoom(i,el[1]); }
			};
			if (i == 0) mnOpts.checked = true;
			saveCtx._zoomMenu.append(new gui.MenuItem(mnOpts));
		});

		this.playerMenu.append(new gui.MenuItem({ label: 'Torrent', submenu: this._torrentMenu }));
		this.playerMenu.append(new gui.MenuItem({ type: 'separator' }));
		this.playerMenu.append(new gui.MenuItem({ label: 'Audio Tracks', submenu: this._audioMenu }));
		this.playerMenu.append(new gui.MenuItem({ label: 'Subtitles', submenu: this._subtitleMenu }));
		this.playerMenu.append(new gui.MenuItem({ type: 'separator' }));
		this.playerMenu.append(new gui.MenuItem({ label: 'Aspect Ratio', submenu: this._aspectRatioMenu }));
		this.playerMenu.append(new gui.MenuItem({ label: 'Crop', submenu: this._cropMenu }));
		this.playerMenu.append(new gui.MenuItem({ label: 'Zoom', submenu: this._zoomMenu }));
		this.playerMenu.append(new gui.MenuItem({ type: 'separator' }));
		
		this.playerMenu.append(new gui.MenuItem({
			label: 'See Hotkeys',
			click: function() {
				gui.Shell.openExternal('https://github.com/jaruba/PowderPlayer/wiki/Hotkeys');
			}
		}));
		
		this.playerMenu.append(new gui.MenuItem({
			label: 'Always on Top',
			type: 'checkbox',
			checked: false,
			click: function() {
				if (win.onTop) {
					clearTimeout(frameTimer);
					win.onTop = false;
					win.gui.setAlwaysOnTop(false);
					if (saveCtx.playerMenu.items[8].type == "checkbox" && saveCtx.playerMenu.items[8].checked) {
						saveCtx.playerMenu.items[8].checked = false;
					}
				} else {
					setTimeout(win.gui.setAlwaysOnTop(true),1);
					clearTimeout(frameTimer);
					frameTimer = setTimeout(function() { win.frame.hide(); },5000);
					win.onTop = true;
					if (saveCtx.playerMenu.items[8].type == "checkbox" && !saveCtx.playerMenu.items[8].checked) {
						saveCtx.playerMenu.items[8].checked = true;
					}
				}
			}
		}));
		
		this.playerMenu.append(new gui.MenuItem({
			label: 'Back to Menu',
			click: function() {
				ui.goto.mainMenu();
			}
		}));

	},
	
	reset: function(menus,sel) {
		saveCtx = this;
		menus.forEach(function(subMenu) {
			if (saveCtx.playerMenu.items[subMenu].submenu.items[sel] && saveCtx.playerMenu.items[subMenu].submenu.items[sel].type == "checkbox" && !saveCtx.playerMenu.items[subMenu].submenu.items[sel].checked) {
				saveCtx.playerMenu.items[subMenu].submenu.items.forEach(function(el,ij) {
					if (el.type == "checkbox") {
						if (ij == sel) el.checked = true;
						else if (el.checked) el.checked = false;
					}
				});
			}
		});
	},
	
	selectAudio: function(i) {
		saveCtx = this;
		this.playerMenu.items[2].submenu.items.forEach(function(el,ij) {
			if (el.type == "checkbox" && el.checked) el.checked = false;
		});
		if (saveCtx.playerMenu.items[2].submenu.items[i].type == "checkbox") saveCtx.playerMenu.items[2].submenu.items[i].checked = true;
		player.audioTrack(i);
	},
	
	selectAspect: function(i) {
		this.reset([6,7]);
		this.playerMenu.items[5].submenu.items.forEach(function(el,ij) {
			if (el.type == "checkbox" && el.checked) el.checked = false;
		});
		if (this.playerMenu.items[5].submenu.items[i].type == "checkbox") this.playerMenu.items[5].submenu.items[i].checked = true;
		player.aspectRatio(this.playerMenu.items[5].submenu.items[i].label);
	},
	
	selectCrop: function(i) {
		this.reset([5,7]);
		this.playerMenu.items[6].submenu.items.forEach(function(el,ij) {
			if (el.type == "checkbox" && el.checked) el.checked = false;
		});
		if (this.playerMenu.items[6].submenu.items[i].type == "checkbox") this.playerMenu.items[6].submenu.items[i].checked = true;
		player.crop(playerMenu.items[6].submenu.items[i].label);
	},
	
	selectZoom: function(i,newZoom) {
		this.reset([5,6]);
		this.playerMenu.items[7].submenu.items.forEach(function(el,ij) {
			if (el.type == "checkbox" && el.checked) el.checked = false;
		});
		if (this.playerMenu.items[7].submenu.items[i].type == "checkbox") this.playerMenu.items[7].submenu.items[i].checked = true;
		player.zoom(newZoom);
	},
	
	refresh: function() {
		this._audioMenu = new gui.Menu();
		saveCtx = this;
		for (i = 0; i < player.audioCount(); i++) {
			mnOpts = {
				label: player.audioDesc(i),
				type: 'checkbox',
				click: function(newAudio) { return function(event) { saveCtx.selectAudio(newAudio); } }(i)
			};
			if (i == 1) mnOpts.checked = true;
			this._audioMenu.append(new gui.MenuItem(mnOpts));
		}
		this.playerMenu.items[2].submenu = this._audioMenu;
		this.playerMenu.items[2].enabled = true;
		
		audioMenuBackup = this.playerMenu.items[2];
		
		this.playerMenu.removeAt(2);
		this.playerMenu.insert(audioMenuBackup,2);

		this.playerMenu.items[3].enabled = true;
	
		this.playerMenu.items[5].submenu.items.forEach(function(el,ij) { if (el.type == "checkbox" && el.checked) el.checked = false; });
		if (this.playerMenu.items[5].submenu.items[0].type == "checkbox") this.playerMenu.items[5].submenu.items[0].checked = true;
		this.playerMenu.items[5].enabled = true;
	
		this.playerMenu.items[6].submenu.items.forEach(function(el,ij) { if (el.type == "checkbox" && el.checked) el.checked = false; });
		if (this.playerMenu.items[6].submenu.items[0].type == "checkbox") this.playerMenu.items[6].submenu.items[0].checked = true;
		this.playerMenu.items[6].enabled = true;
	
		this.playerMenu.items[7].submenu.items.forEach(function(el,ij) { if (el.type == "checkbox" && el.checked) el.checked = false; });
		if (this.playerMenu.items[7].submenu.items[0].type == "checkbox") this.playerMenu.items[7].submenu.items[0].checked = true;
		this.playerMenu.items[7].enabled = true;
		
		if (powGlobals.torrent.engine) this.playerMenu.items[0].enabled = true;
		else this.playerMenu.items[0].enabled = false;
	},
	
	disable: function() {
		if (powGlobals.torrent.engine) this.playerMenu.items[0].enabled = true;
		else this.playerMenu.items[0].enabled = false;
		this.playerMenu.items[2].enabled = false;
		this.playerMenu.items[3].enabled = false;
		this.playerMenu.items[5].enabled = false;
		this.playerMenu.items[6].enabled = false;
		this.playerMenu.items[7].enabled = false;
	}

}

ctxMenu.init();
