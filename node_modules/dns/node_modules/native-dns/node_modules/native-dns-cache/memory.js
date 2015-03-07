// Copyright 2012 Timothy J Fontaine <tjfontaine@gmail.com>
// 
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN

'use strict';

var MemoryStore = exports.MemoryStore = function (opts) {
  this._store = {};
};

MemoryStore.prototype.get = function (domain, key, cb) {
  var d = domain.toLowerCase();
  var k = key.toLowerCase();
  var result = this._store[d];

  if (result)
    result = result[k];

  process.nextTick(function () {
    cb(null, result);
  });
};

MemoryStore.prototype.set = function (domain, key, data, cb) {
  var d = domain.toLowerCase();
  var k = key.toLowerCase();
  var result_domain = this._store[d];

  if (!result_domain)
    result_domain = this._store[d] = {};

  result_domain[k] = data;

  if (cb) {
    process.nextTick(function () {
      cb(null, data);
    });
  }
};

MemoryStore.prototype.delete = function (domain, key, type, cb) {
  var d, k;

  if (!cb) {
    cb = type;
    type = undefined;
  }

  if (!cb) {
    cb = key;
    type = undefined;
  }

  d = this._store[domain.toLowerCase()];

  if (d && key)
    k = d[key.toLowerCase()];

  if (domain && key && type) {
    if (d && k) {
      delete k[type];
    }
  } else if (domain && key) {
    if (d) {
      delete d[k];
    }
  } else if (domain) {
    if (d) {
      delete this._store[domain.toLowerCase()];
    }
  }

  if (cb) {
    process.nextTick(function () {
      cb(null, domain);
    });
  }
};
