var path = require('path'),
	plugins = { };

function getPlugins(srcpath) {
  return fs.readdirSync(srcpath).filter(function(file) {
    return fs.statSync(path.join(srcpath, file)).isDirectory();
  });
}

function loadPlugins() {
	getPlugins(gui.App.dataPath+pathBreak+'plugins'+pathBreak).forEach(function(el) {
		if (fs.existsSync(gui.App.dataPath+pathBreak+'plugins'+pathBreak+el+pathBreak+'index.js')) {
			plugins[el] = require(gui.App.dataPath+pathBreak+'plugins'+pathBreak+el+pathBreak+'index.js');
			if (plugins[el].init) plugins[el].init();
		}
	});
}

//fs.exists(gui.App.dataPath+pathBreak+'plugins', function (exists) {
//	if (!exists) {
//		fs.mkdir(gui.App.dataPath+pathBreak+'plugins',function() {
//			loadPlugins();
//		});
//	} else loadPlugins();
//});
