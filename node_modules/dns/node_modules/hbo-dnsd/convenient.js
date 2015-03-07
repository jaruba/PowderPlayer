// Copyright 2012 Iris Couch, all rights reserved.
//
// Convenience routines to make it easier to build a service

require('defaultable')(module,
  { 'convenient'    : true
  , 'ttl'           : 3600
  }, function(module, exports, DEFS, require) {

function noop() {}

module.exports = { 'init_response' : init_response
                 , 'final_response': final_response
                 , 'seconds': seconds
                 , 'serial': serial
                 }

if(! DEFS.convenient) {
  module.exports.init_response = noop
  module.exports.final_response = noop
}


function init_response(res) {
  res.type = 'response'
}

function final_response(res, value) {
  if(Array.isArray(value)) {
    res.answer = (res.answer || []).concat(value)
    value = undefined
  } else if(typeof value == 'object') {
    res = new res.constructor(value, value.connection || res.connection)
    value = undefined
  }

  var questions = res.question     || []
    , answers   = res.answer       || []
    , authorities = res.authority  || []
    , additionals = res.additional || []

  res.recursion_available = false

  // Find the zone of authority for this record, if any.
  var question = questions[0]
    , names = question && question.name && question.name.split(/\./)
    , zone, soa_record

  while(names && names.length) {
    zone = names.join('.')
    names.shift()

    soa_record = res.connection.server.zones[zone]
    if(soa_record)
      break
  }

  res.authoritative = !! soa_record

  // Add convenience for typical name resolution.
  if(questions.length == 1 && question.kind() == 'IN A') {
    // If the value given is an IP address, make that the answer.
    if(typeof value == 'string' && answers.length == 0)
      res.answer.push({'class':'IN', 'type':'A', 'name':question.name, 'data':value})
  }

  // Convenience for SOA queries
  else if(questions.length == 1 && question.kind() == 'IN SOA') {
    // Respond with the SOA record for this zone if necessary and possible.
    if(answers.length == 0 && soa_record && soa_record.name == question.name)
      res.answer.push(soa_record)
  }

  // If the server is authoritative for a zone, add an SOA record if there is no good answer.
  if(soa_record && questions.length == 1 && answers.length == 0 && authorities.length == 0)
    res.authority.push(soa_record)

  // Set missing TTLs
  answers.forEach(well_formed_record)
  authorities.forEach(well_formed_record)
  additionals.forEach(well_formed_record)

  return res

  function well_formed_record(record) {
    record.class = record.class || 'IN'

    var zone_minimum = DEFS.ttl
    if(soa_record)
      zone_minimum = soa_record.data.ttl

    record.ttl = Math.max(record.ttl || 0, zone_minimum)
  }
}


function serial(value) {
  if(value != 'now')
    return value

  // Otherwise, "now" is the current Unix time (no milliseconds).
  var now = new Date
  return Math.floor(now.getTime() / 1000)
}

// Convert various string values to seconds.
function seconds(value) {
  if(typeof value != 'string')
    return value

  var match
  if(match = value.match(/^(\d+)s$/)) // seconds
    return +match[1]

  if(match = value.match(/^(\d+)m$/)) // minutes
    return +match[1] * 60

  if(match = value.match(/^(\d+)h$/)) // hours
    return +match[1] * 60 * 60

  if(match = value.match(/^(\d+)d$/)) // days
    return +match[1] * 60 * 60 * 24

  if(match = value.match(/^(\d+)w$/)) // weeks
    return +match[1] * 60 * 60 * 24 * 7
}


}) // defaultable
