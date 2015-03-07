var dns = require('../dns'),
  Packet = require('../lib/packet');

exports.roundTrip = function (test) {
  var buff, pre, post;

  pre = new Packet();
  pre.header.id = 12345;
  pre.header.rcode = 1;

  pre.question.push(dns.Question({
    name: 'www.google.com',
    type: dns.consts.NAME_TO_QTYPE.A,
  }));

  pre.answer.push(dns.A({
    name: 'www.google.com',
    address: '127.0.0.1',
    ttl: 600,
  }));

  buff = new Buffer(1024);

  len = Packet.write(buff, pre);

  post = Packet.parse(buff.slice(0, len));

  test.deepEqual(pre, post);
  test.done();
};

exports.truncate = function (test) {
  var buff, pre, post, i;

  pre = new Packet();
  pre.header.id = 12345;
  pre.header.rcode = 1;

  pre.question.push(dns.Question({
    name: 'really.long.name.some.domain.com',
    type: 'A',
  }));

  for (i = 0; i < 254; i ++) {
    pre.answer.push(dns.A({
      name: i+'.'+i+'.'+i+'.really.long.name.some.domain.com',
      address: '127.0.0.' + i,
      ttl: 600,
    }));
    pre.authority.push(dns.A({
      name: i+'.'+i+'.'+i+'.really.long.name.some.domain.com',
      address: '127.0.0.' + i,
      ttl: 600,
    }));
    pre.additional.push(dns.A({
      name: i+'.'+i+'.'+i+'.really.long.name.some.domain.com',
      address: '127.0.0.' + i,
      ttl: 600,
    }));
  }

  buff = new Buffer(512);
  len = Packet.write(buff, pre);
  post = Packet.parse(buff.slice(0, len));

  test.notEqual(pre.additional.length, post.additional.length,
    'Additional should be less because of truncated packet');

  test.done();
};
