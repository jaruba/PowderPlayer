#!/usr/bin/env node

var named = require('../named')

var port = +(process.argv[2] || 5321)
named.createServer(function(req, res) {
  console.log('%s:%s/%s %j', req.connection.remoteAddress, req.connection.remotePort, req.connection.type, req)
  res.end('1.1.1.' + req.question[0].name.length)
}).listen(port)
  .zone('example.com', 'ns1.iriscouch.net', 'us@iriscouch.com', 'now', '2h', '30m', '2w', '10m')

console.log('Listening on port %d', port)

