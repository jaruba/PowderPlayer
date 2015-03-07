module.exports = (function() {
  var l = console.log;
  var assert = require("assert");
  var c = 0;
  var t = 0;
  function result(name, reset) {
    l("\n/*-----------------------");
    l(" * test: [ "+ name + " ]");
    l(" * result: "+ c + "/" + t + " ->" + parseInt(100*c/t) +'%' );
    if ( c > 0 && c == t) {
      l(" * perfect! ");
    } else {
      l(" * "+(t-c)+" test(s) FAILED.");
    }
    l(" *-----------------------*/\n");
    if (reset) {
      c = 0, t = 0;
    }
  }
  var ret = function() {
    var type = Array.prototype.shift.call(arguments);
    if (type == "result") {
      return result(arguments[0] || 'test', arguments[1] || false);
    }
    try {
      if (typeof assert[type] != "function") {
        throw new Error("[assert." + type + "] is not a function");
      }
      assert[type].apply(t, arguments);
      c++;
    } catch (e) {
      l(e.stack);
    }
    t++;
  }
  ret.exe = function(fn) {
    setTimeout(fn, 0);
  }
  return ret;
})();
