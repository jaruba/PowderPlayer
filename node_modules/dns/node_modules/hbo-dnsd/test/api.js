#!/usr/bin/env node
//
// Copyright 2012 Iris Couch, all rights reserved.
//
// Test DNS messages

var fs = require('fs')
var tap = require('tap')
var test = tap.test
var util = require('util')

var Message = require('../message')
var API = require('../named')
var DATA = __dirname + '/../_test_data'

test('Message API', function(t) {
  t.type(Message, 'function', 'Message is a function (constructor)')
  t.throws(function() { new Message }, 'Message requires a data buffer')

  t.type(API.parse, 'function', 'parse function in the API')
  t.type(API.stringify, 'function', 'stringify function in the API')

  t.throws(function() { API.parse() }, 'Parse function needs a data buffer')

  t.end()
})

test('Parse a valid query', function(t) {
  var data = fs.readFileSync(DATA + '/www.company.example-query')
    , msg = new Message(data)

  t.ok(msg, 'Parsed a message with the object API')

  msg = API.parse(data)
  t.ok(msg, 'Parsed a message with the parse API')

  t.end()
})

test('Parse a valid response', function(t) {
  var data = fs.readFileSync(DATA + '/www.company.example-response')
    , msg = new Message(data)

  t.ok(msg, 'Parsed a message with the object API')

  msg = API.parse(data)
  t.ok(msg, 'Parsed a message with the parse API')

  t.end()
})
