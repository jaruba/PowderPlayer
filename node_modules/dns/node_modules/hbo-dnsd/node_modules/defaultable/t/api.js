// defaultable main API tests
//
// Copyright 2011 Iris Couch
//
//    Licensed under the Apache License, Version 2.0 (the "License");
//    you may not use this file except in compliance with the License.
//    You may obtain a copy of the License at
//
//        http://www.apache.org/licenses/LICENSE-2.0
//
//    Unless required by applicable law or agreed to in writing, software
//    distributed under the License is distributed on an "AS IS" BASIS,
//    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//    See the License for the specific language governing permissions and
//    limitations under the License.

var test = require('tap').test
  , defaultable = require('../defaultable')
  , D = defaultable
  ;

test('Input validation', function(t) {
  var er = new Error('Defaults must be an object');
  function noop() {}

  function bad_defs(defs) {
    return make_bad_defs;
    function make_bad_defs() {
      return defaultable(defs, function(module, exports, DEFS) {});
    }
  }

  t.throws(bad_defs(null) , er, 'Throws for null defs');
  t.throws(bad_defs([1,2]), er, 'Throws for array defs');
  t.throws(bad_defs(noop) , er, 'Throws for function defs');
  t.throws(bad_defs()  , 'Undefined defaults is a problem');

  t.doesNotThrow(bad_defs({}), 'Empty defaults is no problem');

  t.end();
})

test('exports.default is not allowed', function(t) {
  var vals = [function() { return 'hi' }, 'some string', 23, null, undefined]

  t.plan(vals.length * 2);
  vals.forEach(function(val) {
    var msg = 'Exporting something called "defaults" is not allowed: ' + val;
    t.throws(export_defaults, msg);
    t.throws(mod_export_defaults, msg);

    function export_defaults() {
      defaultable({}, function(mods, exps) { exps.defaults = val })
    }

    function mod_export_defaults() {
      defaultable({}, function(module) { module.exports = { 'defaults': val } });
    }
  })
})

test('Flexible parameter order', function(t) {
  function my_mod(_mod, exp, defs) {
    exp.dir = function() { return defs.dir };
  }

  function justone () { api = D(my_mod) }
  function forward () { api = D({dir:'forward'}, my_mod) }
  function backward() { api = D(my_mod, {dir:'backward'}) }
  function withmod () {
    var mod = { 'exports': {} };
    defaultable(mod, {dir:'sideways'}, my_mod);
    api = mod.exports;
  }

  var api;

  api = null;
  t.doesNotThrow(justone, 'No defaults at all is ok');
  t.ok(api, 'No defaults returns the API');
  t.type(api.dir(), 'undefined', 'No defaults is just an empty object');

  api = null;
  t.doesNotThrow(forward, 'Defaults first is ok');
  t.ok(api, 'Defaults first returns the API');
  t.equal('forward', api.dir(), 'Defaults first works');

  api = null;
  t.doesNotThrow(withmod, 'With a module is ok')
  t.ok(api, 'With a module sets the API')
  t.equal(api.dir(), 'sideways', 'Using the module works')

  api = null;
  t.throws(backward, 'Defaults second is not ok');

  t.end();
})

test('Just using exports', function(t) {
  var api = defaultable({}, my_mod);
  function my_mod(module, exports) {
    function exports_func(input) { return input || true }
    exports.func = exports_func;
    exports.val = 23;
  }

  t.ok(api.func, 'Export functions via `exports`');
  t.ok(api.val, 'Export values via `exports`');

  t.isa(api.func, 'function', 'Export function via `exports`');
  t.equal(api.func.name, 'exports_func', 'Nothing wrapped in `exports`');
  t.equal(api.func.length, 1, 'Exported function in `exports` length');
  t.equal(api.func('hi'), 'hi', 'Export function via `exports` works');

  t.isa(api.val, 'number', 'Export values via `exports`');
  t.equal(api.val, 23, 'Export values work via `exports`');

  t.end();
})

test('Using module.exports', function(t) {
  var api, just_exports, just_module;

  function doesnt_replace(module, exports) {
    just_exports = exports;
    just_module = module;

    exports.val1 = 'val1';
    module.exports.val2 = 'val2';
  }

  function does_replace(module, exports) {
    just_exports = exports;
    just_module = module;

    exports.val1 = 'BAD';
    module.exports = {'val2': 'GOOD'};
  }

  just_exports = just_module = null;
  api = defaultable({}, doesnt_replace);
  t.equal(api.val1, 'val1', 'exports coexists with module.exports');
  t.equal(api.val2, 'val2', 'module.exports coexists with exports');
  t.same(just_module.exports, just_exports, 'module.exports and exports are the same');

  just_exports = just_module = null;
  api = defaultable({}, does_replace);
  t.ok(just_exports.val1, 'exports should still have val1');
  t.notOk(api.val1, 'api val1 should be missing');
  t.notOk(just_module.exports.val1, 'api module.exports.val1 was replaced away');

  t.equal(api.val2, 'GOOD', 'module.exports replacement works');
  t.same(Object.keys(api).length, 2, 'module.exports assignment'); // val2 and .defaults()

  t.end();
})
