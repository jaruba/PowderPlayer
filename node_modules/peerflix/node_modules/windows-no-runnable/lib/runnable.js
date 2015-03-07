var path = require('path');
var fs = require('fs');


var exists = require('./utility').exists;
var resolve = require('./utility').resolve;


var PATH = process.env.Path.split(';').filter(function(s){ return ~s.indexOf('node') });




if (PATH.length === 1) {
  PATH = PATH[0];
} else if (PATH.length > 1) {
  var bin = PATH.filter(function(s){ return ~s.indexOf('bin') });
  if (bin.length === 1) {
    PATH = bin[0];
  } else if (bin.length > 1) {
    PATH = bin.map(function(s){ return path.relative(__filename, s) }).sort(function(a,b){ return a.length - b.length })[0]
  }
}
if (!exists(PATH)) {
  if (process.env.NODE_PATH) PATH = process.env.NODE_PATH
} else {
  throw new Error('Could not find a good path to install to');
}

module.exports = function runnable(files){
  return files.map(function(file){
    if (exists(file)) {
      var parts = {
        dir: path.dirname(file),
        base: path.basename(file),
        ext: path.extname(file)
      };
      parts.name = parts.base.slice(0, -parts.ext.length);
      console.log(parts);
      var cmdfile = path.resolve(PATH, parts.name+'.cmd');
      fs.writeFileSync(cmdfile, '@node "'+path.join(parts.dir, parts.base)+'" %*');
      return cmdfile + ' succesfully created';
    } else {
      return file + ' not found';
    }
  });
}

/*
var path = require('path');
var fs = require('fs');
var npm = require('npm');


var exists = require('./utility').exists;
var resolve = require('./utility').resolve;


module.exports = function runnable(files, callback){
  npm.load(function(e, npm){
    callback(files.map(function(file){
      if (exists(file)) {
        var parts = {
          dir: path.dirname(file),
          base: path.basename(file),
          ext: path.extname(file)
        };
        parts.name = parts.base.slice(0, -parts.ext.length);
        var cmdfile = resolve(npm.globalBin, parts.name+'.cmd');
        fs.writeFileSync(cmdfile, '@node "'+path.join(parts.dir, parts.base)+'" %*');
        return cmdfile + ' succesfully created';
      } else {
        return file + ' not found';
      }
    }));
  });
}
*/