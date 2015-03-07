[![Build Status](https://secure.travis-ci.org/tjfontaine/node-dns.png)](http://travis-ci.org/tjfontaine/node-dns)

native-dns -- A replacement DNS stack for node.js
=================================================

Installation
------------

`npm install native-dns` and then `var dns = require('native-dns');`

Client
------

native-dns exports what should be a 1:1 mapping of the upstream node.js dns
module. That is to say if it's listed in the [docs](http://nodejs.org/docs/latest/api/dns.html)
it should behave similarly. If it doesn't please file an [issue](https://github.com/tjfontaine/node-dns/issues/new)

Request
-------

Beyond matching the upstream module, native-dns also provides a method for
customizing queries.

```javascript
var dns = require('../dns'),
  util = require('util');

var question = dns.Question({
  name: 'www.google.com',
  type: 'A',
});

var start = Date.now();

var req = dns.Request({
  question: question,
  server: { address: '8.8.8.8', port: 53, type: 'udp' },
  timeout: 1000,
});

req.on('timeout', function () {
  console.log('Timeout in making request');
});

req.on('message', function (err, answer) {
  answer.answer.forEach(function (a) {
    console.log(a.address);
  });
});

req.on('end', function () {
  var delta = (Date.now()) - start;
  console.log('Finished processing request: ' + delta.toString() + 'ms');
});

req.send();
```

Request creation takes an object with the following fields

 * `question` -- an instance of Question (required)
 * `server` -- defines the remote end point (required)
  - as an object it should be
    * `address` -- a string ip address (required)
    * `port` -- a number for the remote port (optional, default 53)
    * `type` -- a string indicating `udp` or `tcp` (optional, default `udp`)
You do not need to indicate ipv4 or ipv6, the backend will handle that
  - a string ip address
 * `timeout` -- a number in milliseconds indicating how long to wait for the
request to finish. (optional, default 4000)
 * `try_edns` -- a boolean indicating whether to use an `EDNSPacket` (optional)
 * `cache` -- can be false to disable caching, or implement the cache model, or
an instance of Cache but with a different store (optional, default
platform.cache)

There are only two methods

 * `send` -- sends the actual request to the remote endpoint
 * `cancel` -- cancels the request and ignores any responses

Request emits the following events

 * `message` -- This is where you get a response, passes `(err, answer)` where
answer is an instance of `Packet`
 * `timeout` -- Fired when the timeout is reached
 * `cancelled` -- Fired if the request is cancelled
 * `end` -- Always fired after a request finished, regardless of disposition

Platform
--------

If you want to customize all `resolve` or `lookup`s with the replacement client
stack you can modify the platform settings accessible in the top level `platform`
object.

Methods:

 * `reload` -- Re-read system configuration files to populate name servers and
hosts

Properties:

 * `ready` -- Boolean whether requests are safe to transit, true after hosts
and name servers are filled
 * `watching` -- Boolean indicating if system configuration files are watched
for changes, default to false (currently can only be enabled on !win32)
 * `name_servers` -- An array of servers used for resolving queries against
  - Each entry is an object of `{ address: <string ip>, port: 53 }`
  - On win32 this is hard coded to be google dns until there's a sane way to get
the data
 * `search_path` -- An array of domains to try and append after a failed lookup
 * `attempts` -- The number of retries for a failed lookup/timeout (default: 5)
 * `timeout` -- The time each query is allowed to take before trying another
server. (in milliseconds, default: 5000 (5 seconds))
 * `edns` -- Whether to try and send edns queries first (default: false)
 * `cache` -- The system wide cache used by default for `lookup` and `resolve`,
set this to false to disable caching

Events:

 * `ready` -- Emitted after hosts and name servers have been loaded
 * `unready` -- Emitted when hosts and name servers configuration is being
reloaded.

Server
------

There is also a rudimentary server implementation

```javascript
var dns = require('../dns'),
  server = dns.createServer();

server.on('request', function (request, response) {
  //console.log(request)
  response.answer.push(dns.A({
    name: request.question[0].name,
    address: '127.0.0.1',
    ttl: 600,
  }));
  response.answer.push(dns.A({
    name: request.question[0].name,
    address: '127.0.0.2',
    ttl: 600,
  }));
  response.additional.push(dns.A({
    name: 'hostA.example.org',
    address: '127.0.0.3',
    ttl: 600,
  }));
  response.send();
});

server.on('error', function (err, buff, req, res) {
  console.log(err.stack);
});

server.serve(15353);
```

Server creation

 * `createServer` and `createUDPServer` -- both create a `UDP` based server,
they accept an optional object for configuration,
  - `{ dgram_type: 'udp4' }` is the default option, the other is `udp6`
 * `createTCPServer` -- creates a TCP based server

Server methods

 * `serve(port, [address])` -- specify which port and optional address to listen
on
 * `close()` -- stop the server/close sockets.

Server events

 * `listening` -- emitted when underlying socket is listening
 * `close` -- emitted when the underlying socket is closed
 * `request` -- emitted when a dns message is received, and the packet was
successfully unpacked, passes `(request, response)`
  - Both `request` and `response` are instances of `Packet` when you're finished
creating the response, you merely need to call `.send()` and the packet will
DoTheRightThing
 * `error` -- emitted when unable to properly unpack the packet, passed `(err, msg, response)`
 * `socketError` -- remap of the underlying socket for the server, passes `(err, socket)`

Packet
------

Properties:

 * `header`
  - `id` -- request id
  - `qdcount` -- the number of questions (inferred from array size)
  - `ancount` -- the number of questions (inferred from array size)
  - `nscount` -- the number of questions (inferred from array size)
  - `arcount` -- the number of questions (inferred from array size)
  - `qr` -- is a query response
  - `opcode`
  - `aa` -- Authoritative Answer
  - `tc` -- Truncation bit
  - `rd` -- Recursion Desired
  - `ra` -- Recursion Available
  - `res1` -- Reserved field
  - `res2` -- Reserved field
  - `res3` -- Reserved field
  - `rcode` -- Response Code (see `consts.NAME_TO_RCODE`)
 * `question` -- array of `Question`s
 * `answer` -- array of `ResourceRecord`s
 * `authority` -- array of `ResourceRecord`s
 * `additional` -- array of `ResourceRecord`s

Methods:

 * `send()` -- Handles sending the packet to the right end point

Question
--------

A `Question` is instantiated by passing an object like:

 * `name` -- i.e. 'www.google.com' (required)
 * `type` -- Either the string representation of the record type, or the integer
value, see `consts.NAME_TO_QTYPE` (default: 'A')
 * `class` -- The class of service, default to 1 meaning internet

ResourceRecord
--------------

ResourceRecords are what populate `answer`, `authority`, and `additional`.
This is a generic type, and each derived type inherits the following properties:

 * `name` -- The name of the resource
 * `type` -- The numerical representation of the resource record type
 * `class` -- The numerical representation of the class of service (usually 1 for internet)
 * `ttl` -- The Time To Live for the record, in seconds

Available Types:

 * `SOA`
  - `primary` -- string
  - `admin` -- string
  - `serial` -- number
  - `refresh` -- number
  - `retry` -- number
  - `expiration` -- number
  - `minimum` -- number
 * `A` and `AAAA`
  - `address` -- string
 * `MX`
  - `priority` -- number
  - `exchange` -- string
 * `TXT`
  - `data` -- string
 * `SRV`
  - `priority` -- number
  - `weight` -- number
  - `port` -- number
  - `target` -- string
 * `NS`
  - `data` -- string
 * `CNAME`
  - `data` -- string
 * `PTR`
  - `data` -- string
 * `NAPTR`
  - `order` -- number
  - `preference` -- number
  - `flags` -- string
  - `service` -- string
  - `regexp` -- string
  - `replacement` -- string
