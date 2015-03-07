#!/usr/bin/env node

var fs = require('fs')
var parseTorrent = require('../')

function usage () {
  console.error('Usage: parse-torrent /path/to/torrent')
}

var torrentPath = process.argv[2]

if (!torrentPath) {
  return usage()
}

try {
  var parsedTorrent = parseTorrent(fs.readFileSync(torrentPath))
} catch (err) {
  console.error(err.message + '\n')
  usage()
}

delete parsedTorrent.info
delete parsedTorrent.infoBuffer

console.log(JSON.stringify(parsedTorrent, undefined, 2))
