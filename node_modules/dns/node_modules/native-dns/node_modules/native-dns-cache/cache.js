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
// THE SOFTWARE

'use strict';

var MemoryStore = require('./memory').MemoryStore;
var utils = require('./lookup');
var Lookup = utils.Lookup;
var util = require('util');
var Heap = require('binaryheap');

var MemoryStoreExpire = function (store, zone, opts) {
  opts = opts || {};
  this._store = store;
  this._zone = zone;
  this._max_keys = opts.max_keys;
  this._ttl = new Heap(true);
};

MemoryStoreExpire.prototype.get = function (domain, key, cb) {
  var self = this;
  this._store.get(domain, key, function (err, results) {
    var i, j, type, record;
    var nresults = {};
    var now = Date.now();

    for (i in results) {
      type = results[i];
      for (j in type) {
        record = type[j];
        record.ttl = Math.round((record._ttl_expires - now) / 1000)
        if (record.ttl > 0) {
          if (!nresults[i]) {
            nresults[i] = [];
          }
          nresults[i].push(record);
        } else {
          self._ttl.remove(record);
          self._store.delete(self._zone, record.name, record.type, function () {});
        }
      }
    }

    cb(err, nresults);
  });
};

MemoryStoreExpire.prototype.set = function (domain, key, data, cb) {
  var i, j, type, record, expires;
  var self = this;
  var now = Date.now();

  key = utils.ensure_absolute(key);

  for (i in data) {
    type = data[i];
    for (j in type) {
      record = type[j];
      expires = (record.ttl * 1000) + now;
      record._ttl_expires = expires;
      self._ttl.insert(record, expires);
    }
  }

  while (this._ttl.length > this._max_keys) {
    var record = this._ttl.pop();
    this._store.delete(this._zone, record.name, record.type);
  }

  this._store.set(domain, key, data, function (err, results) {
    if (cb)
      cb(err, results);
  });
};

MemoryStoreExpire.prototype.delete = function (domain, key, type, cb) {
  if (!cb) {
    cb = type;
    type = undefined;
  }

  var self = this;

  this._store.get(domain, utils.ensure_absolute(key), function (gerr, gresults) {
    var i, j, ktype, record;

    for (i in gresults) {
      ktype = gresults[i];
      for (j in ktype) {
        record = ktype[j];
        self._ttl.remove(record);
      }
    }

    if (!gresults) {
      if (cb)
        cb(gerr, gresults);
      return;
    }

    self._store.delete(domain, key, type, function (err, results) {
      if (cb)
        cb(err, results);
    });
  });
};

var Cache = module.exports = function (opts) {
  opts = opts || {};
  this._zone = '.' || opts.zone;
  this._store = undefined;
  this.purge = function () {
    this._store = new MemoryStoreExpire(opts.store || new MemoryStore(), this._zone, opts);
  }
  this.purge();
};

Cache.prototype.store = function (packet) {
  var self = this;
  var c = {};

  function each(record) {
    var r = c[record.name.toLowerCase()];
    var t;

    if (!r)
      r = c[record.name.toLowerCase()] = {};

    t = r[record.type];

    if (!t)
      t = r[record.type] = [];

    t.push(record);
  }

  packet.answer.forEach(each);
  packet.authority.forEach(each);
  packet.additional.forEach(each);  

  Object.keys(c).forEach(function (key) {
    self._store.set(self._zone, utils.ensure_absolute(key), c[key]);
  });
};

Cache.prototype.lookup = function (question, cb) {
  var self = this;
  Lookup(this._store, this._zone, question, function (err, results) {
    var i, record, found = false;

    for (i in results) {
      record = results[i];
      if (record.type == question.type) {
        found = true;
        break;
      }
    }

    if (results && !found) {
      self._store.delete(self._zone, utils.ensure_absolute(question.name));
      results.forEach(function (rr) {
        self._store.delete(self._zone, utils.ensure_absolute(rr.name));
      });
      results = null;
    }

    cb(results);
  });
};
