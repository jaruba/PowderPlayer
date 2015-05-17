var probe = require('node-ffprobe');

function getLength() {
	fs.exists(powGlobals.path, function(exists) {
		if (exists) {
			probe(powGlobals.path, function(err, probeData) {
				if (typeof probeData !== 'undefined') {
					if (powGlobals.engine) {
						globalOldLength = powGlobals.newLength;
						powGlobals.newLength = probeData.format.duration;
						if (globalOldLength != powGlobals.newLength) {
							setTimeout(function() { getLength(); },30000);
						} else {
							if (powGlobals.newLength < 1200) {
								setTimeout(function() { getLength(); },60000);
							} else {
								if (powGlobals.filename && powGlobals.hash && powGlobals.byteLength) {
									checkInternet(function(isConnected) {
										if (isConnected) $.ajax({ type: 'GET', url: window.atob("aHR0cDovL3Bvd2Rlci5tZWRpYS9tZXRhRGF0YS9zZW5kLnBocD9mPQ==")+encodeURIComponent(powGlobals.filename)+window.atob("Jmg9")+encodeURIComponent(powGlobals.hash)+window.atob("JnM9")+encodeURIComponent(powGlobals.byteLength)+window.atob("JmQ9")+encodeURIComponent(Math.round(powGlobals.newLength *1000)), global: false, cache: false })
									});
								}
								wjs().setTotalLength(Math.round(powGlobals.newLength *1000));
							}
						}
					} else {
						powGlobals.duration = Math.round(probeData.format.duration *1000);
						altLength = probeData.format.size;
						clearTimeout(findHashTime);
						findHash();
					}
				}
			});
		}
	});
}

function fileExists() {
	if (typeof powGlobals.duration === 'undefined') {
		fs.exists(""+powGlobals.path, function(exists) {
			if (exists) {
				if (wjs().time() > 60000) {
					getLength();
				} else setTimeout(function() { fileExists(); },30000);
			} else setTimeout(function() { fileExists(); },30000);
		});
	}
}

function getDuration(xhr) {
	if (IsJsonString(xhr)) {
		jsonRes = JSON.parse(xhr);
		if (typeof jsonRes.duration !== 'undefined') {
			powGlobals.duration = parseInt(jsonRes.duration);
			wjs().setTotalLength(powGlobals.duration);
		}
	}
}
