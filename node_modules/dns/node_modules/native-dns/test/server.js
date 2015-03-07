var dns = require('../dns');
//*
exports.udp4 = function (test) {
  var server = dns.createUDPServer(); 

  var tData = {
    address: '127.0.0.1',
    port: 15353,
  };

  if (!/^v0.6/.test(process.version))
    tData.family = 'IPv4';

  var succeed = false;

  server.on('listening', function () {
    test.deepEqual(this.address(), tData, 'Not listening on the same port and address');
    // currently disabled because of https://github.com/joyent/node/issues/2867
    process.nextTick(function () {
      server.close();
    });
    succeed = true;
  });

  server.on('socketError', function (err, socket) {
    test.ifError(err, 'Should not have a bind error');
    this.close();
  });

  server.on('close', function () {
    test.done();
  });

  server.serve(tData.port, tData.address);
};
//*/
//*
exports.udp6 = function (test) {
  var server = dns.createUDPServer({
    dgram_type: 'udp6',
  }); 

  var tData = {
    address: '::1',
    port: 15353,
  };

  if (!/^v0.6/.test(process.version))
    tData.family = 'IPv6';

  var succeed = false;

  server.on('listening', function () {
    test.deepEqual(this.address(), tData, 'Not listening on the same port and address');

    // currently disabled because of https://github.com/joyent/node/issues/2867
    process.nextTick(function () {
      server.close();
    });
    succeed = true;
  });

  server.on('socketError', function (err, socket) {
    test.ifError(err, 'Should not have a bind error');
    this.close();
  });

  server.on('close', function () {
    test.done();
  });

  server.serve(tData.port, tData.address);
};
//*/
//*
exports.tcp = function (test) {
  var server = dns.createTCPServer(); 

  var tData = {
    address: '127.0.0.1',
    port: 15353,
  };

  server.on('listening', function () {
    test.equal(this.address().port, tData.port, 'Not listening on the same port and address');
    test.equal(this.address().address, tData.address, 'Not listening on the same port and address');
    process.nextTick(function () {
      server.close();
    });
  });

  server.on('socketError', function (err, socket) {
    test.ifError(err, 'Should not have a bind error');
    this.close();
  });

  server.on('close', function () {
    test.done();
  });

  server.serve(tData.port, tData.address);
};
//*/
exports.udpResponse = function (test) {
  var server = dns.createServer();

  server.on('request', function (req, res) {
    res.answer.push(dns.A({
      name: req.question[0].name,
      address: '127.0.0.1',
      ttl: 600,
    }));
    res.send();
  });

  server.on('listening', function () {
    var r = dns.Request({
      question: dns.Question({
        name: 'www.google.com',
      }),
      server: {
        address: '127.0.0.1',
        port: 15353,
      },
      cache: false,
    });

    r.on('message', function (err, answer) {
      var record;
      test.ok(!err, 'Response should not be an error');
      test.ok(answer.answer.length === 1, 'Response should have 1 answer');
      record = answer.answer[0]
      test.strictEqual(record.address, '127.0.0.1', 'Address mismatch');
      test.strictEqual(record.ttl, 600, 'TTL mismatch');
      test.strictEqual(record.name, 'www.google.com', 'Name mismatch');
    });

    r.on('error', function (err) {
      console.log(err);
      test.ok(false, 'Should not error');
    });

    r.on('timeout', function () {
      test.ok(false, 'Should not timeout');
    });

    r.on('end', function () {
      server.close();
    });

    process.nextTick(function () {
      r.send();
    });
  });

  server.on('close', function () {
    test.done();
  });

  server.serve(15353, '127.0.0.1');
}
