// Copyright 2012 Iris Couch, all rights reserved.
//
// Server routines

require('defaultable')(module,
  {
  }, function(module, exports, DEFS, require) {

var net = require('net')
var util = require('util')
var dgram = require('dgram')
var events = require('events')

var Message = require('./message')
var convenient = require('./convenient')

module.exports = createServer

function createServer(handler) {
  return new Server(handler)
}


util.inherits(Server, events.EventEmitter)
function Server (handler) {
  var self = this
  events.EventEmitter.call(self)

  self.log = console
  self.zones = {}

  if(handler)
    self.on('request', handler)

  self.udp = dgram.createSocket('udp4')
  self.tcp = net.createServer()

  self.udp.on('close', function() { self.close() })
  self.tcp.on('close', function() { self.close() })

  self.udp.on('error', function(er) { self.emit('error', er) })
  self.tcp.on('error', function(er) { self.emit('error', er) })

  self.tcp.on('connection', function(connection) { self.on_tcp_connection(connection) })
  self.udp.on('message', function(msg, rinfo) { self.on_udp(msg, rinfo) })

  var listening = {'tcp':false, 'udp':false}
  self.udp.once('listening', function() {
    listening.udp = true
    if(listening.tcp)
      self.emit('listening')
  })
  self.tcp.once('listening', function() {
    listening.tcp = true
    if(listening.udp)
      self.emit('listening')
  })
}

Server.prototype.zone = function(zone, server, admin, serial, refresh, retry, expire, ttl) {
  var self = this
    , record = zone

  if(typeof record != 'object')
    record = { 'class': 'IN'
             , 'type' : 'SOA'
             , 'name' : zone
             , 'data' : { 'mname': server
                        , 'rname': admin
                        , 'serial': convenient.serial(serial)
                        , 'refresh': convenient.seconds(refresh)
                        , 'retry'  : convenient.seconds(retry)
                        , 'expire' : convenient.seconds(expire)
                        , 'ttl'    : convenient.seconds(ttl || 0)
                        }
             }

  self.zones[record.name] = record
  return self
}

Server.prototype.listen = function(port, ip, callback) {
  var self = this

  if(typeof ip === 'function') {
    callback = ip
    ip = null
  }

  self.port = port
  self.ip   = ip || '0.0.0.0'

  if(typeof callback === 'function')
    self.on('listening', callback)

  self.udp.bind(port, ip)
  self.tcp.listen(port, ip)

  return self
}

Server.prototype.close = function() {
  var self = this

  if(self.udp._receiving)
    self.udp.close()

  if(self.tcp._handle)
    self.tcp.close(function() {
      self.emit('close')
    })
}

Server.prototype.unref = function() {
  this.udp.unref()
  this.tcp.unref()
}

Server.prototype.ref = function() {
  this.udp.ref()
  this.tcp.ref()
}

Server.prototype.on_tcp_connection = function(connection) {
  var self = this

  var length = null
    , bufs = []

  connection.type = 'tcp'
  connection.server = self

  connection.on('data', function(data) {
    bufs.push(data)
    var bytes_received = bufs.reduce(function(state, buf) { return state + buf.length }, 0)

    if(length === null && bytes_received >= 2) {
      var so_far = Buffer.concat(bufs) // Flatten them all together, it's probably not much data.
      length = so_far.readUInt16BE(0)
      bufs = [ so_far.slice(2) ]
    }

    if(length !== null && bytes_received == 2 + length) {
      // All of the data (plus the 2-byte length prefix) is received.
      var data = Buffer.concat(bufs)
        , req = new Request(data, connection)
        , res = new Response(data, connection)

      self.emit('request', req, res)
    }
  })
}

Server.prototype.on_udp = function(data, rinfo) {
  var self = this

  // Provide something that feels like a net.Socket, which in turn feels like the http API.
  var connection = { 'type'         : self.udp.type
                   , 'remoteAddress': rinfo.address
                   , 'remotePort'   : rinfo.port
                   , 'server'       : self
                   , 'send'         : function() { self.udp.send.apply(self.udp, arguments) }
                   , 'destroy'      : function() {}
                   , 'end'          : function() {}
                   }

  var req = new Request(data, connection)
    , res = new Response(data, connection)

  self.emit('request', req, res)
}


util.inherits(Request, Message)
function Request (data, connection) {
  var self = this
  Message.call(self, data)

  self.connection = connection
}

Request.prototype.toJSON = function() {
  var self = this
  var obj = {}
  Object.keys(self).forEach(function(key) {
    if(key != 'connection')
      obj[key] = self[key]
  })
  return obj
}

util.inherits(Response, Message)
function Response (data, connection) {
  var self = this
  Message.call(self, data)

  self.question   = self.question   || []
  self.answer     = self.answer     || []
  self.authority  = self.authority  || []
  self.additional = self.additional || []

  self.connection = connection

  convenient.init_response(self)
}

Response.prototype.toJSON = Request.prototype.toJSON

Response.prototype.end = function(value) {
  var self = this

  var msg = convenient.final_response(self, value)
    , data = msg.toBinary()

  if(self.connection.type == 'udp4' && data.length > 512)
    return self.emit('error', 'UDP responses greater than 512 bytes not yet implemented')

  else if(self.connection.type == 'udp4')
    self.connection.send(data, 0, data.length, self.connection.remotePort, self.connection.remoteAddress, function(er) {
      if(er)
        self.emit('error', er)
    })

  else if(self.connection.type == 'tcp') {
    // Add the data length prefix.
    var length = data.length
    data = Buffer.concat([ new Buffer([length >> 8, length & 255]), data ])

    self.connection.end(data, function(er) {
      if(er)
        self.emit('error', er)
    })
  }

  else
    self.emit('error', new Error('Unknown connection type: ' + self.connection.type))
}


}) // defaultable
