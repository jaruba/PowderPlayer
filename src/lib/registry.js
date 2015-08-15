function writeDesktopFile(cb) {
    var powderPath = process.execPath.substr(0,process.execPath.lastIndexOf("/")+1);
    fs.writeFile(gui.App.dataPath+'/powder.desktop', '[Desktop Entry]\nVersion=1.0\nName=Powder Player\nComment=Powder Player is a hybrid betwwn a Torrent Client and a Player (torrent streaming)\nExec='+process.execPath+' %U\nPath='+powderPath+'\nIcon='+powderPath+'icon.png\nTerminal=false\nType=Application\nMimeType=application/x-bittorrent;x-scheme-handler/magnet;video/avi;video/msvideo;video/x-msvideo;video/mp4;video/x-matroska;video/mpeg;\n', cb);
}

function regTorrent() {
	if (process.platform == 'linux') {
		writeDesktopFile(function(err) {
			if (err) throw err;
			var desktopFile = gui.App.dataPath+'/powder.desktop';
			var tempMime = 'application/x-bittorrent';
			require('child_process').exec('gnome-terminal -x bash -c "echo \'Associating Files or URls with Applications requires Admin Rights\'; echo; sudo echo; sudo echo \'Authentication Successful\'; sudo echo; sudo mv -f '+desktopFile+' /usr/share/applications; sudo xdg-mime default powder.desktop '+tempMime+'; sudo gvfs-mime --set '+tempMime+' powder.desktop; echo; echo \'Association Complete! Press any key to close ...\'; read" & disown');
		});
	} else {
		fs.writeFile(gui.App.dataPath+'\\register-torrent.reg', 'REGEDIT4\r\n[HKEY_CURRENT_USER\\Software\\Classes\\powder.player.v1\\DefaultIcon]\r\n@="'+process.execPath.split("\\").join("\\\\")+'"\r\n[HKEY_CURRENT_USER\\Software\\Classes\\powder.player.v1\\shell\\open\\command]\r\n@="\\"'+process.execPath.split("\\").join("\\\\")+'\\" \\"%1\\""\r\n[HKEY_CURRENT_USER\\Software\\Classes\\.torrent]\r\n@="powder.player.v1"\r\n"Content Type"="application/x-bittorrent"', function (err) {
			if (err) throw err;
			gui.Shell.openExternal(gui.App.dataPath+'\\register-torrent.reg');
		});
	}
}

function regVideos() {
	if (process.platform == 'linux') {
		writeDesktopFile(function(err) {
			if (err) throw err;
			var desktopFile = gui.App.dataPath+'/powder.desktop';
			var tempMimes = ['video/avi','video/msvideo','video/x-msvideo','video/mp4','video/x-matroska','video/mpeg'];
			var tempString = '';
			tempMimes.forEach(function(el) {
				tempString += '; sudo xdg-mime default powder.desktop '+el+'; sudo gvfs-mime --set '+el+' powder.desktop';
			});
			require('child_process').exec('gnome-terminal -x bash -c "echo \'Associating Files or URls with Applications requires Admin Rights\'; echo; sudo echo; sudo echo \'Authentication Successful\'; sudo echo; sudo mv -f '+desktopFile+' /usr/share/applications'+tempString+'; echo; echo \'Association Complete! Press any key to close ...\'; read" & disown');
		});
	} else {
		fs.writeFile(gui.App.dataPath+'\\register-videos.reg', 'REGEDIT4\r\n[HKEY_CURRENT_USER\\Software\\Classes\\powder.player.v1\\DefaultIcon]\r\n@="'+process.execPath.split("\\").join("\\\\")+'"\r\n[HKEY_CURRENT_USER\\Software\\Classes\\powder.player.v1\\shell\\open\\command]\r\n@="\\"'+process.execPath.split("\\").join("\\\\")+'\\" \\"%1\\""\r\n[HKEY_CURRENT_USER\\Software\\Classes\\.avi]\r\n@="powder.player.v1"\r\n"Content Type"="video/avi"\r\n[HKEY_CURRENT_USER\\Software\\Classes\\.mkv]\r\n@="powder.player.v1"\r\n"Content Type"="video/x-matroska"\r\n[HKEY_CURRENT_USER\\Software\\Classes\\.mp4]\r\n@="powder.player.v1"\r\n"Content Type"="video/mp4"', function (err) {
	        if (err) throw err;
	        gui.Shell.openExternal(gui.App.dataPath+'\\register-videos.reg'); 
	    });
	}
}

function regMagnet() {
	if (process.platform == 'linux') {
		writeDesktopFile(function(err) {
			if (err) throw err;
			var desktopFile = gui.App.dataPath+'/powder.desktop';
			var tempMime = 'x-scheme-handler/magnet';
			require('child_process').exec('gnome-terminal -x bash -c "echo \'Associating Files or URls with Applications requires Admin Rights\'; echo; sudo echo; sudo echo \'Authentication Successful\'; sudo echo; sudo mv -f '+desktopFile+' /usr/share/applications; sudo xdg-mime default powder.desktop '+tempMime+'; sudo gvfs-mime --set '+tempMime+' powder.desktop; echo; echo \'Association Complete! Press any key to close ...\'; read" & disown');
		});
	} else {
		fs.writeFile(gui.App.dataPath+'\\register-magnet.reg', 'REGEDIT4\r\n[HKEY_CLASSES_ROOT\\Magnet]\r\n@="URL:magnet Protocol"\r\n"Content Type"="application/x-magnet"\r\n"URL Protocol"=""\r\n\[HKEY_CLASSES_ROOT\\Magnet\\DefaultIcon]\r\n@="\\"'+process.execPath.split("\\").join("\\\\")+'\\"\r\n[HKEY_CLASSES_ROOT\\Magnet\\shell]\r\n[HKEY_CLASSES_ROOT\\Magnet\\shell\\open]\r\n[HKEY_CLASSES_ROOT\\Magnet\\shell\\open\\command]\r\n@="\\"'+process.execPath.split("\\").join("\\\\")+'\\" \\"%1\\""\r\n[HKEY_CURRENT_USER\\Software\\Classes\\Magnet]\r\n@="URL:magnet Protocol"\r\n"Content Type"="application/x-magnet"\r\n"URL Protocol"=""\r\n[HKEY_CURRENT_USER\\Software\\Classes\\Magnet\\DefaultIcon]\r\n@="\\"'+process.execPath.split("\\").join("\\\\")+'\\"\r\n[HKEY_CURRENT_USER\\Software\\Classes\\Magnet\\shell]\r\n[HKEY_CURRENT_USER\\Software\\Classes\\Magnet\\shell\\open]\r\n[HKEY_CURRENT_USER\\Software\\Classes\\Magnet\\shell\\open\\command]\r\n@="\\"'+process.execPath.split("\\").join("\\\\")+'\\" \\"%1\\""', function (err) {
	        if (err) throw err;
	        gui.Shell.openExternal(gui.App.dataPath+'\\register-magnet.reg'); 
	    });
	}
}
