// defaultable defaults tests
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


function my_mod(module, exports, DEFS) {
  exports.get = function(key) { return DEFS[key] }
}


test('Defaulting API', function(t) {
  var api;

  api = defaultable(my_mod);
  t.type(api.defaults, 'function', '.defaults function to change defaults')
  t.equal(api.defaults.length, 1, '.defaults() takes 1 parameter')

  api = defaultable({stuff:'nung'}, my_mod)
  t.equal(api.get('stuff'), 'nung', 'Defaulted values work as expected');
  t.type(api.get('nope'), 'undefined', 'Non-defaulted values are undefined')

  api = defaultable(my_mod);
  t.type(api.get('stuff'), 'undefined', 'Rerunning defaultable removes old stuff')

  api = defaultable({mai:'yep'}, my_mod);
  t.type(api.get('stuff'), 'undefined', 'Rerunning defaultable with data removes old stuff')
  t.equal(api.get('mai'), 'yep', 'Reruning defaultable adds new stuff')

  t.end();
})

test('Inheritance', function(t) {
  var api      = defaultable({common:'meuan'}, my_mod);
  var son      = api.defaults({gender:'male'})
  var daughter = api.defaults({gender:'female'})
  var cousin   = api.defaults({gender:'female', common:'ama'});
  var grandkid = daughter.defaults({name:'laan'})

  t.equal(son.get('common')     , 'meuan', 'Inherit common defaults first child')
  t.equal(daughter.get('common'), 'meuan', 'Inherit common defaults second child')
  t.equal(cousin.get('common')  , 'ama'  , 'Override defaults')

  t.equal(son.get('gender')     , 'male'  , 'Set new defaults first child')
  t.equal(daughter.get('gender'), 'female', 'Set new defaults next child')

  t.equal(grandkid.get('common'), 'meuan' , 'Inherited values are inheritable')
  t.equal(grandkid.get('gender'), 'female', 'New values are inheritable')
  t.equal(grandkid.get('name')  , 'laan'  , 'Set new defaults at any depth')

  t.end();
})
