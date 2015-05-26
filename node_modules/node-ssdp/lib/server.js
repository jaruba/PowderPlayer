var SSDP = require('./')
  , util = require('util')
  , assert = require('assert')

function SsdpServer(opts, sock) {
  SSDP.call(this, opts, sock)
}

util.inherits(SsdpServer, SSDP)


/**
 * Binds UDP socket to an interface/port
 * and starts advertising.
 *
 * @param ipAddress
 */
SsdpServer.prototype.start = function () {
  var self = this

  if (self._socketBound) {
    self._logger.warn('Server already running.')
    return;
  }

  self._socketBound = true;

  this._usns[this._udn] = this._udn

  this._logger.trace('Will try to bind to ' + this._unicastHost + ':' + this._ssdpPort)

  self._start(this._ssdpPort, this._unicastHost, this._initAdLoop.bind(this))
}


/**
 * Binds UDP socket
 *
 * @param ipAddress
 * @private
 */
SsdpServer.prototype._initAdLoop = function () {
  var self = this

  self._logger.info('UDP socket bound to ' + this._unicastHost + ':' + self._ssdpPort)

  // FIXME: what's the point in advertising we're dead
  // if the cache is going to be busted anyway?
  self.advertise(false)

  setTimeout(function () {
    self.advertise(false)
  }, 1000)

  // Wake up.
  setTimeout(self.advertise.bind(self), 2000)
  setTimeout(self.advertise.bind(self), 3000)

  self._startAdLoop()
}




/**
 * Advertise shutdown and close UDP socket.
 */
SsdpServer.prototype.stop = function () {
  if (!this.sock) {
    this._logger.warn('Already stopped.')
    return;
  }

  this.advertise(false)
  this.advertise(false)

  this._stopAdLoop()

  this._stop()
}



SsdpServer.prototype._startAdLoop = function () {
  assert.equal(this._adLoopInterval, null, 'Attempting to start a parallel ad loop')

  this._adLoopInterval = setInterval(this.advertise.bind(this), this._adInterval)
}



SsdpServer.prototype._stopAdLoop = function () {
  assert.notEqual(this._adLoopInterval, null, 'Attempting to clear a non-existing interval')

  clearInterval(this._adLoopInterval)
  this._adLoopInterval = null
}



/**
 *
 * @param alive
 */
SsdpServer.prototype.advertise = function (alive) {
  var self = this

  if (!this.sock) return
  if (alive === undefined) alive = true

  Object.keys(self._usns).forEach(function (usn) {
    var udn = self._usns[usn]

    var heads = {
      'HOST': self._ssdpServerHost,
      'NT': usn, // notification type, in this case same as ST
      'NTS': (alive ? 'ssdp:alive' : 'ssdp:byebye'), // notification sub-type
      'USN': udn
    }

    if (alive) {
      heads['LOCATION'] = self._location
      heads['CACHE-CONTROL'] = 'max-age=1800'
      heads['SERVER'] = self._ssdpSig // why not include this?
    }

    self._logger.trace('Sending an advertisement event')

    var message = new Buffer(self._getSSDPHeader('NOTIFY', heads))

    self._send(message, function (err, bytes) {
      self._logger.trace({'message': message.toString()}, 'Outgoing server message')
    })
  })
}

module.exports = SsdpServer
