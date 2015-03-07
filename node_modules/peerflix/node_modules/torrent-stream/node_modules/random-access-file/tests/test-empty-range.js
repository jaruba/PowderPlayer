var assert = require('assert');
var f = require('./file');

f.read(10, 15, function(err) {
	assert(err);
	f.unlink(function() {
		process.exit(0);
	});
});

setTimeout(process.exit.bind(process, 1), 5000);