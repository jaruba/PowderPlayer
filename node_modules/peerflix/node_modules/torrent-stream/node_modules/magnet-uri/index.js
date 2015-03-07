var base32 = require('thirty-two')

/**
 * Parse a magnet URI and return an object of keys/values
 *
 * @param  {string} uri
 * @return {Object} parsed uri
 */
module.exports = function (uri) {
  var result = {}
  var data = uri.split('magnet:?')[1]

  if (!data || data.length === 0)
    return result

  var params = data.split('&')

  params.forEach(function (param) {
    var keyval = param.split('=')

    // This keyval is invalid, skip it
    if (keyval.length !== 2)
      return

    var key = keyval[0]
    var val = keyval[1]

    // Clean up torrent name
    if (key === 'dn')
      val = decodeURIComponent(val).replace(/\+/g, ' ')

    // Address tracker (tr) is an encoded URI, so decode it
    if (key === 'tr')
      val = decodeURIComponent(val)

    // Return keywords as an array
    if (key === 'kt')
      val = decodeURIComponent(val).split('+')

    // If there are repeated parameters, return an array of values
    if (result[key]) {
      if (Array.isArray(result[key])) {
        result[key].push(val)
      } else {
        var old = result[key]
        result[key] = [old, val]
      }
    } else {
      result[key] = val
    }
  })

  // Convenience properties to match parse-torrent results
  var m
  if (result.xt && (m = result.xt.match(/^urn:btih:(.{40})/))) {
    result.infoHash = new Buffer(m[1], 'hex').toString('hex')
  } else if (result.xt && (m = result.xt.match(/^urn:btih:(.{32})/))) {
    var decodedStr = base32.decode(m[1])
    result.infoHash = new Buffer(decodedStr, 'binary').toString('hex')
  }

  if (result.dn)
    result.name = result.dn
  if (result.tr)
    result.announce = result.tr
  if (result.kt)
    result.keywords = result.kt

  //if (result.mt) // TODO: link to the metafile that contains a list of magneto (MAGMA – MAGnet MAnifest)
  //if (result.xl) // TODO: xl (eXact Length) – Size in bytes
  //if (result.as) // TODO: as (Acceptable Source) – Web link to the file online
  //if (result.xs) // TODO: xs (eXact Source) – P2P link.

  return result
}
