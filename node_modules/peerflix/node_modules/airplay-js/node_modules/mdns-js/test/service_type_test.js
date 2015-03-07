var Lab = require('lab');
var lab = exports.lab = Lab.script();

var describe = lab.describe;
var it = lab.it;
// var before = lab.before;
// var after = lab.after;
var Code = require('code');   // assertion library
var expect = Code.expect;

var ServiceType = require('../lib/service_type').ServiceType;

describe('ServiceType', function () {
  it('should parse _http._tcp', function (done) {
    var type = new ServiceType('_http._tcp');
    expect(type).to.include({protocol: 'tcp', name: 'http'});
    expect(type.subtypes).to.be.empty();
    expect(type.isWildcard()).to.be.false();
    var a = type.toArray();
    expect(a).to.be.instanceof(Array);
    done();
  });

  it('should parse service._http._tcp', function (done) {
    var type = new ServiceType('service._http._tcp');
    expect(type).to.include({protocol: 'tcp', name: 'http'});
    expect(type.subtypes).to.be.empty();
    done();
  });

  it('should parse service._http._tcp.local', function (done) {
    var type = new ServiceType('service._http._tcp.local');
    expect(type).to.include({protocol: 'tcp', name: 'http'});
    expect(type.subtypes).to.be.empty();
    done();
  });

  it('should parse _services._dns-sd._udp', function (done) {
    var type = new ServiceType('_services._dns-sd._udp');
    expect(type).to.include({protocol: 'udp', name: 'services._dns-sd'});
    expect(type.subtypes).to.be.empty();
    done();
  });

  it('should tak array as input', function (done) {
    var type = new ServiceType(['_http', '_tcp']);
    expect(type).to.include({protocol: 'tcp', name: 'http'});
    expect(type.subtypes).to.be.empty();
    done();
  });

  it('should take multiple arguments is input', function (done) {
    var type = new ServiceType('_http', '_tcp');
    expect(type).to.include({protocol: 'tcp', name: 'http'});
    expect(type.subtypes).to.be.empty();
    done();
  });

  it('should on empty arguments', function (done) {
    var type = new ServiceType();
    expect(type).to.include({protocol: '', name: ''});
    expect(type.subtypes).to.be.empty();
    done();
  });

  it('should take object as argument', function (done) {
    var type = new ServiceType({protocol: 'tcp', name: 'http'});
    expect(type).to.include({protocol: 'tcp', name: 'http'});
    expect(type.subtypes).to.be.empty();
    done();
  });

  it('should throw on bad protocol', function (done) {
    var throws = function () {
      new ServiceType('service._http._qwe.local');
    };
    expect(throws).to.throw(Error,
      'protocol must be either "_tcp" or "_udp" but is "_qwe"');
    done();
  });

  it('should throw on bad protocol', function (done) {
    var throws = function () {
      new ServiceType('service._http._qwe.local');
    };
    expect(throws).to.throw(Error,
      'protocol must be either "_tcp" or "_udp" but is "_qwe"');
    done();
  });
});
