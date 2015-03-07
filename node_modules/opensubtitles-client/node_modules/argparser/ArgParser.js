function ArgParser() {
  this._valopts    = {s: [], l: []};
  this._opts = {s: [], l: []};
  this._options    = {};
  this._args       = [];
  this._invalids   = [];
  this._defaults = {};

  this.emptyValue = false;
  this._files = [];
  this._dirs  = [];
  this._nums  = [];
  this._err   = null;
  this._min   = null;
  this._max   = null;
}

ArgParser.create = function() {
  return new ArgParser().addValueOptions(Array.prototype.slice.call(arguments));
};

// get options ( getOptions("s") ...
ArgParser.prototype.getOptions  = function() {
  if (arguments.length == 0) {
    return this._options;
  }
  var ret = null;
  const that = this;
  Array.prototype.forEach.call(arguments, function(arg) {
    ret = ret || that._options[arg];
  });
  return ret;
};
// syntax sugar
ArgParser.prototype.opt = ArgParser.prototype.getOptions;


// get arguments getArgs(0), getArgs(1) ...
ArgParser.prototype.getArgs = function(n) {
  return (n == null) ? this._args: this._args[n];
};
// syntax sugar
ArgParser.prototype.arg = ArgParser.prototype.getArgs;

// stringify current options
ArgParser.prototype.stringifyOptions = function() {
  var that = this;
  return ['_opts', '_valopts'].map(function(opts) {
    return Object.keys(that[opts]).map(function(sl) {
      return that[opts][sl]
      .filter(function(k) {
        return (that._options[k] !== false);
      })
      .map(function(k) {
        return (( (sl == 's') ? '-'+k : '--'+k ) + ( (opts == '_opts') ? '' : (' ' + that._options[k]))).replace(/ +$/, '');
      }).join(' ');
    }).join(' ').replace(/ +$/, '');
  }).join(' ').replace(/ +$/, '');
};

// stringify current options and args
ArgParser.prototype.stringify = function() {
  return this.stringifyOptions() + ' ' + this._args.join(' ');
};

// get invalid options given
ArgParser.prototype.getInvalids = function(n) {
  return (n == null) ? this._invalids : this._invalids[n];
};

ArgParser.prototype.invalids = function() { return this._invalids };


// set options which requires a value
ArgParser.prototype.addValueOptions = function() {
  var arr = (Array.isArray(arguments[0])) ? arguments[0] : Array.prototype.slice.call(arguments);
  arr.forEach(function(opt) {
    this._valopts[(opt.length == 1) ? 's' : 'l'].push(opt);
  }, this);
  return this;
};
// syntax sugar
ArgParser.prototype.vals = ArgParser.prototype.addValueOptions;


// set args | options which requires (a file | a directory | a number)
['files', 'dirs', 'nums'].forEach(function(name) {
  var _name = "_" + name;
  // register required file nums
  ArgParser.prototype[name] = function() {
    var valueOptions = [];
    var arr = (Array.isArray(arguments[0])) ? arguments[0] : Array.prototype.slice.call(arguments);
    arr.forEach(function(v) {
      this[_name].push(v);
      if (typeof v == "string") valueOptions.push(v);
    }, this);
    return valueOptions.length ? this.addValueOptions(valueOptions) : this;
  };
});


// set defaults
ArgParser.prototype.defaults = function(obj, noSetNums) {
  var keys = Object.keys(obj);
  var nums = [];
  keys.forEach(function(k) {
    var val = obj[k];
    var s_l = (k.length == 1) ? 's' : 'l';
    if (this._opts[s_l].indexOf(k) >= 0) {
      throw new Error("nonvals options cannot have default value.");
    }

    if (typeof val == "number") nums.push(k);
    this._defaults[k] = val;
  }, this);
  if (!noSetNums && nums.length) {
    this.nums(nums);
  }
  return this.addValueOptions(keys);
};


// set options which requires no values
ArgParser.prototype.addOptions = function() {
  var arr = (Array.isArray(arguments[0])) ? arguments[0] : Array.prototype.slice.call(arguments);
  arr.forEach(function(opt) {
    this._opts[(opt.length == 1) ? 's' : 'l'].push(opt);
  }, this);
  return this;
};

// syntax sugar
ArgParser.prototype.nonvals = ArgParser.prototype.addOptions;

// register function called after error (in parsing)
ArgParser.prototype.err = function(err) {
  if (typeof err == "function") this._err = err;
  return this;
};


// register argument nums
ArgParser.prototype.arglen = function(min, max) {
  if (typeof min == "number") this._min = min;
  if (typeof max == "number") this._max = max;
  return this;
};


// parse argv
ArgParser.prototype.parse = function(arr) {
  /* clear past data */
  this._options  = {};
  this._args     = [];
  this._invalids = [];

  /* check arguments */
  if (! (arr instanceof Array)) {
    arr = [];
    process.argv.forEach(function(v, k) {
      if (k >= 2) arr.push(v);
    });
  }

  /* set default values */
  var that = this; // for shortcut access to this
  ['_opts', '_valopts'].forEach(function(opts) {
    ['s', 'l'].forEach(function(sl) {
      that[opts][sl].forEach(function(opt) {
        that._options[opt] = (that._defaults[opt] != undefined) ? that._defaults[opt] : that.emptyValue;
      });
    });
  });


  /* parse arguments */
  var vopt;
  arr.forEach(function(val) {
    /* if option with value is set */
    if (vopt) {
      that._options[vopt] = val;
      vopt = null;
      return;
    }

    /* short option parsing */
    if (val.match(/^-[a-zA-Z0-9_]$/)) {
      var optname = val.charAt(1);
      if (that._valopts.s.indexOf(optname) >= 0) {
        vopt = optname;
        return;
      }
      else if (that._opts.s.indexOf(optname) >= 0) {
        that._options[optname] = true;
        return;
      }
      else { // invalid option
        that._options[optname] = true;
        that._invalids.push(optname);
        return;
      }
    }

    /* long option parsing */
    if (val.match(/^--[a-zA-Z0-9_-]+$/)) {
      var optname = val.slice(2);
      if (that._valopts.l.indexOf(optname) >= 0) {
        vopt = optname;
        return;
      }
      else if (that._opts.l.indexOf(optname) >= 0) {
        that._options[optname] = true;
        return;
      }
      else {
        that._options[optname] = true;
        that._invalids.push(optname);
        return;
      }
    }

    /* arguments */
    that._args.push(val);
  });

  var path = require('path'), fs = require('fs');

  try {

    // check file existence
    this._files.forEach(function(v) {
      if (typeof v == "string" && this.getOptions(v) === this.emptyValue) return;
      var f = (typeof v == "number") ? this.getArgs(v) : this.getOptions(v);
      if (f == '-') return;
      try{if(!fs.statSync(f).isFile()){throw 1}}catch(e){throw new Error(f + ": no such file or directory (in args " + v + ')');}
    }, this);
    
    // check dir existence
    this._dirs.forEach(function(v) {
      if (typeof v == "string" && this.getOptions(v) === this.emptyValue) return;
      var d = (typeof v == "number") ? this.getArgs(v) : this.getOptions(v);
      try{if(!fs.statSync(d).isDirectory()){throw 1}}catch(e){throw new Error(d + ": no such file or directory (in args " + v + ')');}
    }, this);

    // Numberize
    this._nums.forEach(function(v) {
      if (typeof v == "string" && this.getOptions(v) === this.emptyValue) return;
      var num = Number( (typeof v == "number") ? this.getArgs(v) : this.getOptions(v) );
      if (isNaN(num)) throw new Error('the arg ' + v +' must be a number.');
      if (typeof v == "number") this._args[v] = num;
      else                      this._options[v] = num;
    }, this);

    // check argument length
    if (this._min != null && this._min > this._args.length)
      throw new Error('required at least ' + this._min + ' argument(s)'); 

    if (this._max != null && this._max < this._args.length)
      throw new Error('required at most ' + this._max + ' argument(s)'); 
  }
  catch (e) {
    if (!this._err) throw e;
    var ret = this._err(e);
    return (ret == undefined) ? false : ret;
  }

  return this;
};

ArgParser.getOptionString = function(obj) {
  var ret = [];
  Object.keys(obj).forEach(function(opt) {
    if (obj[opt] === null || obj[opt] === false) return;
    ret.push( ((opt.length == 1) ? '-' : '--') + opt + ' ' + obj[opt]);
  });
  return ret.join(' ');
};

/**
 * register shortcut
 **/
Object.keys(ArgParser.prototype).forEach(function(methodName) {
  if (ArgParser[methodName]) return;
  ArgParser[methodName] = function() {
    var ap = new ArgParser();
    ap[methodName].apply(ap, arguments);
    return ap;
  };
});

module.exports = ArgParser;
