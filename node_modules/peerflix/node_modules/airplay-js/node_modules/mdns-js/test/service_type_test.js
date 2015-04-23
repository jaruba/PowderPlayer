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

  it('should take object with subtypes as argument', function (done) {
    var type = new ServiceType({
      protocol: 'tcp',
      name: 'http',
      subtypes:['printer']
    });
    expect(type).to.include({protocol: 'tcp', name: 'http'});
    expect(type.subtypes).to.deep.equal(['printer']);
    done();
  });


  it('should subtype using _printer._sub', function (done) {
    var st = new ServiceType('_printer._sub._http._tcp.local');
    expect(JSON.stringify(st)).to.equal('{"name":"http","protocol":"tcp",' +
      '"subtypes":["_printer"]}');
    expect(st.toString()).to.equal('_http._tcp,_printer');
    done();
  });

  it('should subtype using ,_printer', function (done) {
    var st = new ServiceType('_http._tcp,_printer');
    expect(JSON.stringify(st)).to.equal('{"name":"http","protocol":"tcp",' +
      '"subtypes":["_printer"]}');

    expect(st.toString(), 'toString').to.equal('_http._tcp,_printer');
    done();
  });


  it('should default to _tcp', function (done) {
    var type = new ServiceType(['_http']);
    expect(type).to.include({protocol: 'tcp', name: 'http'});
    expect(type.subtypes).to.be.empty();
    done();
  });


  it('should throw on bad protocol', function (done) {
    function fn() {
      new ServiceType('service._http._qwe.local');
    }
    expect(fn).to.throw(Error,
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

  it('should throw on missing object name', function (done) {
    function fn() {
      new ServiceType({protocol:'tcp'});
    }
    expect(fn).to.throw(Error,
      'required property name is missing');
    done();
  });

  it('should throw on missing object protocol', function (done) {
    function fn() {
      new ServiceType({name: 'http'});
    }
    expect(fn).to.throw(Error,
      'required property protocol is missing');
    done();
  });

  it('should throw on number as input', function (done) {
    expect(fn).to.throw(Error, 'argument must be a string, array or object');
    done();
    function fn () {
      new ServiceType(1234);
    }
  });

  it('should work out _sub of apple-mobdev', function (done) {
    var s = new ServiceType('46c20544._sub._apple-mobdev2._tcp.local');
    expect(s.name, 'name').to.equal('apple-mobdev2');
    expect(s.subtypes).to.have.length(1);
    expect(s.subtypes[0], 'subtypes[0]').to.equal('46c20544');
    done();
  });
});
