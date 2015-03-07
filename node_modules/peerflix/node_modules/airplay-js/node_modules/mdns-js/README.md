mDNS-js
==========

Pure JavaScript/NodeJS mDNS discovery implementation.
It's definitely not a full implementation at the current
state and it will NOT work in the browser. 

The starting inspiration came from
https://github.com/GoogleChrome/chrome-app-samples/tree/master/mdns-browser
but adapted for node. It's not much left of that now though.

Install by

    npm install mdns-js


Future
------
It would be great to have a full implementation of mDSN + DNS-SD in pure JS but
progress will be slow unless someone is willing to pitch in with
pull requests, specifications for wanted functions etc.
Also, as you should avoid to have multiple mDNS stacks on a system this
might clash with stuff like avahi and bonjour.


example
-------

```javascript
var mdns = require('mdns-js');

var browser = mdns.createBrowser();

browser.on('ready', function () {
    browser.discover(); 
});

browser.on('update', function (data) {
    console.log('data:', data);
});
```



Debugging
---------
This library is using the [debug](https://github.com/visionmedia/debug) 
module from TJ Holowaychuk and can be used like this.

```bash
DEBUG=mdns:* node examples/simple.js
```

This will spit out LOTS of information that might be useful.
If you have some issues with something where you might want
to communicate the contents of a packet (ie create an issue on github)
you could limit the debug information to just that.

```bash
DEBUG=mdns:browser:packet node examples/simple.js
```

Contributing
------------
Pull-request will be gladly accepted.

If possible any api should be as close match to the api of node-mdns but
be pragmatic. Look at issue #5.

Please run any existing tests with

    npm test

and preferably add more tests.


Before creating a pull-request please run 

    npm run lint 

This will run jshint as well as jscs that will do some basic syntax
and code style checks.
Fix any issues befor committing and creating a pull-request.

Look at the .jshintrc and .jscs.json for the details.


License
=======
Apache 2.0. See LICENSE file.



References
==========

* https://github.com/GoogleChrome/chrome-app-samples/tree/master/samples/mdns-browser
* http://en.wikipedia.org/wiki/Multicast_DNS
* http://en.wikipedia.org/wiki/Zero_configuration_networking#Service_discovery
* RFC 6762 - mDNS - http://tools.ietf.org/html/rfc6762
* RFC 6763 - DNS Based Service Discovery - http://tools.ietf.org/html/rfc6763
* http://www.tcpipguide.com/free/t_DNSMessageHeaderandQuestionSectionFormat.htm


Contributors
============

* James Sigurðarson, @jamiees2
* Stefan Sauer, @ensonic
