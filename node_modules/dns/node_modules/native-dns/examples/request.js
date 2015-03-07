var dns = require('../dns'),
  util = require('util');

var question = dns.Question({
  name: 'www.google.com',
  type: dns.consts.NAME_TO_QTYPE.A,
});

var start = new Date().getTime();

var req = dns.Request({
  question: question,
  server: { address: '8.8.8.8', port: 53, type: 'udp' },
  timeout: 1000,
});

req.on('timeout', function () {
  console.log('Timeout in making request');
});

req.on('message', function (err, answer) {
  console.log(toDig.call(answer));
});

req.on('end', function () {
  var delta = (new Date().getTime()) - start;
  console.log('Finished processing request: ' + delta.toString() + 'ms');
});

req.send();

toDig = function() {
  var ret = [], tmp, flags = [];

  tmp = ';; ->>HEADER<<- opcode: ';
  switch (this.header.opcode) {
    case 0:
      tmp += 'QUERY';
      break;
    case 1:
      tmp += 'IQUERY';
      break;
    case 2:
      tmp += 'STATUS';
      break;
    default:
      tmp += 'UNKNOWN';
      break;
  }
  tmp += ', status: ' + dns.consts.RCODE_TO_NAME[this.header.rcode];
  tmp += ', id: ' + this.header.id;
  ret.push(tmp);

  tmp = ';; flags: ';

  if (this.header.qr)
    flags.push('qr');
  if (this.header.rd)
    flags.push('rd');
  if (this.header.aa)
    flags.push('aa');
  if (this.header.tc)
    flags.push('tc');
  if (this.header.ra)
    flags.push('ra');

  tmp += flags.join(' ') + ';';

  tmp += ' QUESTON: ' + this.question.length;
  tmp += ', ANSWER: ' + this.answer.length;
  tmp += ', AUTHORITY: ' + this.authority.length;
  tmp += ', ADDITIONAL: ' + this.additional.length;

  ret.push(tmp);
  ret.push('');

  var pushit = function(p) {
    ret.push([
      p.name,
      dns.consts.QCLASS_TO_NAME[p.class],
      dns.consts.QTYPE_TO_NAME[p.type],
      p.address || p.data || '',
    ].join('\t'));
  };

  if (this.question.length) {
    ret.push(';; QUESTION SECTION:');
    this.question.forEach(function(q) {
      ret.push('; ' + [q.name,
        dns.consts.QCLASS_TO_NAME[q.class],
        dns.consts.QTYPE_TO_NAME[q.type]
      ].join('\t'));
    });
    ret.push('');
  }

  if (this.answer.length) {
    ret.push(';; ANSWER SECTION:');
    this.answer.forEach(pushit);
    ret.push('');
  }

  if (this.authority.length) {
    ret.push(';; AUTHORITY SECTION:');
    this.authority.forEach(pushit);
    ret.push('');
  }

  if (this.additional.length) {
    if (this.additional[0].type !== dns.consts.NAME_TO_QTYPE.OPT) {
      ret.push(';; ADDITIONAL SECTION:');
      this.additional.forEach(pushit);
      ret.push('');
    }
  }

  ret.push(';; END');

  return ret.join('\n');
};

