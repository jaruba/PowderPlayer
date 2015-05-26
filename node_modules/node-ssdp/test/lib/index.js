require('../helper')

var assert = require('assert')

var SsdpBase = require('../../').Base

describe('Base class', function () {
  context('getMethod helper', function () {
    it('returns correct method', function () {
      var ssdp = new SsdpBase

      var message = [
        'BLAH URI HTTP/1.1',
        'SOMETHING: or other',
        'AND more stuff',
        'maybe not even upper case'
      ].join('\r\n')

      var method = ssdp._getMethod(message)

      assert.equal(method, 'BLAH')
    })
  })

  context('getHeaders helper', function () {
    it('returns correct headers', function () {
      var ssdp = new SsdpBase

      var message = [
        'BLAH URI HTTP/1.1',
        'SOMETHING: or other',
        'AND: more',
        'but this one is not a real header so pass on it'
      ].join('\r\n')

      var headers = ssdp._getHeaders(message)

      assert.equal(Object.keys(headers).length, 2)

      assert.equal(headers.SOMETHING, 'or other')
      assert.equal(headers.AND, 'more')
    })
  })
})