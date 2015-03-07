// Copyright 2012 Iris Couch, all rights reserved.
//
// Parse DNS messages

var util = require('util')

var constants = require('./constants')

module.exports = { 'id': id
                 , 'qr': qr
                 , 'aa': aa
                 , 'tc': tc
                 , 'rd': rd
                 , 'ra': ra
                 , 'ad': ad
                 , 'cd': cd
                 , 'rcode': rcode
                 , 'opcode': opcode
                 , 'record_count': record_count
                 , 'record_name' : record_name
                 , 'record_class': record_class
                 , 'record_ttl'  : record_ttl
                 , 'record_type' : record_type
                 , 'record_data' : record_data
                 , 'uncompress'  : uncompress
                 , 'sections'    : sections
                 , 'mx': mx
                 , 'srv': srv
                 , 'soa': soa
                 , 'txt': txt
                 }


function id(msg) {
  return msg.readUInt16BE(0)
}

function qr(msg) {
  return msg.readUInt8(2) >> 7
}

function opcode(msg) {
  return (msg.readUInt8(2) >> 3) & 0x0f
}

function aa(msg) {
  return (msg.readUInt8(2) >> 2) & 0x01
}

function tc(msg) {
  return (msg.readUInt8(2) >> 1) & 0x01
}

function rd(msg) {
  return msg.readUInt8(2) & 0x01
}

function ra(msg) {
  return msg.readUInt8(3) >> 7
}

function ad(msg) {
  return msg.readUInt8(3) >> 5 & 0x01
}

function cd(msg) {
  return msg.readUInt8(3) >> 4 & 0x01
}

function rcode(msg) {
  return msg.readUInt8(3) & 0x0f
}

function record_count(msg, name) {
  if(name == 'question')
    return msg.readUInt16BE(4)
  else if(name == 'answer')
    return msg.readUInt16BE(6)
  else if(name == 'authority')
    return msg.readUInt16BE(8)
  else if(name == 'additional')
    return msg.readUInt16BE(10)
  else
    throw new Error('Unknown section name: ' + name)
}

function record_name(msg, section_name, offset) {
  var rec = record(msg, section_name, offset)
  return rec.name
}

function record_class(msg, section_name, offset) {
  var rec = record(msg, section_name, offset)
  return rec.class
}

function record_type(msg, section_name, offset) {
  var rec = record(msg, section_name, offset)
  return rec.type
}

function record_ttl(msg, section_name, offset) {
  var rec = record(msg, section_name, offset)
  return rec.ttl
}

function record_data(msg, section_name, offset) {
  var rec = record(msg, section_name, offset)
  return rec.data
}

function record_class(msg, section_name, offset) {
  var rec = record(msg, section_name, offset)
  return rec.class
}

function record(msg, section_name, offset) {
  if(typeof offset != 'number' || isNaN(offset) || offset < 0)
    throw new Error('Offset must be a natural number')

  // Support msg being a previously-parsed sections object.
  var sects = Buffer.isBuffer(msg)
                ? sections(msg)
                : msg

  var records = sects[section_name]
  if(!records)
    throw new Error('No such section: "'+section_name+'"')

  var rec = records[offset]
  if(!rec)
    throw new Error('Bad offset for section "'+section_name+'": ' + offset)

  return rec
}

function sections(msg) {
  // Count the times this message has been parsed, for debugging and testing purposes.
  if('__parsed' in msg)
    msg.__parsed += 1

  var position = 12 // First byte of the first section
    , result = {'question':[], 'answer':[], 'authority':[], 'additional':[]}
    , need = { 'question'  : record_count(msg, 'question')
             , 'answer'    : record_count(msg, 'answer')
             , 'authority' : record_count(msg, 'authority')
             , 'additional': record_count(msg, 'additional')
             }

  var states = ['question', 'answer', 'authority', 'additional', 'done']
    , state = states.shift()

  while(true) {
    if(state == 'done')
      return result
    else if(result[state].length == need[state])
      state = states.shift()
    else if(!state)
      throw new Error('Unknown parsing state at position '+position+': '+JSON.stringify(state))
    else
      add_record()
  }

  function add_record() {
    var record = {}

    var data = domain_parts(msg, position)
    record.name = data.parts.join('.')
    position += data.length

    record.type  = msg.readUInt16BE(position + 0)
    record.class = msg.readUInt16BE(position + 2)
    position += 4

    if(state != 'question') {
      record.ttl    = msg.readUInt32BE(position + 0)
      var rdata_len = msg.readUInt16BE(position + 4)

      position += 6
      record.data = msg.slice(position, position + rdata_len)

      position += rdata_len

      if(constants.type(record.type) === 'OPT') {
        // EDNS
        if(record.name !== '')
          throw new Error('EDNS record option for non-root domain: ' + record.name)

        record.udp_size = record.class
        delete record.class

        record.extended_rcode = (record.ttl >> 24)
        record.edns_version   = (record.ttl >> 16) & 0xff
        record.zero           = (record.ttl >>  8)
        delete record.ttl

        record.data = Array.prototype.slice.call(record.data)
      }
    }

    result[state] = result[state] || []
    result[state].push(record)
  }
}

function mx(msg, data) {
  return [ data.readUInt16BE(0)
         , uncompress(msg, data.slice(2))
         ]
}

function srv(msg, data) {
  return { 'priority': data.readUInt16BE(0)
         , 'weight'  : data.readUInt16BE(2)
         , 'port'    : data.readUInt16BE(4)
         , 'target'  : uncompress(msg, data.slice(6)) // Techncially compression is not allowed in RFC 2782.
         }
}

function soa(msg, data) {
  var result = domain_parts(msg, data)
    , offset = result.length
    , mname = result.parts.join('.')

  result = domain_parts(msg, data.slice(offset))
  var rname = result.parts.join('.')
  offset += result.length

  return { 'mname'  : mname
         , 'rname'  : rname //.replace(/\./, '@')
         , 'serial' : data.readUInt32BE(offset + 0)
         , 'refresh': data.readUInt32BE(offset + 4)
         , 'retry'  : data.readUInt32BE(offset + 8)
         , 'expire' : data.readUInt32BE(offset + 12)
         , 'ttl'    : data.readUInt32BE(offset + 16)
         }
}

function txt(msg, data) {
  var parts = []
  while(data.length) {
    var len = data.readUInt8(0)
    parts.push(data.slice(1, 1+len).toString('ascii'))
    data = data.slice(1+len)
  }

  return parts
}

function uncompress(msg, offset) {
  var data = domain_parts(msg, offset)
  return data.parts.join('.')
}

function domain_parts(msg, offset) {
  if(Buffer.isBuffer(offset)) {
    var full_message = msg
    msg = offset
    offset = 0
  }

  if(typeof offset != 'number' || isNaN(offset) || offset < 0 || offset > msg.length)
    throw new Error('Bad offset: ' + offset)

  var parts = []
    , real_length = 0
    , jumped = false

  var i = 0
  while(true) {
    if(++i >= 100)
      throw new Error('Too many iterations uncompressing name')

    var byte = msg.readUInt8(offset)
      , flags = byte >> 6
      , len   = byte & 0x3f // 0 - 63

    offset += 1
    add_length(1)

    if(flags === 0x03) {
      offset = (len << 8) + msg.readUInt8(offset)
      add_length(1)
      jumped = true

      // If processing so far has just been on some given fragment, begin using the full message now.
      msg = full_message || msg
    }

    else if(len == 0)
      return {'parts':parts, 'length':real_length}

    else {
      parts.push(msg.toString('ascii', offset, offset + len))

      offset += len
      add_length(len)
    }
  }

  function add_length(amount) {
    if(! jumped)
      real_length += amount
  }
}
