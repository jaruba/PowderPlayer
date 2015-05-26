var os = require('os');

var ipv4 = function() {
	var interfaces = os.networkInterfaces()
	for (var i in interfaces) {
		for (var j = interfaces[i].length-1; j >= 0; j--) {
			var face = interfaces[i][j]
			if (!face.internal && face.family === 'IPv4') return face.address
		}
	}
	return '127.0.0.1'
}

var ipv6 = function() {
  var interfaces = os.networkInterfaces()
  for (var i in interfaces) {
    for (var j = interfaces[i].length-1; j >= 0; j--) {
      var face = interfaces[i][j]
      if (!face.internal && face.family === 'IPv6') return face.address
    }
  }
  return '::1'
}

ipv4.ipv4 = ipv4
ipv4.ipv6 = ipv6

module.exports = ipv4
