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
  , merge = defaultable.merge
  ;

test('Object merging validator', function(t) {
  var high = new Error('Bad merge high-priority');
  var low  = new Error('Bad merge low-priority');

  function go(high, low) {
    return function() { merge(high, low); }
  }

  t.throws(go(null, {}), high, 'Throws for null high priority')
  t.throws(go(1234, {}), high, 'Throws for number high priority')
  t.throws(go([12], {}), high, 'Throws for array high priority')
  t.throws(go('hi', {}), high, 'Throws for string high priority')

  t.throws(go({}, null), low, 'Throws for null low priority')
  t.throws(go({}, 1234), low, 'Throws for number low priority')
  t.throws(go({}, [12]), low, 'Throws for array low priority')
  t.throws(go({}, 'hi'), low, 'Throws for string low priority')

  t.end();
})

test('Object merging', function(t) {
  var orig = {foo:'foo', empty:'', is_false:false, is_null:null, obj:{from:'orig', level:'two'}, obj2: {will:'be overridden'}, obj3:'will die'}
  var newo = {bar:'bar', empty:'new empty'                     , obj:{from:'newo'}             , obj2: 'not anymore'         , obj3:{did:'replace'}};
  var fin = merge(newo, orig);

  t.equal(fin.is_false, false, 'Low priority falsy: false')
  t.equal(fin.is_null , null , 'Low priority falsy: null')
  t.equal(fin.bar     , 'bar', 'High priority with no low priority')
  t.equal(fin.foo     , 'foo', 'Low priority with no high priority')

  t.equal(fin.obj2, 'not anymore', 'Override an object with a non-object')
  t.type(fin.obj3, 'object', 'Override a non-object with an object')
  t.equal(fin.obj3.did, 'replace', 'Override a non-object with an object')

  t.type(fin.obj, 'object', 'Merge equal-level objects')
  t.equal(fin.obj.level, 'two', 'Keep low priority sub-object values')
  t.equal(fin.obj.from, 'newo', 'Override with high-priority sub-object values')

  t.end();
})
