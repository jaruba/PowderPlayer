function checkUpdates() {
	checkInternet(function(isConnected) {
		if (isConnected) {
			$.ajax({ type: 'GET', url: window.atob("aHR0cDovL3Bvd2Rlci5tZWRpYS9sYXN0VmVyc2lvbg=="), global: false, cache: false,
				success: function(xhr) {
					if (xhr.replace(".","") != xhr && isNaN(xhr.split(".")[0]) === false && isNaN(xhr.split(".")[1]) === false && localStorage.powderVersion != xhr) {
						// there is a new version of powder
						
						$("#update-header").html("Update to Powder v"+xhr);
						var updater = gui.Window.open('app://powder/updater.html',{ width: 320, height: 133, icon: "icon.png", toolbar: false });
						
						updater.on('close', function() {
							fs.stat(gui.App.dataPath+pathBreak+'updater.exe', function(err,stat) {
								if (err == null) {
									if (localStorage.doUpdate == "1") win.close();
									else fs.unlink(gui.App.dataPath+pathBreak+'updater.exe');
								}
							});
							updater.close(true);
						});
					}
				}
			});
		}
	});
}
