// Copyright 2012 Iris Couch, all rights reserved.
//
// Test convenience functions

var tap = require('tap')
var test = tap.test
var util = require('util')

var Message = require('../message')
var convenient = require('../convenient')

test('Disabled convenience routines', function(t) {
  var noop = convenient.defaults({'convenient':false})

  var obj = {"id":45782,"type":"request","responseCode":0,"opcode":"query","authoritative":false,"truncated":false
            ,"recursion_desired":false,"recursion_available":false,"authenticated":false,"checking_disabled":false
            ,"question":[{"name":"example.iriscouch.com","type":"A","class":"IN"}]
            }

  var out = dup(obj)
  noop.init_response(out)
  noop.final_response(out)
  t.same(out, obj, 'Convenience functions do nothing when disabled')
  t.end()
})

test('Plain objects work in convenience functions', function(t) {
  t.doesNotThrow(function() { convenient.init_response({}) }, 'Init a plain object, not a Response')
  t.doesNotThrow(function() { convenient.final_response({}) }, 'Finalize a plaion object, not a Response')
  t.end()
})

test('Convenient responses', function(t) {
  var obj = new Message({'id':1111})
    , answer = [{'class':'IN', 'type':'A', 'data':'127.0.0.1'}]
    , response = {'id':2222, 'answer':answer}

  var out = convenient.final_response(obj, response)
  t.equal(out.id, 2222, 'Specify a verbatim response object, same id')
  t.same(out.answer, answer, 'Specify a verbatim response object, same sections')

  var out = convenient.final_response(obj, answer)
  t.equal(out.answer.length, 1, 'Specify an answer array 1')
  t.same(out.answer[0], answer[0], 'Specify an answer array 2')

  t.end()
})

test('Authoritative response', function(t) {
  var msg = new Message({})
  var server = {'zones':{'example.com':{'type':'SOA', 'data':{}}}}

  msg.connection = {'server':server}

  var out = convenient.final_response(msg)
  t.equal(out.authoritative, false, 'Final responses are not authoritative by default')

  msg = new Message({'question':[{'class':'IN', 'type':'A', 'name':'foo.bar.example.com'}]})
  msg.authority = []
  msg.connection = {'server':server}
  out = convenient.final_response(msg)
  t.equal(out.authoritative, true, 'Final responess are authoritative for queries in the zone')

  t.end()
})

test('Common fields', function(t) {
  var msg = {'answer':[{}], 'authority':[{}, {}], 'additional':[{}, {}, {}]}
  convenient.final_response(msg)

  t.equal(msg.answer[0].ttl, 3600, 'Automatically set answer TTL')
  t.equal(msg.authority[0].ttl, 3600, 'Automatically set 1st authority TTL')
  t.equal(msg.authority[1].ttl, 3600, 'Automatically set 2nd authority TTL')
  t.equal(msg.additional[0].ttl, 3600, 'Automatically set 1st additional TTL')
  t.equal(msg.additional[1].ttl, 3600, 'Automatically set 2nd additional TTL')
  t.equal(msg.additional[2].ttl, 3600, 'Automatically set 3rd additional TTL')

  t.equal(msg.answer[0].class, 'IN', 'Automatically set answer class')
  t.equal(msg.authority[0].class, 'IN', 'Automatically set 1st authority class')
  t.equal(msg.authority[1].class, 'IN', 'Automatically set 2nd authority class')
  t.equal(msg.additional[0].class, 'IN', 'Automatically set 1st additional class')
  t.equal(msg.additional[1].class, 'IN', 'Automatically set 2nd additional class')
  t.equal(msg.additional[2].class, 'IN', 'Automatically set 3rd additional class')

  t.end()
})


function dup(obj) {
  return JSON.parse(JSON.stringify(obj))
}
