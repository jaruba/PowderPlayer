// Copyright 2012 Iris Couch, all rights reserved.
//
// Test DNS message parsing

var fs = require('fs')
var tap = require('tap')
var test = tap.test
var util = require('util')

var API = require('../named')

test('Parse all known messages', function(t) {
  var files = [ 'dynamic-update', 'oreilly.com-query', 'oreilly.com-response', 'www.company.example-query'
              , 'www.company.example-response', 'www.microsoft.com-query', 'www.microsoft.com-response'
              , 'edns-query'
              ]

  files.forEach(function(name) {
    var data = packet(name)
      , msg

    t.doesNotThrow(function() { msg = API.parse(data) }, 'No errors parsing ' + name)

    t.ok(msg, 'Parse packet: ' + name)
    t.ok(msg.id, 'Packet id: ' + name)
    //console.log('%s:\n%s\n\n', name, util.inspect(msg, 0, 10))
  })

  t.end()
})

test('Parse invalid messages', function(t) {
  var data = new Buffer('My name is Jason and I am awesome.')
  t.throws(function() { API.parse(data) }, 'Exception parsing random data')
  t.end()
})

test('Optimized parsing', function(t) {
  var data = packet('oreilly.com-response')
  data.__parsed = 0

  API.parse(data)
  t.equal(data.__parsed, 1, 'Parsing only runs once (after that, it is memoized)')
  t.end()
})

test('Message attributes', function(t) {
  var msg

  msg = API.parse(packet('oreilly.com-response'))
  t.equal(msg.type, 'response', 'DNS response')
  t.equal(msg.opcode, 'query', 'DNS opcode')
  t.equal(msg.authoritative, true, 'Authoritative message')
  t.equal(msg.truncated, false, 'Non-truncated message')
  t.equal(msg.recursion_desired, true, 'Recursion-desired in response')
  t.equal(msg.responseCode, 0, 'Successful response')

  msg = API.parse(packet('oreilly.com-query'))
  t.equal(msg.type, 'request', 'DNS request')
  t.equal(msg.authoritative, false, 'Non-authoritative request')
  t.equal(msg.recursion_desired, true, 'Recursion-desired in request')

  msg = API.parse(packet('dynamic-update'))
  t.equal(msg.opcode, 'update', 'DNS update opcode')

  msg = API.parse(packet('www.microsoft.com-response'))
  t.equal(msg.recursion_desired, false, 'No recursion desired')
  t.equal(msg.recursion_available, false, 'No recursion available')

  t.end()
})

test('Message sections', function(t) {
  var msg, rec

  msg = API.parse(packet('www.microsoft.com-query'))
  t.type(msg.question, 'Array', 'Parse question section')
  t.type(msg.answer, 'undefined', 'No "answer" section')
  t.type(msg.authority, 'undefined', 'No "authority" section')
  t.type(msg.additional, 'undefined', 'No "additional" section')

  msg = API.parse(packet('oreilly.com-response'))
  t.type(msg.whatever, 'undefined', 'No "whatever" section')
  t.type(msg.question, 'Array', 'Parse question section')
  t.type(msg.answer, 'Array', 'Parse answer section')
  t.type(msg.authority, 'Array', 'Parse authority section')
  t.type(msg.additional, 'Array', 'Parse additional section')

  t.end()
})

test('Message records', function(t) {
  var msg, rec

  msg = API.parse(packet('oreilly.com-response'))
  t.equal(msg.question.length, 1, 'Enumerate question records')
  t.equal(msg.answer.length, 2, 'Enumerate answer records')
  t.equal(msg.authority.length, 3, 'Enumerate authority records')
  t.equal(msg.additional.length, 5, 'Enumerate additional records')

  msg.question.forEach(function(rec, i)   { t.type(rec, 'object', 'Question record is object: '+i) })
  msg.answer.forEach(function(rec, i)     { t.type(rec, 'object', 'Answer record is object: '+i) })
  msg.authority.forEach(function(rec, i)  { t.type(rec, 'object', 'Authority record is object: '+i) })
  msg.additional.forEach(function(rec, i) { t.type(rec, 'object', 'Additional record is object: '+i) })

  msg = API.parse(packet('www.microsoft.com-response'))
  t.equal(msg.question  [0].name, 'www.microsoft.com.nsatc.net', 'Question name')
  t.equal(msg.answer    [0].name, 'www.microsoft.com.nsatc.net', 'Answer name')
  t.equal(msg.authority [0].name, 'nsatc.net'                  , '1st authority name')
  t.equal(msg.authority [1].name, 'nsatc.net'                  , '2nd authority name')
  t.equal(msg.authority [2].name, 'nsatc.net'                  , '3rd authority name')
  t.equal(msg.authority [3].name, 'nsatc.net'                  , '4th authority name')
  t.equal(msg.additional[0].name, 'j.ns.nsatc.net'             , '1st additional name')
  t.equal(msg.additional[1].name, 'k.ns.nsatc.net'             , '2nd additional name')
  t.equal(msg.additional[2].name, 'us-ca-6.ns.nsatc.net'       , '3rd additional name')
  t.equal(msg.additional[3].name, 'l.ns.nsatc.net'             , '4th additional name')

  msg = API.parse(packet('oreilly.com-response'))
  t.type(msg.question   [0].ttl, 'undefined', 'No TTL for question record')
  t.equal(msg.answer    [0].ttl, 3600 , '1st answer ttl')
  t.equal(msg.answer    [1].ttl, 3600 , '2nd answer ttl')
  t.equal(msg.authority [0].ttl, 21600, '1st authority ttl')
  t.equal(msg.authority [1].ttl, 21600, '2nd authority ttl')
  t.equal(msg.authority [2].ttl, 21600, '3rd authority ttl')
  t.equal(msg.additional[0].ttl, 21600, '1st additional ttl')
  t.equal(msg.additional[1].ttl, 21600, '2nd additional ttl')
  t.equal(msg.additional[2].ttl, 21600, '3rd additional ttl')
  t.equal(msg.additional[3].ttl, 32537, '4th additional ttl')
  t.equal(msg.additional[4].ttl, 32537, '5th additional ttl')

  msg.question.forEach(function(rr, i)   { t.equal(rr.class, 'IN', 'Question class is IN: '+i) })
  msg.answer.forEach(function(rr, i)     { t.equal(rr.class, 'IN', 'Answer class is IN: '+i) })
  msg.authority.forEach(function(rr, i)  { t.equal(rr.class, 'IN', 'Authority class is IN: '+i) })
  msg.additional.forEach(function(rr, i) { t.equal(rr.class, 'IN', 'Additional class is IN: '+i) })

  msg = API.parse(packet('dynamic-update'))
  t.equal(msg.question[0].type, 'SOA', 'SOA question class')
  t.equal(msg.answer[0].class, 'NONE', 'NONE answer class')

  msg = API.parse(packet('oreilly.com-response'))
  t.equal(msg.question  [0].type, 'MX', 'Question type')
  t.equal(msg.answer    [0].type, 'MX', '1st answer type')
  t.equal(msg.answer    [1].type, 'MX', '2nd answer type')
  t.equal(msg.authority [0].type, 'NS', '1st authority type')
  t.equal(msg.authority [1].type, 'NS', '2nd authority type')
  t.equal(msg.authority [2].type, 'NS', '3rd authority type')
  t.equal(msg.additional[0].type, 'A' , '1st additional type')
  t.equal(msg.additional[1].type, 'A' , '2nd additional type')
  t.equal(msg.additional[1].type, 'A' , '3rd additional type')
  t.equal(msg.additional[2].type, 'A' , '4th additional type')
  t.equal(msg.additional[3].type, 'A' , '5th additional type')

  t.type (msg.question  [0].data, 'undefined', 'No question data')
  t.same (msg.answer    [0].data, [20, 'smtp1.oreilly.com'], '1st answer data')
  t.same (msg.answer    [1].data, [20, 'smtp2.oreilly.com'], '2nd answer data')
  t.equal(msg.authority [0].data, 'ns1.sonic.net' , '1st authority data')
  t.equal(msg.authority [1].data, 'ns2.sonic.net' , '2nd authority data')
  t.equal(msg.authority [2].data, 'ns.oreilly.com', '3rd authority data')
  t.equal(msg.additional[0].data, '209.204.146.22', '1st additional data')
  t.equal(msg.additional[1].data, '209.58.173.22' , '2nd additional data')
  t.equal(msg.additional[2].data, '209.204.146.21', '3rd additional data')
  t.equal(msg.additional[3].data, '208.201.224.11', '4th additional data')
  t.equal(msg.additional[4].data, '208.201.224.33', '5th additional data')

  t.end()
})

test('Convenient text records', function(t) {
  t.plan(9)

  var msg = API.parse(packet('txt-response'))
  msg.answer.forEach(function(rec, i) {
    t.equal(rec.type, 'TXT', 'Parse text record: '+i)
    t.type(rec.data, 'string', 'Single text records become a string: '+i)
  })

  // Convert to an array and see if it persists correctly.
  var data = msg.answer[0].data
  msg.answer[0].data = [data, 'An extra string']

  var body = msg.toBinary()
    , msg2 = API.parse(body)

  t.type(msg2.answer[1].data, 'string', 'Single text record still a string')
  t.type(msg2.answer[0].data, 'Array' , 'Multiple text records are an array')
  t.equal(msg2.answer[0].data.length, 2, 'All text data accounted for')

  t.end()
})

test('Encoding messages', function(t) {
  var files = [ 'dynamic-update', 'oreilly.com-query', 'oreilly.com-response', 'www.company.example-query'
              , 'www.company.example-response', 'www.microsoft.com-query', 'www.microsoft.com-response'
              , 'iriscouch.com-query', 'iriscouch.com-response', 'foo.iriscouch.com-query', 'foo.iriscouch.com-response'
              , 'registry.npmjs.org-response', 'srv-query', 'srv-response', 'txt-query', 'txt-response'
              , 'ptr-query', 'ptr-response', 'aaaa-query', 'aaaa-response', 'ipv6_ptr-query', 'ds-query', 'ds-response'
              ]

  t.plan(3 * files.length) // 3 for each file

  files.forEach(function(file, i) {
    var original = packet(file)
      , message = API.parse(original)

    var encoded
    t.doesNotThrow(function() { encoded = API.binify(message) }, 'Encode: ' + file)

    // Strangely, the SOA response does not completely compress the ".com"
    if(file == 'iriscouch.com-response')
      t.same(encoded.length, original.length - 3, 'parse/stringify round-trip: ' + file)
    else
      t.same(encoded, original, 'parse/stringify round-trip: ' + file)

    var redecoded = API.parse(encoded)
    t.same(redecoded, message, 'parse/stringify/parse round-trip: ' + file)
  })

  t.end()
})

function packet(name) {
  return fs.readFileSync(__dirname + '/../_test_data/' + name)
}
