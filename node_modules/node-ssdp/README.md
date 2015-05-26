[![Build Status](https://travis-ci.org/diversario/node-ssdp.svg?branch=master)](https://travis-ci.org/diversario/node-ssdp)
[![Coverage Status](https://img.shields.io/coveralls/diversario/node-ssdp.svg)](https://coveralls.io/r/diversario/node-ssdp?branch=master)
[![Dependency Status](https://gemnasium.com/diversario/node-ssdp.png)](https://gemnasium.com/diversario/node-ssdp)
[![NPM version](https://badge.fury.io/js/node-ssdp.svg)](http://badge.fury.io/js/node-ssdp)
[![Stories in Ready](https://badge.waffle.io/diversario/node-ssdp.png?label=ready&title=Ready)](https://waffle.io/diversario/node-ssdp)

## Installation

```sh
npm install node-ssdp
```

There is another package called `ssdp` which is the original unmaintained version. Make sure to install `node-ssdp` instead.

## Usage - Client

```javascript
    var Client = require('node-ssdp').Client
      , client = new Client();

    client.on('response', function (headers, statusCode, rinfo) {
      console.log('Got a response to an m-search.');
    });

    // search for a service type
    client.search('urn:schemas-upnp-org:service:ContentDirectory:1');

    // Or get a list of all services on the network

    client.search('ssdp:all');
```

## Usage - Server

```javascript
    var Server = require('node-ssdp').Server
      , server = new Server()
    ;

    server.addUSN('upnp:rootdevice');
    server.addUSN('urn:schemas-upnp-org:device:MediaServer:1');
    server.addUSN('urn:schemas-upnp-org:service:ContentDirectory:1');
    server.addUSN('urn:schemas-upnp-org:service:ConnectionManager:1');

    server.on('advertise-alive', function (headers) {
      // Expire old devices from your cache.
      // Register advertising device somewhere (as designated in http headers heads)
    });

    server.on('advertise-bye', function (headers) {
      // Remove specified device from cache.
    });

    // start the server
    server.start();

    process.on('exit', function(){
      server.stop() // advertise shutting down and stop listening
    })
```

Take a look at `example` directory as well to see examples or client and server.

##Configuration
SSDP constructor accepts an optional configuration object. At the moment, the following is supported:

- (deprecated; see `logLevel`) `log` _Boolean_ Enable/disable logging. Default: false.
- `logLevel` _String_ Specifies log level to print. Possible values: `TRACE`, `DEBUG`, `INFO`, `WARN`, `ERROR`, `FATAL`. If not explicitly set in options logging is disabled completely.
- `ssdpSig` _String_ SSDP signature. Default: 'node.js/0.0.8 UPnP/1.1 node-ssdp/0.1.1'
- `ssdpIp` _String_ SSDP multicast group. Default: '239.255.255.250'
- `ssdpPort` _Number_ SSDP port. Default: 1900
- `ssdpTtl` _Number_ Multicast TTL. Default: 1
- `adInterval` _Number_ `advertise` event frequency (ms)
- `unicastHost` _String_ IP address or hostname of server where SSDP service is running. This is used in `HOST` header
- `location` _String_ URL pointing to description of your service, or a function which returns that URL
- `udn` _String_ Unique Device Name. Defaults to "uuid:f40c2981-7329-40b7-8b04-27f187aecfb5".
- `description` _String_ Path to description file. Defaults to "upnp/desc.php".
- `ttl` _Number_ Packet TTL. Default: 1800.

# License

(The MIT License)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

[![Analytics](https://ga-beacon.appspot.com/UA-51511945-1/node-ssdp/README.md)](https://github.com/igrigorik/ga-beacon)
