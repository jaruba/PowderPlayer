var wshrun = require('./wshrun')

wshrun('./jscript/clip.js', function(clip){
	console.log(clip);
}, 'text');