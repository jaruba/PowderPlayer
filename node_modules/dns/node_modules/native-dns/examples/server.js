"use strict";

var dns = require('../dns'),
  tcpserver = dns.createTCPServer(),
  server = dns.createServer();

var onMessage = function (request, response) {
  console.log('request from:', request.address);
  var i;
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
  response.additional.push(dns.AAAA({
    name: 'hostA.example.org',
    address: '::1',
    ttl: 600,
  }));

  //To force truncation and tcp tests
  //for (i = 1; i < 254; i++) {
  //  response.additional.push(dns.A({
  //    name: 'host'+i+'.example.org',
  //    address: '127.0.0.' + 1,
  //    ttl: 600,
  //  }));
  //}

  response.send();
};

var onError = function (err, buff, req, res) {
  console.log(err.stack);
};

var onListening = function () {
  console.log('server listening on', this.address());
  //this.close();
};

var onSocketError = function (err, socket) {
  console.log(err);
};

var onClose = function () {
  console.log('server closed', this.address());
};

server.on('request', onMessage);
server.on('error', onError);
server.on('listening', onListening);
server.on('socketError', onSocketError);
server.on('close', onClose);

server.serve(15353, '127.0.0.1');

tcpserver.on('request', onMessage);
tcpserver.on('error', onError);
tcpserver.on('listening', onListening);
tcpserver.on('socketError', onSocketError);
tcpserver.on('close', onClose);

tcpserver.serve(15353, '127.0.0.1');
