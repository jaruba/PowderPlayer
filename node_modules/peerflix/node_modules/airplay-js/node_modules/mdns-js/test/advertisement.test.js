var Lab = require('lab');
var lab = exports.lab = Lab.script();

var describe = lab.describe;
var it = lab.it;
//var before = lab.before;
//var after = lab.after;
var Code = require('code');   // assertion library
var expect = Code.expect;


var pf = require('../lib/packetfactory');
var mdns = require('../');
var dns = require('mdns-js-packet');
// var DNSPacket = dns.DNSPacket;
var DNSRecord = dns.DNSRecord;

function mockAdvertisement() {
  var context = {};
  context.options = {
    name: 'hello',
  };
  context.nameSuffix = '';
  context.port = 4242;
  context.serviceType = mdns.tcp('_http');
  return context;
}

describe('packetfactory', function () {

  it('buildQDPacket', function (done) {
    var context = mockAdvertisement();
    var packet = pf.buildQDPacket.apply(context, []);
    expect(context.alias).to.equal('hello._http._tcp.local');
    expect(packet).to.exist();
    done();
  });


  it('buildANPacket', function (done) {
    var context = mockAdvertisement();
    var packet = pf.buildQDPacket.apply(context, []);
    pf.buildANPacket.apply(context, [DNSRecord.TTL]);
    expect(packet).to.exist();
    done();
  });


  it('createAdvertisement', function (done) {
    var service = mdns.createAdvertisement(mdns.tcp('_http'), 9876,
    {
      name:'hello',
      txt:{
        txtvers:'1'
      }
    });

    expect(service).to.include({port:9876});
    expect(service.serviceType).to.include({name: 'http', protocol: 'tcp'});
    expect(service).to.include('options');
    expect(service.options, 'options').to.include({name: 'hello'});

    done();
  });
});
