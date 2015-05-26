'use strict'

var dgram = require('dgram')
  , EE = require('events').EventEmitter
  , util = require('util')
  , ip = require('ip')
  , Logger = require('./logger')

var httpHeader = /HTTP\/\d{1}\.\d{1} \d+ .*/
  , ssdpHeader = /^([^:]+):\s*(.*)$/

/**
 * Options:
 *
 * @param {Object} opts
 * @param {String} opts.ssdpSig SSDP signature
 * @param {String} opts.ssdpIp SSDP multicast group
 * @param {String} opts.ssdpPort SSDP port
 * @param {Number} opts.ssdpTtl Multicast TTL
 * @param {Number} opts.adInterval Interval at which to send out advertisement (ms)
 * @param {String} opts.description Path to SSDP description file
 * @param {String} opts.udn SSDP Unique Device Name
 *
 * @param {Number} opts.ttl Packet TTL
 * @param {Boolean} opts.log Disable/enable logging
 * @param {String} opts.logLevel Log level
 *
 * @returns {SSDP}
 * @constructor
 */
function SSDP(opts, sock) {
  var self = this

  if (!(this instanceof SSDP)) return new SSDP(opts)

  // we didn't get options, only socket
  if (!sock) {
    if (opts && /^udp\d$/.test(opts.type) && typeof opts.addMembership == 'function') {
      sock = opts
      opts = null
    }
  }

  opts = opts || {}

  if (sock) {
    this.sock = sock
  } else {
    this.sock = this._createSocket()
  }

  EE.call(self)

  this._logger = Logger(opts)

  this._init(opts)
}


util.inherits(SSDP, EE)


/**
 * Initializes instance properties.
 * @param opts
 * @private
 */
SSDP.prototype._init = function (opts) {
  this._ssdpSig = opts.ssdpSig || getSsdpSignature()

  // User shouldn't need to set these
  this._ssdpIp = opts.ssdpIp || '239.255.255.250'
  this._ssdpPort = opts.ssdpPort || 1900
  this._ssdpTtl = opts.ssdpTtl || 1

  this._adInterval = opts.adInterval || 10000

  this._ttl = opts.ttl || 1800

  if (typeof opts.location === 'function') {
    Object.defineProperty(this, '_location', {
      enumerable: true,
      get: opts.location
    });
  } else {
    // Probably should specify these
    this._location = opts.location || 'http://' + ip.address() + ':' + 10293 + '/upnp/desc.html'
  }

  this._unicastHost = opts.unicastHost || '0.0.0.0'
  this._ssdpServerHost = this._ssdpIp + ':' + this._ssdpPort

  this._usns = {}
  this._udn = opts.udn || 'uuid:f40c2981-7329-40b7-8b04-27f187aecfb5'
}



/**
 * Creates and returns UDP4 socket
 *
 * @returns {Socket}
 * @private
 */
SSDP.prototype._createSocket = function () {
  return dgram.createSocket('udp4')
}


/**
 * Advertise shutdown and close UDP socket.
 */
SSDP.prototype._stop = function () {
  if (!this.sock) {
    this._logger.warn('Already stopped.')
    return;
  }

  this.sock.close()
  this.sock = null

  this._socketBound = this._started = false;
}


/**
 * Configures UDP socket `socket`.
 * Binds event listeners.
 */
SSDP.prototype._start = function (port, host, cb) {
  var self = this

  if (self._started) {
    self._logger.warn('Already started.')
    return
  }

  self._started = true

  this.sock.on('error', function onSocketError(err) {
    self._logger.error(err, 'Socker error')
  })

  this.sock.on('message', function onSocketMessage(msg, rinfo) {
    self._parseMessage(msg, rinfo)
  })

  this.sock.on('listening', function onSocketListening() {
    var addr = self.sock.address()

    self._logger.info('SSDP listening on ' + 'http://' + addr.address + ':' + addr.port)

    addMembership();

    function addMembership() {
      try {
        self.sock.addMembership(self._ssdpIp)
        self.sock.setMulticastTTL(self._ssdpTtl)
      } catch (e) {
        if (e.code === 'ENODEV') {
          self._logger.warn({err: e}, 'No interface present to add multicast group membership. Scheduling a retry.')
          setTimeout(addMembership, 5000)
        } else {
          throw e;
        }
      }
    }
  })

  this.sock.bind(port, host, cb)
}



/**
 * Routes a network message to the appropriate handler.
 *
 * @param msg
 * @param rinfo
 */
SSDP.prototype._parseMessage = function (msg, rinfo) {
  msg = msg.toString()

  this._logger.trace({message: '\n' + msg}, 'Multicast message')

  var type = msg.split('\r\n').shift()

  // HTTP/#.# ### Response to M-SEARCH
  if (httpHeader.test(type)) {
    this._parseResponse(msg, rinfo)
  } else {
    this._parseCommand(msg, rinfo)
  }
}


/**
 * Parses SSDP command.
 *
 * @param msg
 * @param rinfo
 */
SSDP.prototype._parseCommand = function parseCommand(msg, rinfo) {
  var method = this._getMethod(msg)
    , headers = this._getHeaders(msg)

  switch (method) {
    case 'NOTIFY':
      this._notify(headers, msg, rinfo)
      break
    case 'M-SEARCH':
      this._msearch(headers, msg, rinfo)
      break
    default:
      this._logger.warn({'message': '\n' + msg, 'rinfo': rinfo}, 'Unhandled command')
  }
}



/**
 * Handles NOTIFY command
 * Emits `advertise-alive`, `advertise-bye` events.
 *
 * @param headers
 * @param _msg
 * @param _rinfo
 */
SSDP.prototype._notify = function (headers, _msg, _rinfo) {
  if (!headers.NTS) this._logger.trace(headers, 'Missing NTS header')

  switch (headers.NTS.toLowerCase()) {
    // Device coming to life.
    case 'ssdp:alive':
      this.emit('advertise-alive', headers)
      break

    // Device shutting down.
    case 'ssdp:byebye':
      this.emit('advertise-bye', headers)
      break

    default:
      this._logger.trace({'message': '\n' + _msg, 'rinfo': _rinfo}, 'Unhandled NOTIFY event')
  }
}



/**
 * Handles M-SEARCH command.
 *
 * @param headers
 * @param msg
 * @param rinfo
 */
SSDP.prototype._msearch = function (headers, msg, rinfo) {
  this._logger.trace({'ST': headers.ST, 'address': rinfo.address, 'port': rinfo.port}, 'SSDP M-SEARCH event')

  if (!headers.MAN || !headers.MX || !headers.ST) return

  this._respondToSearch(headers.ST, rinfo)
}



/**
 * Sends out a response to M-SEARCH commands.
 *
 * @param {String} serviceType Service type requested by a client
 * @param {Object} rinfo Remote client's address
 * @private
 */
SSDP.prototype._respondToSearch = function (serviceType, rinfo) {
  var self = this
    , peer = rinfo.address
    , port = rinfo.port

  // unwrap quoted string
  if (serviceType[0] == '"' && serviceType[serviceType.length-1] == '"') {
    serviceType = serviceType.slice(1, -1)
  }

  Object.keys(self._usns).forEach(function (usn) {
    var udn = self._usns[usn]

    if (serviceType === 'ssdp:all' || usn === serviceType) {
      var pkt = self._getSSDPHeader(
        '200 OK',
        {
          'ST': usn,
          'USN': udn,
          'LOCATION': self._location,
          'CACHE-CONTROL': 'max-age=' + self._ttl,
          'DATE': new Date().toUTCString(),
          'SERVER': self._ssdpSig,
          'EXT': ''
        },
        true
      )

      self._logger.trace({'peer': peer, 'port': port}, 'Sending a 200 OK for an M-SEARCH')

      var message = new Buffer(pkt)

      self._send(message, peer, port, function (err, bytes) {
        self._logger.trace({'message': pkt}, 'Sent M-SEARCH response')
      })
    }
  })
}



/**
 * Parses SSDP response message.
 *
 * @param msg
 * @param rinfo
 */
SSDP.prototype._parseResponse = function parseResponse(msg, rinfo) {
  this._logger.info({'message': '\n' + msg}, 'SSDP response')

  var headers = this._getHeaders(msg)
    , statusCode = this._getStatusCode(msg)

  this.emit('response', headers, statusCode, rinfo)
}



SSDP.prototype.addUSN = function (device) {
  this._usns[device] = this._udn + '::' + device
}



SSDP.prototype._getSSDPHeader = function (method, headers, isResponse) {
  var message = []

  if (isResponse) {
    message.push('HTTP/1.1 ' + method)
  } else {
    message.push(method + ' * HTTP/1.1')
  }

  Object.keys(headers).forEach(function (header) {
    message.push(header + ': ' + headers[header])
  })

  message.push('\r\n')

  return message.join('\r\n')
}



SSDP.prototype._getMethod = function _getMethod(msg) {
  var lines = msg.split("\r\n")
    , type = lines.shift().split(' ')// command, such as "NOTIFY * HTTP/1.1"
    , method = type[0]

  return method
}



SSDP.prototype._getStatusCode = function _getStatusCode(msg) {
  var lines = msg.split("\r\n")
    , type = lines.shift().split(' ')// command, such as "NOTIFY * HTTP/1.1"
    , code = parseInt(type[1], 10)

  return code
}



SSDP.prototype._getHeaders = function _getHeaders(msg) {
  var lines = msg.split("\r\n")

  var headers = {}

  lines.forEach(function (line) {
    if (line.length) {
      var pairs = line.match(ssdpHeader)
      if (pairs) headers[pairs[1].toUpperCase()] = pairs[2] // e.g. {'HOST': 239.255.255.250:1900}
    }
  })

  return headers
}



SSDP.prototype._send = function (message, host, port, cb) {
  var self = this

  if (typeof host === 'function') {
    cb = host
    host = this._ssdpIp
    port = this._ssdpPort
  }

  self.sock.send(message, 0, message.length, port, host, cb)
}



function getSsdpSignature() {
  var nodeVersion = process.version.substr(1)
    , moduleVersion = require('../package.json').version
    , moduleName = require('../package.json').name

  return 'node.js/' + nodeVersion + ' UPnP/1.1 ' + moduleName + '/' + moduleVersion
}



module.exports = SSDP
