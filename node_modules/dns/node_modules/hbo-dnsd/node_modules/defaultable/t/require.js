// defaultable require() wrapper tests
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

var m0dule = module;

test('require function', function(t) {
  var _require = require;
  defaultable({}, function(mod, exp, DEFS, require) {
    t.ok(require, 'Defaultable provides a require paramenter')
    t.type(require, 'function', 'provided require is a function')
    t.equal(require.length, _require.length, 'Proved require() has the correct arity')
    t.equal(require.name, _require.name, 'Provided require() is named correctly')
    t.isNot(require, _require, 'Provided require() is not the normal require()')
  })

  t.end();
})

test('Exporting required modules', function(t) {
  t.doesNotThrow(go, 'No problems with a defaultable re-exporting another defaultable');
  function go() {
    var mod;

    mod = require('./mod/defaultable_reexporter');
    t.type(mod.defaults, 'function', 'Re-exported defaults exists')
    t.ok(mod.defaults._defaultable, 'Re-exporteed .defaults are mine')
    t.equal(mod.defaultable_example, 'Defaultable dependency example', 'Re-exported defaults works')

    mod = mod.defaults({'value': 'New value'})
    t.type(mod.defaults, 'function', 'Re-exported re-defaulted defaults exists')
    t.ok(mod.defaults._defaultable, 'Re-exporteed re-defaulted .defaults are mine')
    t.equal(mod.defaultable_example, 'New value', 'Re-exported defaults override works')
  }

  t.end();
})

test('requiring defaultable modules passes defaults to them', function(t) {
  function i_require_stuff(_mod, exps, _DEF, require) {
    exps.is = require('./mod/is_defaultable');
    exps.is_not = require('./mod/is_not_defaultable');
    exps.legacy = require('./mod/legacy_defaults');
    exps.fresh  = require('./mod/fresh_defaultable');
  }

  var mod;
  var defs = { 'should': 'first' };

  t.doesNotThrow(function() { mod = D(m0dule, defs, i_require_stuff) }, 'Defaultable and non-defaultable modules are usable')

  check_mod('first');
  mod = mod.defaults({should:'second'});
  check_mod('second');
  mod = mod.defaults({should:'third'});
  check_mod('third');

  t.end();

  function check_mod(should_val) {
    t.type(mod.legacy.defaults, 'function', 'Legacy modules can export .defaults()')
    t.notOk(mod.legacy.defaults._defaultable, 'Legacy modules .defaults are not mine')
    t.throws(mod.legacy.defaults, 'Legacy .defaults() function runs like it always has')

    t.type(mod.is_not.get, 'function', 'Normal modules still export normally')
    t.equal(mod.is_not.get(), 'normal', 'Normal modules export normal stuff')
    t.notOk(mod.is_not.defaults, 'Normal modules do not have a defaults() function')
    t.equal(Object.keys(mod.is_not).length, 2, 'Normal modules export the same exact stuff')
    t.notOk(mod.is_not.req._defaultable, 'Normal modules require is not special')

    t.type(mod.is.get, 'function', 'Defaultable modules export normally')
    t.equal(mod.is.get('original'), 'value', 'Defaultable module still has its defaults')
    t.equal(mod.is.get('should'), should_val, 'Defaultable module inherits defaults with require() ' + should_val)
    t.type(mod.is.defaults, 'function', 'Defaultable modules still have defaults() functions')
    t.ok(mod.is.defaults._defaultable, 'Defaultable modules default() functions are recognizable')
    t.equal(Object.keys(mod.is).length, 3+1, 'Defaultable modules export the same stuff, plus defaults()')
    t.ok(mod.is.req._defaultable, 'Defaultable modules get the special require')
    t.equal(mod.is.dep(), 'Example dependency', 'Defaultable module can require stuff from node_modules/')

    t.type(mod.fresh.get, 'function', 'Fresh defaultable module still exports normally')
    t.type(mod.fresh.defaults, 'function', 'Fresh defaultable module still has defaults() function')
    t.ok(mod.fresh.defaults._defaultable, 'Fresh defautlable module defaults() is recognizable')
    t.equal(mod.fresh.get('should'), 'always fresh', 'Fresh defaultable module defauts not changed by require')

    var fresh2 = mod.fresh.defaults({'should':should_val});
    t.equal(fresh2.get('should'), should_val, 'Fresh defaultable module can set defaults normally')
  }
})
