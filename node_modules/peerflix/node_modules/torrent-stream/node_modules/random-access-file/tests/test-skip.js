var assert = require('assert');
var f = require('./file');

f.write(0, 'hello world', function() {
	f.read(6, 5, function(err, buffer) {
		assert(buffer.toString() === 'world');
		f.read(0, 5, function(err, buffer) {
			assert(buffer.toString() === 'hello');
			f.unlink(function() {
				process.exit(0);
			});
		});
	});
});

setTimeout(process.exit.bind(process, 1), 5000);