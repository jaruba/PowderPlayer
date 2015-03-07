"use strict";

var dns = require('../dns');
var request;

request = dns.resolve('www.google.com', function (err, results) {
  var i;
  if (!err) {
    for (i = 0; i < results.length; i++) {
      console.log('www.google.com', results[i]);
    }
  } else {
    console.log(err);
  }
});

request = dns.lookup('www.yahoo.com', function (err, family, result) {
  console.log('www.yahoo.com', family, result);
});

request = dns.resolveMx('microsoft.com', function (err, results) {
  results.forEach(function (result) {
    console.log(result);
  });
});

request = dns.resolveTxt('aol.com', function (err, results) {
  results.forEach(function (result) {
    console.log('aol.com txt:', result);
  });
});

request = dns.resolveSrv('_xmpp-server._tcp.gmail.com', function (err, results) {
  results.forEach(function (result) {
    console.log('google xmpp', result);
  });
});

request = dns.resolveNs('linode.com', function (err, results) {
  results.forEach(function (result) {
    console.log('linode ns', result);
  });
});

request = dns.resolveCname('www.nodejs.org', function (err, results) {
  results.forEach(function (result) {
    console.log('www.google.com -->', result);
  });
});

request = dns.reverse('8.8.8.8', function (err, results) {
  results.forEach(function (result) {
    console.log('8.8.8.8 -->', result);
  });
});

request = dns.reverse('2600:3c03::f03c:91ff:fe96:48b', function (err, results) {
  results.forEach(function (result) {
    console.log('2600:3c03::f03c:91ff:fe96:48b -->', result);
  });
});

request = dns.resolve6('irc6.geo.oftc.net', function (err, results) {
  results.forEach(function (result) {
    console.log('irc6.geo.oftc.net', result);
  });
});

request = dns.resolve('www.linode.com', 'A', '8.8.8.8', function (err, results) {
  console.log("---- Direct Request ----");
  results.forEach(function (result) {
    console.log(result);
  });
  console.log("------------------------");
});
