var Command = require('./Command').Command;
var arrayToObject = require('./utility').arrayToObject;


module.exports = {
  associations: handler('assoc'),
  fileTypes: handler('ftype')
};



function handler(cmd){
  var command = new Command(cmd);
  var cache;

  function list(){
    return cache = cache ? cache : arrayToObject(command(), splitAt('='));
  }

  function get(ext){
    if (cache && ext in cache) return cache[ext];
    var result = command(ext);
    return (Array.isArray(result) ? splitAt('=')(result[0]) : [,null])[1];
  }

  function set(ext, assoc){
    var param = ext+'='+assoc;
    var success = command(param) === param;
    success && cache && (cache[ext] = assoc);
    return success;
  }


  return function(ext, assoc){
    if (ext) {
      if (assoc) {
        return set(ext, assoc);
      } else {
        return get(ext);
      }
    } else {
      return list();
    }
  }
}


function splitAt(str){
  return splitAt[str] = str in splitAt ? splitAt[str] : function(s){
    var index = s.indexOf(str);
    if (~index) {
      return [s.slice(0, index), s.slice(index+1)];
    }
  }
}