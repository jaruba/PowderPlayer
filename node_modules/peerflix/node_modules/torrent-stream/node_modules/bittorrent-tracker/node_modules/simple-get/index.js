module.exports = simpleGet

var http = require('http')
var https = require('https')
var once = require('once')
var url = require('url')
var zlib = require('zlib')

function simpleGet (opts, cb) {
  if (typeof opts === 'string') opts = { url: opts }
  if (typeof cb === 'function') cb = once(cb)

  // Follow redirects
  if (opts.maxRedirects === 0) return cb(new Error('too many redirects'))
  if (!opts.maxRedirects) opts.maxRedirects = 10

  if (opts.url) parseOptsUrl(opts)
  if (!opts.headers) opts.headers = {}

  var body = opts.body
  delete opts.body
  if (body && !opts.method) opts.method = 'POST'

  // Request gzip/deflate
  var customAcceptEncoding = Object.keys(opts.headers).some(function (h) {
    return h.toLowerCase() === 'accept-encoding'
  })
  if (!customAcceptEncoding) opts.headers['accept-encoding'] = 'gzip, deflate'

  // Support http: and https: urls
  var protocol = opts.protocol === 'https:' ? https : http
  var req = protocol.request(opts, function (res) {
    // Follow 3xx redirects
    if (res.statusCode >= 300 && res.statusCode < 400 && 'location' in res.headers) {
      opts.url = res.headers.location
      parseOptsUrl(opts)
      res.resume() // Discard response
      opts.maxRedirects -= 1
      return simpleGet(opts, cb)
    }

    // Support gzip/deflate
    if (['gzip', 'deflate'].indexOf(res.headers['content-encoding']) !== -1) {
      // Pipe the response through an unzip stream (gunzip, inflate) and wrap it so it
      // looks like an `http.IncomingMessage`.
      var stream = zlib.createUnzip()
      res.pipe(stream)
      res.on('close', function () { stream.emit('close') })
      stream.httpVersion = res.httpVersion
      stream.headers = res.headers
      stream.trailers = res.trailers
      stream.setTimeout = res.setTimeout.bind(res)
      stream.method = res.method
      stream.url = res.url
      stream.statusCode = res.statusCode
      stream.socket = res.socket
      cb(null, stream)
    } else {
      cb(null, res)
    }
  })
  req.on('error', cb)
  req.end(body)
}

module.exports.concat = function (opts, cb) {
  simpleGet(opts, function (err, res) {
    if (err) return cb(err)
    var chunks = []
    res.on('data', function (chunk) {
      chunks.push(chunk)
    })
    res.on('end', function () {
      cb(null, Buffer.concat(chunks), res)
    })
  })
}

;['get', 'post', 'put', 'patch', 'head', 'delete'].forEach(function (method) {
  module.exports[method] = function (opts, cb) {
    if (typeof opts === 'string')
      opts = { url: opts }
    opts.method = method.toUpperCase()
    return simpleGet(opts, cb)
  }
})

function parseOptsUrl (opts) {
  var loc = url.parse(opts.url)
  if (loc.hostname) opts.hostname = loc.hostname
  if (loc.port) opts.port = loc.port
  if (loc.protocol) opts.protocol = loc.protocol
  opts.path = loc.path
  delete opts.url
}
