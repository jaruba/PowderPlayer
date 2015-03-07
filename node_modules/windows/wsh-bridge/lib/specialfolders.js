var wshrun = require('./wshrun')
  , util = require('util')
  , fs = require('fs')

wshrun('./jscript/specialfolders.js', function(paths){
	console.log(paths)
	console.log(fs.readdirSync(paths.Recent));
});