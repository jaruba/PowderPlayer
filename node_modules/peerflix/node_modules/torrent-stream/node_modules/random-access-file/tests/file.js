var randomAccessFile = require('../index');
var path = require('path');
var assert = require('assert');

var filename = path.join(__dirname, 'test');

try {
	require('fs').unlinkSync(filename);
} catch (err) {
}

module.exports = randomAccessFile(filename);
