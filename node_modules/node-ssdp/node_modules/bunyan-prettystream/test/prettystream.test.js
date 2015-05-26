'use strict';

var blanket = require("blanket")({
  "pattern": "/lib/prettystream.js"
});

var PrettyStream = require('..');
var Stream = require('stream');
var should = require("should");
var util = require('util');

function TestStream(test, done){
  Stream.call(this);

  this.readable = true;
  this.writable = true;

  this.test = test;
  this.done = done;
}
util.inherits(TestStream, Stream);

TestStream.prototype.write = function write(data){
  this.test(data);
  this.emit('data', data);
  return true;
};

TestStream.prototype.end = function end(){
  this.emit('end');
  if (this.done){
    this.done();
  }
};

var simpleRecord = {
  name:"myservice",
  pid:123,
  hostname:"example.com",
  level:30,
  msg:"My message",
  time:"2012-02-08T22:56:52.856Z",
  v:0};
var extraFieldRecord = {
  name: "myservice",
  pid: 123,
  hostname:"example.com",
  level:30,
  extra:"field",
  msg:"My message",
  time:"2012-02-08T22:56:52.856Z",
  v:0};
var undefinedFields = {
  name: "myservice",
  pid: 123,
  hostname:"example.com",
  level:30,
  msg:"My message",
  time:"2012-02-08T22:56:52.856Z",
  defined: undefined,
  v:0};
var simpleReqRecord = {"name":"amon-master","hostname":"9724a190-27b6-4fd8-830b-a574f839c67d","pid":12859,"route":"HeadAgentProbes","req_id":"cce79d15-ffc2-487c-a4e4-e940bdaac31e","level":20,"contentMD5":"11FxOYiYfpMxmANj4kGJzg==","msg":"headAgentProbes respond","time":"2012-08-08T10:25:47.636Z","v":0};
var detailedReqResRecord = {"name":"amon-master","hostname":"9724a190-27b6-4fd8-830b-a574f839c67d","pid":12859,"audit":true,"level":30,"remoteAddress":"10.2.207.2","remotePort":50394,"req_id":"cce79d15-ffc2-487c-a4e4-e940bdaac31e","req":{"method":"HEAD","url":"/agentprobes?agent=ccf92af9-0b24-46b6-ab60-65095fdd3037","headers":{"accept":"application/json","content-type":"application/json","host":"10.2.207.16","connection":"keep-alive"},"httpVersion":"1.1","trailers":{},"version":"*"},"res":{"statusCode":200,"headers":{"content-md5":"11FxOYiYfpMxmANj4kGJzg==","access-control-allow-origin":"*","access-control-allow-headers":"Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version","access-control-allow-methods":"HEAD","access-control-expose-headers":"X-Api-Version, X-Request-Id, X-Response-Time","connection":"Keep-Alive","date":"Wed, 08 Aug 2012 10:25:47 GMT","server":"Amon Master/1.0.0","x-request-id":"cce79d15-ffc2-487c-a4e4-e940bdaac31e","x-response-time":3},"trailer":false},"route":{"name":"HeadAgentProbes","version":false},"latency":3,"secure":false,"_audit":true,"msg":"HeadAgentProbes handled: 200","time":"2012-08-08T10:25:47.637Z","v":0};

describe('A PrettyStream', function(){
  it('should pretty print simple uncolored log statments', function(){
    var prettyStream = new PrettyStream({useColor: false});
    var result = prettyStream.formatRecord(simpleRecord);
    result.should.equal('[2012-02-08T22:56:52.856Z]  INFO: myservice/123 on example.com: My message\n');
  });

  it('should pretty print uncolored log statments with extra fields', function(){
    var prettyStream = new PrettyStream({useColor: false});
    var result = prettyStream.formatRecord(extraFieldRecord);
    result.should.equal('[2012-02-08T22:56:52.856Z]  INFO: myservice/123 on example.com: My message (extra=field)\n');
  });

  it('should print undefined fields as empty strings', function(){
    var prettyStream = new PrettyStream({useColor: false});
    var result = prettyStream.formatRecord(undefinedFields);
    result.should.equal('[2012-02-08T22:56:52.856Z]  INFO: myservice/123 on example.com: My message (defined="")\n');
  });

  it('should pretty print colored log statments', function(){
    var prettyStream = new PrettyStream({useColor: true});
    var result = prettyStream.formatRecord(simpleRecord);
    result.should.equal('[\u001b[37m2012-02-08T22:56:52.856Z\u001b[39m] \u001b[36m INFO\u001b[39m: myservice/123 on example.com: \u001b[36mMy message\u001b[39m\n');
  });

  it('should pretty print simple request log statments', function(){
    var prettyStream = new PrettyStream({useColor: false});
    var result = prettyStream.formatRecord(simpleReqRecord);
    result.should.equal('[2012-08-08T10:25:47.636Z] DEBUG: amon-master/12859 on 9724a190-27b6-4fd8-830b-a574f839c67d: headAgentProbes respond (route=HeadAgentProbes, req_id=cce79d15-ffc2-487c-a4e4-e940bdaac31e, contentMD5=11FxOYiYfpMxmANj4kGJzg==)\n');
  });

  it('should pretty print detailed request and response log statments', function(){
    var prettyStream = new PrettyStream({useColor: false});
    var result = prettyStream.formatRecord(detailedReqResRecord);
    var expected = [ '[2012-08-08T10:25:47.637Z]  INFO: amon-master/12859 on 9724a190-27b6-4fd8-830b-a574f839c67d: HeadAgentProbes handled: 200 (req.version=*, audit=true, remoteAddress=10.2.207.2, remotePort=50394, req_id=cce79d15-ffc2-487c-a4e4-e940bdaac31e, latency=3, secure=false, _audit=true)',
      '    HEAD /agentprobes?agent=ccf92af9-0b24-46b6-ab60-65095fdd3037 HTTP/1.1',
      '    accept: application/json',
      '    content-type: application/json',
      '    host: 10.2.207.16',
      '    connection: keep-alive',
      '    --',
      '    HTTP/1.1 200 OK',
      '    content-md5: 11FxOYiYfpMxmANj4kGJzg==',
      '    access-control-allow-origin: *',
      '    access-control-allow-headers: Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
      '    access-control-allow-methods: HEAD',
      '    access-control-expose-headers: X-Api-Version, X-Request-Id, X-Response-Time',
      '    connection: Keep-Alive',
      '    date: Wed, 08 Aug 2012 10:25:47 GMT',
      '    server: Amon Master/1.0.0',
      '    x-request-id: cce79d15-ffc2-487c-a4e4-e940bdaac31e',
      '    x-response-time: 3',
      '    --',
      '    route: {',
      '      "name": "HeadAgentProbes",',
      '      "version": false',
      '    }'].join('\n') + "\n";
    result.should.equal(expected);
  });


  it('should work as a stream', function(done){
    var prettyStream = new PrettyStream({useColor: false});
    var test = function(data){
      data.should.equal('[2012-02-08T22:56:52.856Z]  INFO: myservice/123 on example.com: My message\n');
    };

    prettyStream.pipe(new TestStream(test, done));
    prettyStream.write(simpleRecord);
    prettyStream.end();
  });
});


