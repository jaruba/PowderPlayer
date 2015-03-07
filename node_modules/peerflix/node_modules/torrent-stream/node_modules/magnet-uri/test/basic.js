var magnet = require('../')
var test = require('tape')

var leavesOfGrass = 'magnet:?xt=urn:btih:d2474e86c95b19b8bcfdb92bc12c9d44667cfa36&dn=Leaves+of+Grass+by+Walt+Whitman.epub&tr=udp%3A%2F%2Ftracker.openbittorrent.com%3A80&tr=udp%3A%2F%2Ftracker.publicbt.com%3A80&tr=udp%3A%2F%2Ftracker.istole.it%3A6969&tr=udp%3A%2F%2Ftracker.ccc.de%3A80&tr=udp%3A%2F%2Fopen.demonii.com%3A1337'

test('parse valid magnet uris', function (t) {
  t.doesNotThrow(function () {
    magnet(leavesOfGrass)
  })
  result = magnet(leavesOfGrass)
  t.equal(result.xt, "urn:btih:d2474e86c95b19b8bcfdb92bc12c9d44667cfa36")
  t.equal(result.dn, "Leaves of Grass by Walt Whitman.epub")
  t.equal(result.infoHash, "d2474e86c95b19b8bcfdb92bc12c9d44667cfa36")
  t.deepEquals(result.tr, [
      "udp://tracker.openbittorrent.com:80",
      "udp://tracker.publicbt.com:80",
      "udp://tracker.istole.it:6969",
      "udp://tracker.ccc.de:80",
      "udp://open.demonii.com:1337"
  ])
  t.end()
})

test('empty magnet URIs return empty object', function (t) {
  var empty1 = ''
  var empty2 = 'magnet:'
  var empty3 = 'magnet:?'

  t.doesNotThrow(function () { magnet(empty1) })
  t.deepEquals(magnet(empty1), {})
  t.doesNotThrow(function () { magnet(empty2) })
  t.deepEquals(magnet(empty2), {})
  t.doesNotThrow(function () { magnet(empty3) })
  t.deepEquals(magnet(empty3), {})
  t.end()
})

test('empty string as keys is okay', function (t) {
  var uri = 'magnet:?a=&b=&c='

  t.doesNotThrow(function () { magnet(uri) })
  t.deepEquals(magnet(uri), { a: '', b: '', c: '' })
  t.end()
})

test('invalid magnet URIs return empty object', function (t) {
  var invalid1 = 'magnet:?xt=urn:btih:==='
  var invalid2 = 'magnet:?xt'
  var invalid3 = 'magnet:?xt=?dn='

  t.doesNotThrow(function () { magnet(invalid1) })
  t.deepEquals(magnet(invalid1), {})
  t.doesNotThrow(function () { magnet(invalid2) })
  t.deepEquals(magnet(invalid2), {})
  t.doesNotThrow(function () { magnet(invalid3) })
  t.deepEquals(magnet(invalid3), {})
  t.end()
})

test('invalid magnet URIs return only valid keys (ignoring invalid ones)', function (t) {
  var invalid1 = 'magnet:?a=a&==='
  var invalid2 = 'magnet:?a==&b=b'
  var invalid3 = 'magnet:?a=b=&c=c&d==='

  t.doesNotThrow(function () { magnet(invalid1) })
  t.deepEquals(magnet(invalid1), { a: 'a' })
  t.doesNotThrow(function () { magnet(invalid2) })
  t.deepEquals(magnet(invalid2), { b: 'b' })
  t.doesNotThrow(function () { magnet(invalid3) })
  t.deepEquals(magnet(invalid3), { c: 'c' })
  t.end()
})

test('extracts 40-char hex BitTorrent info_hash', function (t) {
  result = magnet('magnet:?xt=urn:btih:aad050ee1bb22e196939547b134535824dabf0ce')
  t.equal(result.infoHash, 'aad050ee1bb22e196939547b134535824dabf0ce')
  t.end()
})

test('extracts 32-char base32 BitTorrent info_hash', function (t) {
  result = magnet('magnet:?xt=urn:btih:64DZYZWMUAVLIWJUXGDIK4QGAAIN7SL6')
  t.equal(result.infoHash, 'f7079c66cca02ab45934b9868572060010dfc97e')
  t.end()
})

test('extracts keywords', function (t) {
  result = magnet('magnet:?xt=urn:btih:64DZYZWMUAVLIWJUXGDIK4QGAAIN7SL6&kt=joe+blow+mp3')
  t.deepEqual(result.keywords, ['joe','blow','mp3'])
  t.end()
})
