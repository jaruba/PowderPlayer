# magnet-uri [![travis](https://img.shields.io/travis/feross/magnet-uri.svg)](https://travis-ci.org/feross/magnet-uri) [![npm](https://img.shields.io/npm/v/magnet-uri.svg)](https://npmjs.org/package/magnet-uri) [![downloads](https://img.shields.io/npm/dm/magnet-uri.svg)](https://npmjs.org/package/magnet-uri) [![gittip](https://img.shields.io/gittip/feross.svg)](https://www.gittip.com/feross/)

[![browser support](https://ci.testling.com/feross/magnet-uri.png)](https://ci.testling.com/feross/magnet-uri)

### Parse a magnet URI and return an object of keys/values.

Also works in the browser with [browserify](http://browserify.org/)! This module is used by [WebTorrent](http://webtorrent.io).

## install

```
npm install magnet-uri
```

## usage

```js
var magnet = require('magnet-uri')

// "Leaves of Grass" by Walt Whitman
var uri = 'magnet:?xt=urn:btih:d2474e86c95b19b8bcfdb92bc12c9d44667cfa36&dn=Leaves+of+Grass+by+Walt+Whitman.epub&tr=udp%3A%2F%2Ftracker.openbittorrent.com%3A80&tr=udp%3A%2F%2Ftracker.publicbt.com%3A80&tr=udp%3A%2F%2Ftracker.istole.it%3A6969&tr=udp%3A%2F%2Ftracker.ccc.de%3A80&tr=udp%3A%2F%2Fopen.demonii.com%3A1337'

var parsed = magnet(uri)
console.log(parsed.dn) // "Leaves of Grass by Walt Whitman.epub"
console.log(parsed.infoHash) // "d2474e86c95b19b8bcfdb92bc12c9d44667cfa36"

```

The `parsed` magnet link object looks like this:

```js
  {
    "xt": "urn:btih:d2474e86c95b19b8bcfdb92bc12c9d44667cfa36",
    "dn": "Leaves of Grass by Walt Whitman.epub",
    "tr": [
      "udp://tracker.openbittorrent.com:80",
      "udp://tracker.publicbt.com:80",
      "udp://tracker.istole.it:6969",
      "udp://tracker.ccc.de:80",
      "udp://open.demonii.com:1337"
    ],

    // added for convenience:
    "infoHash": "d2474e86c95b19b8bcfdb92bc12c9d44667cfa36",
    "name": "Leaves of Grass by Walt Whitman.epub",
    "announce": [
      "udp://tracker.openbittorrent.com:80",
      "udp://tracker.publicbt.com:80",
      "udp://tracker.istole.it:6969",
      "udp://tracker.ccc.de:80",
      "udp://open.demonii.com:1337"
    ]
  }
```

## license

MIT. Copyright (c) [Feross Aboukhadijeh](http://feross.org).
