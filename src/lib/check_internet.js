function checkInternet(cb) {
	require('dns').lookup('google.com',function(err) {
		if (err && err.code == "ENOTFOUND") {
			$('#internet-ok').hide();
			$('#internet-error').show(1);
			cb(false);
		} else {
			$('#internet-error').hide();
			$('#internet-ok').show(1);
			cb(true);
		}
	})
}