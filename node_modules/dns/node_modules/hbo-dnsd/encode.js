// Copyright 2012 Iris Couch, all rights reserved.
//
// Encode DNS messages

var util = require('util')

var constants = require('./constants')

module.exports = { 'State': State
                 }

var SECTIONS = ['question', 'answer', 'authority', 'additional']

function State () {
  var self = this

  self.header = new Buffer(12)
  self.position = 0

  self.question   = []
  self.answer     = []
  self.authority  = []
  self.additional = []

  self.domains = {} // The compression lookup table
}

State.prototype.toBinary = function() {
  var self = this

  var bufs = [self.header]
  self.question  .forEach(function(buf) { bufs.push(buf) })
  self.answer    .forEach(function(buf) { bufs.push(buf) })
  self.authority .forEach(function(buf) { bufs.push(buf) })
  self.additional.forEach(function(buf) { bufs.push(buf) })

  return Buffer.concat(bufs)
}

State.prototype.message = function(msg) {
  var self = this

  // ID
  self.header.writeUInt16BE(msg.id, 0)

  // QR, opcode, AA, TC, RD
  var byte = 0
  byte |= msg.type == 'response' ? 0x80 : 0x00
  byte |= msg.authoritative      ? 0x04 : 0x00
  byte |= msg.truncated          ? 0x02 : 0x00
  byte |= msg.recursion_desired  ? 0x01 : 0x00

  var opcode_names = ['query', 'iquery', 'status', null, 'notify', 'update']
    , opcode = opcode_names.indexOf(msg.opcode)

  if(opcode == -1 || typeof msg.opcode != 'string')
    throw new Error('Unknown opcode: ' + msg.opcode)
  else
    byte |= (opcode << 3)

  self.header.writeUInt8(byte, 2)

  // RA, Z, AD, CD, Rcode
  byte = 0
  byte |= msg.recursion_available ? 0x80 : 0x00
  byte |= msg.authenticated       ? 0x20 : 0x00
  byte |= msg.checking_disabled   ? 0x10 : 0x00
  byte |= (msg.responseCode & 0x0f)

  self.header.writeUInt8(byte, 3)

  self.position = 12 // the beginning of the sections
  SECTIONS.forEach(function(section) {
    var records = msg[section] || []
    records.forEach(function(rec) {
      self.record(section, rec)
    })
  })

  // Write the section counts.
  self.header.writeUInt16BE(self.question.length    , 4)
  self.header.writeUInt16BE(self.answer.length      , 6)
  self.header.writeUInt16BE(self.authority.length   , 8)
  self.header.writeUInt16BE(self.additional.length  , 10)
}

State.prototype.record = function(section_name, record) {
  var self = this

  var body = []
    , buf

  // Write the record name.
  buf = self.encode(record.name)
  body.push(buf)
  self.position += buf.length

  var type = constants.type_to_number(record.type)
    , clas = constants.class_to_number(record.class)

  // Write the type.
  buf = new Buffer(2)
  buf.writeUInt16BE(type, 0)
  body.push(buf)
  self.position += 2

  // Write the class.
  buf = new Buffer(2)
  buf.writeUInt16BE(clas, 0)
  body.push(buf)
  self.position += 2

  if(section_name != 'question') {
    // Write the TTL.
    buf = new Buffer(4)
    buf.writeUInt32BE(record.ttl || 0, 0)
    body.push(buf)
    self.position += 4

    // Write the rdata. Update the position now (the rdata length value) in case self.encode() runs.
    var match, rdata
    switch (record.class + ' ' + record.type) {
      case 'IN A':
        rdata = record.data || ''
        match = rdata.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/)
        if(!match)
          throw new Error('Bad '+record.type+' record data: ' + JSON.stringify(record))
        rdata = [ +match[1], +match[2], +match[3], +match[4] ]
        break
      case 'IN AAAA':
        // [hbouvier] More robust parsing of ipV6 address
        rdata = ipv6_to_array(record.data || '::')
        if(rdata.length !== 8)
          throw new Error('Bad '+record.type+' record data: ' + JSON.stringify(record))
        rdata = rdata.map(pair_to_buf)
        break
      case 'IN MX':
        var host = record.data[1]
        rdata = [ buf16(record.data[0])
                , self.encode(host, 2 + 2) // Adjust for the rdata length + preference values.
                ]
        break
      case 'IN SOA':
        var mname   = self.encode(record.data.mname, 2) // Adust for rdata length
          , rname   = self.encode(record.data.rname, 2 + mname.length)
        rdata = [ mname
                , rname
                , buf32(record.data.serial)
                , buf32(record.data.refresh)
                , buf32(record.data.retry)
                , buf32(record.data.expire)
                , buf32(record.data.ttl)
                ]
        break
      case 'IN NS':
      case 'IN PTR':
      case 'IN CNAME':
        rdata = self.encode(record.data, 2) // Adjust for the rdata length
        break
      case 'IN TXT':
        rdata = record.data.map(function(part) {
          part = new Buffer(part)
          return [part.length, part]
        })
        break
      case 'IN SRV':
        rdata = [ buf16(record.data.priority)
                , buf16(record.data.weight)
                , buf16(record.data.port)
                , self.encode(record.data.target, 2 + 6, 'nocompress') // Offset for rdata length + priority, weight, and port.
                ]
        break
      case 'IN DS':
        rdata = [ buf16(record.data.key_tag)
                , new Buffer([record.data.algorithm])
                , new Buffer([record.data.digest_type])
                , new Buffer(record.data.digest)
                ]
        break
      case 'NONE A':
        // I think this is no data, from RFC 2136 S. 2.4.3.
        rdata = []
        break
      default:
        throw new Error('Unsupported record type: ' + JSON.stringify(record))
    }

    // Write the rdata length. (The position was already updated.)
    rdata = flat(rdata)
    buf = new Buffer(2)
    buf.writeUInt16BE(rdata.length, 0)
    body.push(buf)
    self.position += 2

    // Write the rdata.
    self.position += rdata.length
    if(rdata.length > 0)
      body.push(new Buffer(rdata))
  }

  self[section_name].push(Buffer.concat(body))
}

State.prototype.encode = function(full_domain, position_offset, option) {
  var self = this

  // [hbouvier] Added default value
  var domain = full_domain || '';
  domain = domain.replace(/\.$/, '') // Strip the trailing dot.
  position = self.position + (position_offset || 0)

  var body = []
    , bytes

  var i = 0
  var max_iterations = 40 // Enough for 1.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.ip6.arpa

  while(++i < max_iterations) {
    if(domain == '') {
      // Encode the root domain and be done.
      body.push(new Buffer([0]))
      return Buffer.concat(body)
    }

    else if(self.domains[domain] && option !== 'nocompress') {
      // Encode a pointer and be done.
      body.push(new Buffer([0xc0, self.domains[domain]]))
      return Buffer.concat(body)
    }

    else {
      // Encode the next part of the domain, saving its position in the lookup table for later.
      self.domains[domain] = position

      var parts = domain.split(/\./)
        , car = parts[0]
      domain = parts.slice(1).join('.')

      // Write the first part of the domain, with a length prefix.
      //var part = parts[0]
      var buf = new Buffer(car.length + 1)
      buf.write(car, 1, car.length, 'ascii')
      buf.writeUInt8(car.length, 0)
      body.push(buf)
      position += buf.length
      //bytes.unshift(bytes.length)
    }
  }

  throw new Error('Too many iterations encoding domain: ' + full_domain)
}


//
// Utilities
//

function buf32(value) {
  var buf = new Buffer(4)
  buf.writeUInt32BE(value, 0)
  return buf
}

function buf16(value) {
  var buf = new Buffer(2)
  buf.writeUInt16BE(value, 0)
  return buf
}

function flat(data) {
  return Buffer.isBuffer(data)
          ? Array.prototype.slice.call(data)
          : Array.isArray(data)
            ? data.reduce(flatten, [])
            : [data]
}

function flatten(state, element) {
  return (Buffer.isBuffer(element) || Array.isArray(element))
          ? state.concat(flat(element))
          : state.concat([element])
}

function pair_to_buf(pair) {
  // [hbouvier]  It is possible that the "pair" has less than 4 digits, lets
  //             make sure that it has.
  var pairLength = pair.length;
  if (pairLength < 4)
    pair = "0000".substring(pairLength) + pair;

  // Convert a string of two hex bytes, e.g. "89ab" to a buffer.
  if(! pair.match(/^[0-9a-fA-F]{4}$/))
    throw new Error('Bad '+record.type+' record data: ' + JSON.stringify(record))
  return new Buffer(pair, 'hex')
}

// [hbouvier] More robust parsing of ipV6 address
function ipv6_to_array(string) {
  var fullAddress = ['0','0','0','0','0','0','0','0'];
  // Remove the contiguous empty strings generated by '::' and keep ony one.
  var numbers = string.split(/:/).reduce(function (previous, current) {
    if (previous instanceof Array === false)
      previous = [previous];
    if (!(current === '' && previous[previous.length -1] === '')) {
      previous.push(current)
    }
    return previous;
  });
  // Replace the single empty string, by the number of '0' that
  // were "missing" (e.g. shortened address)
  var merged = [].concat.apply([], numbers.map(function (num) {
    return (num === '') ? fullAddress.slice(numbers.length -1): num;
  }));
  return merged;
}
