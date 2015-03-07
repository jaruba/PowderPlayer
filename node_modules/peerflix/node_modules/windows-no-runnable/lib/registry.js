var fs = require('fs');
var path = require('path');
var util = require('util');

var Command = require('./Command').Command;
var lazyProperty = require('./utility').lazyProperty;
var expand = require('./utility').expand;
var q = require('./utility').q;



module.exports = registry;


function registry(key, options){
  key = typeof key === 'string' ? resolve(key) : key.toString();
  var p = [q(key)];

  if (options) {

    options.recursive        && p.push('/s');
    options.search           && p.push('/f', q(options.search));
    options.in === 'keys'    && p.push('/k');
    options.in === 'values'  && p.push('/d');
    options.case             && p.push('/c');
    options.exact            && p.push('/e');
    options.type             && p.push('/t', options.type);

  } else {
    options = {};
  }

  var result = new Keyset(key);

  registry.query(p).reduce(function(current, line){
    if (line.substring(0, 5) === 'ERROR') {
      var err = new RegistryError(line.substring(7));
      throw err;
    }

    if (line.indexOf(key) === 0 && line !== key) {
      // all rehistry keysets report their full path, will start with the initial query
      if (options.recursive) {
        // a recursive search will fully explore the tree so no need for getters
        result[line.slice(key.length + 1)] = current = new Keyset(line);

      } else {
        // provide getters to simiulate fluent access
        Object.defineProperty(result, line.slice(key.length + 1), {
          get: function(){ return registry(line, options) },
          enumerable: true
        });
      }
    } else if (line.indexOf('    ') === 0) {
      var entry = new Entry(current, line);
      current[entry.name] = entry;
    }
    return current;
  }, result);

  return result;
}


var commands = [
  'query', 'add', 'delete', 'copy',
  'save', 'restore', 'load', 'unload',
  'compare', 'export', 'import', 'flags'
].map(function(s){ return registry[s] = new Command('reg '+s) });


var rootkeys = {
  HKLM: 'HKEY_LOCAL_MACHINE',
  HKCU: 'HKEY_CURRENT_USER',
  HKCR: 'HKEY_CLASSES_ROOT',
  HKU:  'HKEY_USERS',
  HKCC: 'HKEY_CURRENT_CONFIG',
};


function resolve(name){
  name = name.split(/[\\\/]/);
  if (name[0] in rootkeys) {
    name[0] = rootkeys[name[0]];
  }
  return name.join('\\');
}


function RegType(name, options){
  this.name = name;
  if (options) {
    options.parse && (this.parse = options.parse);
    options.format && (this.format = options.format);
  }
}

RegType.prototype = {
  constructor: RegType,
  parse: function parse(x){ return x },
  format: function format(x){ return util.inspect(x) }
};

RegType.types = {
  REG_SZ: new RegType('REG_SZ'),

  REG_QWORD: new RegType('REG_QWORD'),

  REG_MULTI_SZ: new RegType('REG_MULTI_SZ', {
    parse: function(x){ return x.split('\0') }
  }),

  REG_EXPAND_SZ: new RegType('REG_EXPAND_SZ', {
    parse: function(x){ return expandPath(x) }
  }),

  REG_DWORD: new RegType('REG_DWORD', {
    parse: function(x){ return parseInt(x) },
    format: function(x){ return '0x'+(0x1000000|x).toString(16).slice(1) }
  }),

  REG_NONE: new RegType('REG_NONE', {
    parse: function(x){ return new Buffer(x, 'binary') }
  }),

  REG_BINARY: new RegType('REG_BINARY', {
    parse: function(x){ return new Buffer(x, 'binary') }
  })
};

/**
 * Translate a JavaScript value into a RegType
 * @param  {Buffer|String|String[]|Number} value  Input JS value
 * @return {Object}   Object containing the name of the RegType and the translated JS value
 */
RegType.create = function create(value){
  var type = 'REG_SZ';

  if (Buffer.isBuffer(value)) {
    // Buffer -> Binary
    type = 'REG_BINARY';
    value = value.toString('binary');
  } else if (Array.isArray(value)) {
    // Array of strings/numbers -> null separated list
    type = 'REG_MULTI_SZ';
    value = value.join('\0');
  } else if (typeof value === 'number' || typeof value === 'boolean' || value > 0) {
    if (value !== value || value === Infinity || value === -Infinity) {
      // store NaN and Infinity as strings
      value = String(value);
    } else {
      // number
      type = 'REG_DWORD';
      value = +value;
    }
  } else if (typeof value === 'string' && ~value.indexOf) {
    var expansions = value.match(/%(.*)%/);
    if (expansions) {
      // %Variable% escaped by ^%Variable^%
      expansions = expansions.slice(1).reduce(function(count, expansion){
        if (expansion in process.env) {
          value.replace('%'+expansion+'%', '^%'+expansion+'^%');
          count++;
        }
        return count;
      }, 0);
      if (expansions) {
        type = 'REG_EXPAND_SZ';
      }
    }
  }

  if (~value.indexOf(' ')) {
    // quote and escape
    value = q(value);
  }

  return { type: type, value: value };
}

// Technically named "Key", Basically a registry folder
function Keyset(path){
  this.path = path;
  this.name = path.split('\\').pop();
}

Keyset.prototype = {
  constructor: Keyset,

  /**
   * Remove a Keyset recursively or a child
   * @param  {String} [name]   If given deletes a child Keyset or Value instead of this KeySet
   * @return {Boolean|String}  True or the returned error message.
   */
  remove: function remove(name){
    if (name && name in this) {
      return this[name].remove();
    } else {
      return SUCCESS(registry.delete(q(this.path), '/f'));
    }
  },

  /**
   * Add a new child to this Keyset
   * @param  {String} name  Name of the new child
   * @param  {Any}  [value] Creates an Entry if supplied, otherwise a Keyset
   * @return {[type]}
   */
  add: function add(name, value){
    if (value) {
      // individual value
      this[name] = new Entry(this, { name: name, value: value });
      var params = [
        q(this.path),           // parent's reg path
        '/v', q(name),          // quoted value
        '/t', this[name].type,  // RegType
        '/d', this[name].raw,   // registry formatted data
        '/f'
      ];
    } else {
      // new registry folder
      this[name] = new Keyset(q(this.path+'\\'+name));
      var params = this[name].path;
    }
    var result = SUCCESS(registry.add(params));
    if (result !== true) {
      // keep synched if fail
      delete this[name];
    }
    return result;
  }
};

lazyProperty(Keyset.prototype, ['path', 'name']);


function Entry(parent, input){
  if (Object.getPrototypeOf(this) !== Entry.prototype) {
    return new Entry(parent, input);
  }
  this.parent = parent;
  if (typeof input === 'object') {
    this.name    = input.name;
    this.value   = input.value;
    if (input instanceof Entry) {
      // cloning an existing Entry
      this.type  = input.type;
      this.raw   = input.raw;
    } else {
      // building a new Entry from scratch
      var value  = RegType.create(input.value);
      this.type  = value.type;
      this.raw   = value.value;
    }
  } else {
    // parsing a value from a registry return
    input = input.split('    ');
    this.name    = input[1];
    this.value   = input[2] in RegType.types ? RegType.types[input[2]].parse(input[3]) : input[3];
    this.type    = input[2];
    this.raw     = input[3];
  }
};

Entry.prototype = {
  constructor: Entry,

  /**
   * Remove the value from the registry. It's still available in JavaScript though
   * @return {[type]}
   */
  remove: function remove(){
    return SUCCESS(registry.delete(q(this.parent.path), '/v', q(this.name), '/f'));
  },

  inspect: function inspect(){
    return (RegType.types[this.type] ? RegType.types[this.type].format(this.value) : '');
  },

  valueOf: function valueOf(){
    return this.value;
  }
};

lazyProperty(Entry.prototype, ['parent', 'name', 'type', 'raw']);



function RegistryError(message){
  if (!(this instanceof Error)) {
    return new RegistryError(message);
  }
  if (message) {
    this.message = message;
  }
  var err = new Error(message);
  err.name = 'RegistryError';
  Object.defineProperty(this, 'stack', Object.getOwnPropertyDescriptor(err, 'stack'))
}

RegistryError.prototype = Object.create(Error.prototype, { name: { value: 'RegistryError' } });

lazyProperty(RegistryError.prototype, ['message']);


function SUCCESS(ret){
  ret = Array.isArray(ret) ? ret[0] : ret;
  if (ret.substring(0, 5) === 'Error') {
    return new RegistryError(ret.substring(7));
  } else {
    return ret === 'The operation completed successfully.' ? true : ret;
  }
}