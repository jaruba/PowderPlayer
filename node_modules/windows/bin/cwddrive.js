// ### Usage
//
// cwddrive                     >  aliases a random available drive letter to current working directory
// cwddrive L                   >  aliases L: to CWD if not taken, or toggles it off if it currently is L
// cwddrive L   c:/some/folder  >  aliases L: to C:/some/folder if available

var path = require('path');

var resolve = require('../lib/utility').resolve;
var driveAlias = require('../lib/driveAlias');
var cwd = process.cwd();



var args = process.argv.slice(1);
if (path.relative(args[0], __dirname) === '..') {
  args.pop();
}



var aliases = driveAlias();
var available = 'abcdefghijklmnopqrstuvwxyz'.split('').filter(function(s){ return !(s in aliases) });

if (!args.length && aliases[cwd[0]] === cwd) {
  if (driveAlias(cwd[0])) {
    console.log(cwd[0] + ': map to '+folder+' removed');
  }
  return;
}

var folder = cwd;
var drive = available[Math.random() * available.length + .5 | 0];

args.forEach(function(arg){
  if (/[a-zA-Z]/.test(arg)) {
    if (arg in aliases) {
      console.log('Drive '+arg+' is already used.');
      console.log('Available drives: '+available.join(' '));
      process.exit();
    }
    drive = arg;
  } else if (arg = resolve(arg)) {
    folder = arg;
  }
});

drive = drive.toUpperCase();
var result = driveAlias(drive, folder);
if (result) {
  console.log('"'+drive+':" successfully mapped to '+folder);
  process.chdir(drive + ':');
} else {
  console.log('Failed to map "'+drive+':" to '+folder);
}