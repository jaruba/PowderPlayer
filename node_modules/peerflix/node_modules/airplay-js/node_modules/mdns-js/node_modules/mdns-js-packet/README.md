mdns-js-packet
==============

[![Build Status](https://travis-ci.org/kmpm/node-mdns-js-packet.svg?branch=master)](https://travis-ci.org/kmpm/node-mdns-js-packet)

DNS packet parser specifically built for mdns-js 
[mdns-js](https://github.com/kmpm/node-mdns-js) 
but it should be generic enough to do general dns stuff.


You probably want to have a look at 
[native-dns-packet](https://github.com/tjfontaine/native-dns-packet)
first and if that does do what you need, you might start looking at this.

mdns-js-packet should produce the same output as native-dns-packet,
it even uses it's test fixtures and borrows some parts of it.

This was made before i knew about native-dns-packet but since that
still has some bugs in handling some mDNS packets I cant use it.

example
-------

```javascript
var dns = require('mnds-js-packet');

/*some code that will get you a dns message buffer*/

var result = dns.DNSPacket.parse(message);

console.log(result);
```

Look at examples/dnsresolver.js for a more detailed example.

Contribute
----------
I will gladly accept any contributions as pull requests.
Just run __npm run lint__ on the code first so that the coding style
is kept somewhat consistent.
I miss doing this myself from time to time and I won't go balistic if anyone
else forget but I would really appretiate it.
