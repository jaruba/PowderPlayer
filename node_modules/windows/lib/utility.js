var fs = require('fs');
var path = require('path');

var existsSync = fs.existsSync || path.existsSync;

module.exports = {
  arrayToObject: arrayToObject,
  lazyProperty: lazyProperty,
  expand: expand,
  resolve: resolve,
  exists: exists,
  q: q
};


function q(str){ return '"'+str.replace(/"/g, '\\\"')+'"' }

function arrayToObject(arr, callback){
  return arr.reduce(function(r,s){
    var result = callback(s);
    if (Array.isArray(result)) {
      r[result[0]] = result[1];
    }
    return r;
  }, {})
}

function lazyProperty(obj, name){
  if (Array.isArray(name)) {
    name.forEach(function(prop){ lazyProperty(obj, prop) });
    return obj;
  }
  var visible = name[0] === '$';
  name = visible ? name.slice(1) : name;
  Object.defineProperty(obj, name, {
    configurable: true,
    enumerable: visible,
    get: function(){},
    set: function(v){ Object.defineProperty(this, name, { value: v, writable: true }) }
  });
}


function exists(x){ return existsSync(path._makeLong(x)) }

function expand(str){
  return Object.keys(process.env).reduce(function(str, name){
    return str.replace(new RegExp('%'+name+'%', 'ig'), process.env[name]);
  }, str);
}

function resolve(x){
  var resolved = x;
  if (!exists(resolved)) {
    if (!exists(resolved = expand(x))) {
      return false
    }
  }
  return resolved;
}
