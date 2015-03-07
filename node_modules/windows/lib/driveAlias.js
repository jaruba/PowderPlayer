var Command = require('./Command').Command;
var resolve = require('./utility').resolve;
var q = require('./utility').q;



module.exports = driveAlias;


function driveAlias(name, folder){
  switch (arguments.length) {
    case 0:
      // list
      return allDrives.cache = allDrives();
    case 1:
      // delete
      delete allDrives.cache[name[0]];
      return subst(drive(name), '/d')[0] || true;
    case 2:
      // set
      allDrives.cache[name[0]] = folder = resolve(folder);
      return subst(drive(name), q(folder))[0] || folder;
  }
}

var subst = new Command('subst');

var drives = new Command('fsutil fsinfo drives', 'drives', function(s){
  return s.trim().slice(8, -2).split(':\\ ');
});

function drive(name){ return name[0]+':' }

function allDrives(){
  var physical = drives();
  allDrives.cache = subst().reduce(function(r,s){
    if (s && (s = s.split(':\\: => ')).length) {
      r[s[0]] = s[1];
    }
    return r;
  }, {});
  physical.forEach(function(drive){
    if (!allDrives.cache[drive])  {
      allDrives.cache[drive] = drive + ':\\';
    }
  });
  return allDrives.cache;
}

allDrives.cache = {};