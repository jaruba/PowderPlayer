/*
The follwoing code adapted from node's test-dns.js license is as follows
*/

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var dns = require('../dns'),
    net = require('net'),
    isIP = net.isIP,
    isIPv4 = net.isIPv4,
    isIPv6 = net.isIPv6;

var platform = require('../lib/platform');

platform.cache = false;

function checkWrap(test, req) {
  test.ok(typeof req === 'object');
}

var fixed = false;

var fixupDns = function () {
  platform.name_servers = [{
    address: '8.8.8.8',
    port: 53,
  }];

  platform.search_path = [];

  fixed = true;
};

platform.on('ready', fixupDns);

if (platform.ready)
  fixupDns();

exports.setUp = function (cb) {
  var checkReady = function() {
    if (fixed) {
      cb();
    } else {
      process.nextTick(checkReady);
    }
  }
  checkReady();
};

exports.resolve4 = function (test) {
  var req = dns.resolve4('www.google.com', function(err, ips) {
    test.ifError(err);

    test.ok(ips.length > 0);

    for (var i = 0; i < ips.length; i++) {
      test.ok(isIPv4(ips[i]));
    }

    test.done();
  });

  checkWrap(test, req);
};


exports.resolve6 = function (test) {
  var req = dns.resolve6('ipv6.google.com', function(err, ips) {
    test.ifError(err);

    test.ok(ips.length > 0);

    for (var i = 0; i < ips.length; i++) {
      test.ok(isIPv6(ips[i]));
    }

    test.done();
  });

  checkWrap(test, req);
};


exports.reverse_ipv4 = function (test) {
  var req = dns.reverse('8.8.8.8', function(err, domains) {
    test.ifError(err);

    test.ok(domains.length > 0);

    for (var i = 0; i < domains.length; i++) {
      test.ok(domains[i]);
      test.ok(typeof domains[i] === 'string');
    }

    test.done();
  });

  checkWrap(test, req);
};


exports.reverse_ipv6 = function (test) {
  var req = dns.reverse('2001:4860:4860::8888', function(err, domains) {
    test.ifError(err);

    test.ok(domains.length > 0);

    for (var i = 0; i < domains.length; i++) {
      test.ok(domains[i]);
      test.ok(typeof domains[i] === 'string');
    }

    test.done();
  });

  checkWrap(test, req);
};


exports.reverse_bogus = function (test) {
  var error;

  try {
    var req = dns.reverse('bogus ip', function() {
      test.ok(false);
    });
  } catch (e) {
    error = e;
  }

  test.ok(error instanceof Error);
  test.strictEqual(error.errno, 'ENOTIMP');

  test.done();
};


exports.resolveMx = function (test) {
  var req = dns.resolveMx('gmail.com', function(err, result) {
    test.ifError(err);

    test.ok(result.length > 0);

    for (var i = 0; i < result.length; i++) {
      var item = result[i];
      test.ok(item);
      test.ok(typeof item === 'object');

      test.ok(item.exchange);
      test.ok(typeof item.exchange === 'string');

      test.ok(typeof item.priority === 'number');
    }

    test.done();
  });

  checkWrap(test, req);
};


exports.resolveNs = function (test) {
  var req = dns.resolveNs('google.com', function(err, names) {
    test.ifError(err);

    if (names) {
      test.ok(names.length > 0);

      for (var i = 0; i < names.length; i++) {
        var name = names[i];
        test.ok(name);
        test.ok(typeof name === 'string');
      }
    } else {
      test.ok(names);
    }

    test.done();
  });

  checkWrap(test, req);
};


exports.resolveSrv = function (test) {
  var req = dns.resolveSrv('_jabber._tcp.google.com', function(err, result) {
    test.ifError(err);

    test.ok(result.length > 0);

    for (var i = 0; i < result.length; i++) {
      var item = result[i];
      test.ok(item);
      test.ok(typeof item === 'object');

      test.ok(item.name);
      test.ok(typeof item.name === 'string');

      test.ok(typeof item.port === 'number');
      test.ok(typeof item.priority === 'number');
      test.ok(typeof item.weight === 'number');
    }

    test.done();
  });

  checkWrap(test, req);
};


/*
exports.resolveCname = function (test) {
  var req = dns.resolveCname('www.google.com', function(err, names) {
    test.ifError(err);

    test.ok(names.length > 0);

    for (var i = 0; i < names.length; i++) {
      var name = names[i];
      test.ok(name);
      test.ok(typeof name === 'string');
    }

    test.done();
  });

  checkWrap(test, req);
};
*/

exports.resolveTxt = function (test) {
  var req = dns.resolveTxt('google.com', function(err, records) {
    test.ifError(err);
    test.equal(records.length, 1);
    test.equal(records[0].indexOf('v=spf1'), 0);
    test.done();
  });

  checkWrap(test, req);
};


exports.lookup_ipv4_explicit = function (test) {
  var req = dns.lookup('www.google.com', 4, function(err, ip, family) {
    test.ifError(err);
    test.ok(net.isIPv4(ip));
    test.strictEqual(family, 4);

    test.done();
  });

  checkWrap(test, req);
};


exports.lookup_ipv4_implicit = function (test) {
  var req = dns.lookup('www.google.com', function(err, ip, family) {
    test.ifError(err);
    test.ok(net.isIPv4(ip));
    test.strictEqual(family, 4);

    test.done();
  });

  checkWrap(test, req);
};


exports.lookup_ipv6_explicit = function (test) {
  var req = dns.lookup('ipv6.google.com', 6, function(err, ip, family) {
    test.ifError(err);
    test.ok(net.isIPv6(ip));
    test.strictEqual(family, 6);

    test.done();
  });

  checkWrap(test, req);
};

/*
// TODO XXX FIXME Doesn't google require ipv6 for this test to pass?
exports.lookup_ipv6_implicit = function (test) {
  var req = dns.lookup('ipv6.google.com', function(err, ip, family) {
    test.ifError(err);
    test.ok(net.isIPv6(ip));
    test.strictEqual(family, 6);

    test.done();
  });

  checkWrap(test, req);
};
//*/

exports.lookup_failure = function (test) {
  var req = dns.lookup('does.not.exist', 4, function(err, ip, family) {
    test.ok(err instanceof Error);
    test.strictEqual(err.errno, dns.NOTFOUND);
    test.strictEqual(err.errno, 'ENOTFOUND');

    test.done();
  });

  checkWrap(test, req);
};

exports.lookup_null = function (test) {
  var req = dns.lookup(null, function(err, ip, family) {
    test.ifError(err);
    test.strictEqual(ip, null);
    test.strictEqual(family, 4);

    test.done();
  });

  checkWrap(test, req);
};


exports.lookup_ip_ipv4 = function (test) {
  var req = dns.lookup('127.0.0.1', function(err, ip, family) {
    test.ifError(err);
    test.strictEqual(ip, '127.0.0.1');
    test.strictEqual(family, 4);

    test.done();
  });

  checkWrap(test, req);
};


//*
exports.lookup_ip_ipv6 = function (test) {
  var req = dns.lookup('::1', function(err, ip, family) {
    test.ifError(err);
    test.ok(net.isIPv6(ip));
    test.strictEqual(family, 6);

    test.done();
  });

  checkWrap(test, req);
};
//*/


exports.lookup_localhost_ipv4 = function (test) {
  var req = dns.lookup('localhost', 4, function(err, ip, family) {
    test.ifError(err);
    test.strictEqual(ip, '127.0.0.1');
    test.strictEqual(family, 4);

    test.done();
  });

  checkWrap(test, req);
};

exports.lookup_longname = function (test) {
  var name, request;

  var name = '************';
  name += name + '***************'
  name += name + '***************'
  name += name + '***************'
  name += name + '***************'
  name += name + '***************'

  request = dns.lookup(name, 4, function (err, ip, family) {
    test.ok(err, "we should fail");
    test.strictEqual(err.errno, dns.NOTFOUND);

    test.done();
  });
  checkWrap(test, request);
};


/* Disabled because it appears to be not working on linux. */
/*
exports.lookup_localhost_ipv6 = function (test) {
  var req = dns.lookup('localhost', 6, function(err, ip, family) {
    test.ifError(err);
    test.ok(net.isIPv6(ip));
    test.strictEqual(family, 6);

    test.done();
  });

  checkWrap(test, req);
};
//*/
