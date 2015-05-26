var sinon = require('sinon')
  , EE = require('events').EventEmitter

beforeEach(function() {
  this.sinon = sinon.sandbox.create();
  this.getFakeSocket = getFakeSocket.bind(this)
});

afterEach(function(){
  this.sinon.restore();
});

function getFakeSocket() {
  var s = new EE

  s.type = 'udp4'

  s.address = this.sinon.stub()
  s.address.returns({
    address: 1,
    port: 2
  })

  s.addMembership = this.sinon.stub()
  s.setMulticastTTL = this.sinon.stub()
  s.bind = function (port, addr, cb) {
    cb && cb()
  }
  this.sinon.spy(s, 'bind')
  s.send = this.sinon.stub()
  s.close = this.sinon.stub()

  return s
}