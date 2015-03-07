var exec = require('child_process').exec;
var fs = require('fs');
var path = require('path');

var exists = require('./utility').exists;
var lazyProperty = require('./utility').lazyProperty;


var q = require('./utility').q;
var slice = Function.prototype.call.bind(Array.prototype.slice);
var toString = Function.prototype.call.bind(Object.prototype.toString);

module.exports = {
  Command: Command,
  execSync: execSync
};


/**
 * Create a function that executes the given command when called, recursively joining params to a space delimeted argv list.
 * Will also have a build in `.help()` function.
 * @param {String}  name        The command name which will become the function's name as well with spaces replaced by underscores
 * @param {Boolean} splitLines  Whether to automatically split all reponses into an array of lines
 */
function Command(command, name, format){
  if (typeof name === 'function') {
    format = name;
    name = command;
  }
  name = (name || command).replace(/\s/g, '_');

  var cmd = eval('1&&function '+name+'(){var v=arguments;return (v[v.length-1] instanceof Function ? Command.prototype.async : Command.prototype.sync).apply('+name+',v)}');
  cmd.__proto__ = Command.prototype;
  cmd.command = command;
  if (typeof format === 'function') {
    Object.defineProperty(cmd, 'format', { value: format, writable: true, configurable: true });
  }
  return cmd;
}


Command.prototype = {
  __proto__: Function.prototype,
  constructor: Command,
  help: function help(){
    return execSync(this.name.replace(/_/g, ' '), arguments, '/?').trim().replace(/\r?\n/g);
  },
  async: function async(){
    var self = this, args = slice(arguments), callback = args.pop();
    exec(this.command+' '+makeParams(args), function(err,o,e){
      return err ? callback(err) : callback(null, self.format(e ? o ? o+'\r\n'+e : e : o));
    });
  },
  sync: function sync(){
    return this.format(execSync(this.command, arguments));
  },
  format: function format(s){
    return s.trim().split(/\r?\n/g);
  }
};

lazyProperty(Command.prototype, ['command']);



/**
 * Execute a command using cmd.exe synchronously
 * @params {Any[]}   Params will be recursively joined to a space delimeted argv list
 * @return {String}  return value of the command
 */
function execSync(){
  var f = 'sync' + Math.random();
  exec(makeParams(arguments)+' 1>'+f+' 2>&1 & ren '+f+' '+f+'_');
  f += '_';
  while (!exists(f));
  var output = fs.readFileSync(f, 'utf8');
  fs.unlinkSync(f);
  return output;
}

function applyable(o){
  return Array.isArray(o) || toString(o) === '[object Arguments]';
}

function makeParams(){
  var params = [];
  for (var k in arguments) {
    if (applyable(arguments[k])) {
      params.push(makeParams.apply(null, arguments[k]));
    } else {
      params.push(arguments[k]);
    }
  }
  return params.join(' ');
}
