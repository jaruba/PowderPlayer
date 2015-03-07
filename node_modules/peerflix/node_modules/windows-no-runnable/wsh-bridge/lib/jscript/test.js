var createShortcut = require('./createshortcut');

var shortcut = createShortcut.createShortcut({
	style: 'Hidden',
	location: 'Desktop',
	target: __filename,
	startIn: __dirname
});

console.log(shortcut.create(function(err, out){
	err && console.log(err);
	console.log(out);
}))