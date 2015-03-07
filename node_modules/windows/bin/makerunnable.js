// ### Usage
// makerunnable somebin1.js [somebin2.js] ...

var path = require('path');


var resolve = require('../lib/utility').resolve;
var runnable = require('../lib/runnable');
var cwd = process.cwd();

var args = process.argv.slice(1);
if (path.resolve(args[0]) === __filename) {
  args.shift();
}

args = args.map(path.resolve);

runnable(args, function(result){
  result.forEach(console.log);
});