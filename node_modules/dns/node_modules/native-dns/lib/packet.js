// Copyright 2011 Timothy J Fontaine <tjfontaine@gmail.com>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the 'Software'), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE

'use strict';

var NDP = require('native-dns-packet'),
    util = require('util');

var Packet = module.exports = function(socket) {
  NDP.call(this);
  this.address = undefined;
  this._socket = socket;
};
util.inherits(Packet, NDP);

Packet.prototype.send = function() {
  var buff, len, size;

  if (typeof(this.edns_version) !== 'undefined') {
    size = 4096;
  }

  this.payload = size = size || this._socket.base_size;

  buff = this._socket.buffer(size);
  len = Packet.write(buff, this);
  this._socket.send(len);
};

Packet.parse = function (msg, socket) {
  var p = NDP.parse(msg);
  p._socket = socket;
  return p;
}

Packet.write = NDP.write;
