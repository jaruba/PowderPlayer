#!/usr/bin/env node
//
// Copyright 2012 Iris Couch, all rights reserved.
//
// Test displaying DNS records

var fs = require('fs')
var tap = require('tap')
var test = tap.test
var util = require('util')

var Message = require('../message')

test('Display a message', function(t) {
  var file = 'oreilly.com-response'
  fs.readFile(__dirname+'/../_test_data/'+file, function(er, data) {
    if(er)
      throw er

    var msg = new Message(data)
      , str = util.format('%s', msg)
      , json = JSON.stringify(msg)

    t.type(str, 'string', 'Message can stringify')

    var obj = JSON.parse(util.format('%j', msg))
    t.equal(obj.id, 45753, 'JSON round-trip: id')
    t.equal(obj.type, 'response', 'JSON round-trip: type')
    t.equal(obj.opcode, 'query', 'JSON round-trip: opcode')
    t.equal(obj.authoritative, true, 'JSON round-trip: authoritative')
    t.equal(obj.truncated, false, 'JSON round-trip: truncated')
    t.equal(obj.recursion_desired, true, 'JSON round-trip: recursion_desired')
    t.equal(obj.recursion_available, true, 'JSON round-trip: recursion_available')
    t.equal(obj.responseCode, 0, 'JSON round-trip: responseCode')

    t.end()
  })
})
