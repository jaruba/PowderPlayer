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

var dgram = require('dgram'),
    EventEmitter = require('events').EventEmitter,
    net = require('net'),
    util = require('util');

var is_absolute = exports.is_absolute = function (f) {
  return f && /\.$/.test(f);
};

var ensure_absolute = exports.ensure_absolute = function (f) {
  if (!is_absolute(f))
    return f += '.';
  return f;
};

var CNAME = require('native-dns-packet').consts.NAME_TO_QTYPE.CNAME;

var Lookup = exports.Lookup = function (store, zone, question, cb) {
  if (!(this instanceof Lookup))
    return new Lookup(store, zone, question, cb);

  this.store = store;
  this.zone = zone;
  this.cb = cb;
  this.question = question;
  this.results = [];
  this.wildcard = undefined;

  this.name = ensure_absolute(question.name);

  this.store.get(this.zone, this.name, this.lookup.bind(this));
};

Lookup.prototype.send = function (err) {
  this.cb(err, this.results);
};

Lookup.prototype.lookup = function (err, results) {
  var type, ret, name, self = this;

  if (err)
    return this.send(err);

  if (!results) {
    if (!this.wildcard)
      this.wildcard = this.question.name;

    if (this.wildcard.toLowerCase() == this.zone.toLowerCase())
      return this.send();

    name = this.wildcard = this.wildcard.split('.').splice(1).join('.');

    // 'com.'.split('.').splice(1) will return empty string, we're at the end
    if (!this.wildcard)
      return this.send();

    name = '*.' + name;
  } else if (results[this.question.type]) {
    type = this.question.type;
    ret = results;
  } else if (results[CNAME]) {
    type = CNAME;
    ret = results;
    this.name = name = results[CNAME][0].data
  }

  if (ret) {
    ret = ret[type];
    ret.forEach(function (r) {
      var rr, k;

      if (self.wildcard && /^\*/.test(r.name)) {
        rr = {};
        for (k in r) {
          rr[k] = r[k];
        }
        rr.name = self.name;
      } else {
        rr = r;
      }

      self.results.push(rr);
    });
  }

  if (name)
    this.store.get(this.zone, ensure_absolute(name), this.lookup.bind(this));
  else
    this.send();
};
