function checkUpdates() {
	checkInternet(function(isConnected) {
		if (isConnected) {
			$.ajax({ type: 'GET', url: window.atob("aHR0cDovL3Bvd2Rlci5tZWRpYS9sYXN0VmVyc2lvbg=="), global: false, cache: false,
				success: function(xhr) {
					if (xhr.replace(".","") != xhr && isNaN(xhr.split(".")[0]) === false && isNaN(xhr.split(".")[1]) === false && localStorage.powderVersion != xhr) {
						// there is a new version of powder
						
						$("#update-header").html("Update to Powder v"+xhr);
						$("#open-update-player").trigger("click");
					}
				}
			});
		}
	});
}
