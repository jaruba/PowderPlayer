// Copyright 2011 Timothy J Fontaine <tjfontaine@gmail.com>
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

var ipaddr = require('ipaddr.js'),
    net = require('net'),
    util = require('util'),
    EventEmitter = require('events').EventEmitter,
    PendingRequests = require('./pending'),
    Packet = require('./packet'),
    consts = require('native-dns-packet').consts,
    utils = require('./utils'),
    platform = require('./platform');

var A = consts.NAME_TO_QTYPE.A,
    AAAA = consts.NAME_TO_QTYPE.AAAA,
    MX = consts.NAME_TO_QTYPE.MX,
    TXT = consts.NAME_TO_QTYPE.TXT,
    NS = consts.NAME_TO_QTYPE.NS,
    CNAME = consts.NAME_TO_QTYPE.CNAME,
    SRV = consts.NAME_TO_QTYPE.SRV,
    PTR = consts.NAME_TO_QTYPE.PTR;

var debug = function() {};

if (process.env.NODE_DEBUG && process.env.NODE_DEBUG.match(/dns/)) {
debug = function debug() {
  var args = Array.prototype.slice.call(arguments);
  console.error.apply(this, ['client', Date.now().toString()].concat(args));
};
}

var Request = exports.Request = function(opts) {
  if (!(this instanceof Request)) return new Request(opts);

  this.question = opts.question;
  this.server = opts.server;

  if (typeof(this.server) === 'string' || this.server instanceof String)
    this.server = { address: this.server, port: 53, type: 'udp'};

  if (!this.server || !this.server.address || !net.isIP(this.server.address))
    throw new Error('Server object must be supplied with at least address');

  if (!this.server.type || ['udp', 'tcp'].indexOf(this.server.type) === -1)
    this.server.type = 'udp';

  if (!this.server.port)
    this.server.port = 53;

  this.timeout = opts.timeout || 4 * 1000;
  this.try_edns = opts.try_edns || false;

  this.fired = false;
  this.id = undefined;

  if (opts.cache || opts.cache === false) {
    this.cache = opts.cache;
  } else {
    this.cache = platform.cache;
  }
  debug('request created', this.question);
};
util.inherits(Request, EventEmitter);

Request.prototype.handle = function(err, answer, cached) {
  if (!this.fired) {
    debug('request handled', this.id, this.question);

    if (!cached && this.cache && this.cache.store && answer) {
      this.cache.store(answer);
    }

    this.emit('message', err, answer);
    this.done();
  }
};

Request.prototype.done = function() {
  debug('request finished', this.id, this.question);
  this.fired = true;
  clearTimeout(this.timer_);
  PendingRequests.remove(this);
  this.emit('end');
  this.id = undefined;
};

Request.prototype.handleTimeout = function() {
  if (!this.fired) {
    debug('request timedout', this.id, this.question);
    this.emit('timeout');
    this.done();
  }
};

Request.prototype.error = function(err) {
  if (!this.fired) {
    debug('request error', err, this.id, this.question);
    this.emit('error', err);
    this.done();
  }
};

Request.prototype.send = function() {
  debug('request starting', this.question);
  var self = this;

  if (this.cache && this.cache.lookup) {
    this.cache.lookup(this.question, function(results) {
      var packet;

      if (!results) {
        self._send();
      } else {
        packet = new Packet();
        packet.answer = results.slice();
        self.handle(null, packet, true);
      }
    });
  } else {
    this._send();
  }
};

Request.prototype._send = function() {
  debug('request not in cache', this.question);
  var self = this;

  this.timer_ = setTimeout(function() {
    self.handleTimeout();
  }, this.timeout);

  PendingRequests.send(self);
};

Request.prototype.cancel = function() {
  debug('request cancelled', this.id, this.question);
  this.emit('cancelled');
  this.done();
};

var _queue = [];

var sendQueued = function() {
  debug('platform ready sending queued requests');
  _queue.forEach(function(request) {
    request.start();
  });
  _queue = [];
};

platform.on('ready', function() {
  sendQueued();
});

if (platform.ready) {
  sendQueued();
}

var Resolve = function Resolve(opts, cb) {
  if (!(this instanceof Resolve)) return new Resolve(opts, cb);

  this.opts = util._extend({
    retryOnTruncate: true,
  }, opts);

  this._domain = opts.domain;
  this._rrtype = opts.rrtype;

  this._buildQuestion(this._domain);

  this._started = false;
  this._current_server = undefined;

  this._server_list = [];

  if (opts.remote) {
    this._server_list.push({
      address: opts.remote,
      port: 53,
      type: 'tcp',
    });
    this._server_list.push({
      address: opts.remote,
      port: 53,
      type: 'udp',
    });
  }

  this._request = undefined;
  this._type = 'getHostByName';
  this._cb = cb;

  if (!platform.ready) {
    _queue.push(this);
  } else {
    this.start();
  }
};
util.inherits(Resolve, EventEmitter);

Resolve.prototype.cancel = function() {
  if (this._request) {
    this._request.cancel();
  }
};

Resolve.prototype._buildQuestion = function(name) {
  debug('building question', name);
  this.question = {
    type: this._rrtype,
    class: consts.NAME_TO_QCLASS.IN,
    name: name
  };
};
exports.Resolve = Resolve;

Resolve.prototype._emit = function(err, answer) {
  debug('resolve end', this._domain);
  var self = this;
  process.nextTick(function() {
    if (err) {
      err.syscall = self._type;
    }
    self._cb(err, answer);
  });
};

Resolve.prototype._fillServers = function() {
  debug('resolve filling servers', this._domain);
  var tries = 0, s, t, u, slist;

  slist = platform.name_servers;

  while (this._server_list.length < platform.attempts) {
    s = slist[tries % slist.length];

    u = {
      address: s.address,
      port: s.port,
      type: 'udp'
    };

    t = {
      address: s.address,
      port: s.port,
      type: 'tcp'
    };

    this._server_list.push(u);
    this._server_list.push(t);

    tries += 1;
  }

  this._server_list.reverse();
};

Resolve.prototype._popServer = function() {
  debug('resolve pop server', this._current_server, this._domain);
  this._server_list.splice(0, 1, this._current_server);
};

Resolve.prototype._preStart = function() {
  if (!this._started) {
    this._started = new Date().getTime();
    this.try_edns = platform.edns;

    if (!this._server_list.length)
      this._fillServers();
  }
};

Resolve.prototype._shouldContinue = function() {
  debug('resolve should continue', this._server_list.length, this._domain);
  return this._server_list.length;
};

Resolve.prototype._nextQuestion = function() {
  debug('resolve next question', this._domain);
};

Resolve.prototype.start = function() {
  if (!this._started) {
    this._preStart();
  }

  if (this._server_list.length === 0) {
    debug('resolve no more servers', this._domain);
    this.handleTimeout();
  } else {
    this._current_server = this._server_list.pop();
    debug('resolve start', this._current_server, this._domain);

    this._request = Request({
      question: this.question,
      server: this._current_server,
      timeout: platform.timeout,
      try_edns: this.try_edns
    });

    this._request.on('timeout', this._handleTimeout.bind(this));
    this._request.on('message', this._handle.bind(this));
    this._request.on('error', this._handle.bind(this));

    this._request.send();
  }
};

var NOERROR = consts.NAME_TO_RCODE.NOERROR,
    SERVFAIL = consts.NAME_TO_RCODE.SERVFAIL,
    NOTFOUND = consts.NAME_TO_RCODE.NOTFOUND,
    FORMERR = consts.NAME_TO_RCODE.FORMERR;

Resolve.prototype._handle = function(err, answer) {
  var rcode, errno;

  if (answer) {
    rcode = answer.header.rcode;
  }

  debug('resolve handle', rcode, this._domain);

  switch (rcode) {
    case NOERROR:
      // answer trucated retry with tcp
      //console.log(answer);
      if (answer.header.tc &&
          this.opts.retryOnTruncate &&
          this._shouldContinue()) {
        debug('truncated', this._domain, answer);
        this.emit('truncated', err, answer);
        
        // remove udp servers
        this._server_list = this._server_list.filter(function(server) {
          return server.type === 'tcp';
        });
        answer = undefined;
      }
      break;
    case SERVFAIL:
      if (this._shouldContinue()) {
        this._nextQuestion();
        //this._popServer();
      } else {
        errno = consts.SERVFAIL;
      }
      answer = undefined;
      break;
    case NOTFOUND:
      if (this._shouldContinue()) {
        this._nextQuestion();
      } else {
        errno = consts.NOTFOUND;
      }
      answer = undefined;
      break;
    case FORMERR:
      if (this.try_edns) {
        this.try_edns = false;
        //this._popServer();
      } else {
        errno = consts.FORMERR;
      }
      answer = undefined;
      break;
    default:
      if (!err) {
        errno = consts.RCODE_TO_NAME[rcode];
        answer = undefined;
      } else {
        errno = consts.NOTFOUND;
      }
      break;
  }

  if (errno || answer) {
    if (errno) {
      err = new Error(this._type + ' ' + errno);
      err.errno = err.code = errno;
    }
    this._emit(err, answer);
  } else {
    this.start();
  }
};

Resolve.prototype._handleTimeout = function() {
  var err;

  if (this._server_list.length === 0) {
    debug('resolve timeout no more servers', this._domain);
    err = new Error(this._type + ' ' + consts.TIMEOUT);
    err.errno = consts.TIMEOUT;
    this._emit(err, undefined);
  } else {
    debug('resolve timeout continue', this._domain);
    this.start();
  }
};

var resolve = function(domain, rrtype, ip, callback) {
  var res;

  if (!callback) {
    callback = ip;
    ip = undefined;
  }

  if (!callback) {
    callback = rrtype;
    rrtype = undefined;
  }

  rrtype = consts.NAME_TO_QTYPE[rrtype || 'A'];

  if (rrtype === PTR) {
    return reverse(domain, callback);
  }

  var opts = {
    domain: domain,
    rrtype: rrtype,
    remote: ip,
  };

  res = new Resolve(opts);

  res._cb = function(err, response) {
    var ret = [], i, a;

    if (err) {
      callback(err, response);
      return;
    }

    for (i = 0; i < response.answer.length; i++) {
      a = response.answer[i];
      if (a.type === rrtype) {
        switch (rrtype) {
          case A:
          case AAAA:
            ret.push(a.address);
            break;
          case consts.NAME_TO_QTYPE.MX:
            ret.push({
              priority: a.priority,
              exchange: a.exchange
            });
            break;
          case TXT:
          case NS:
          case CNAME:
          case PTR:
            ret.push(a.data);
            break;
          case SRV:
            ret.push({
              priority: a.priority,
              weight: a.weight,
              port: a.port,
              name: a.target
            });
            break;
          default:
            ret.push(a);
            break;
        }
      }
    }

    if (ret.length === 0) {
      ret = undefined;
    }

    callback(err, ret);
  };

  return res;
};
exports.resolve = resolve;

var resolve4 = function(domain, callback) {
  return resolve(domain, 'A', function(err, results) {
    callback(err, results);
  });
};
exports.resolve4 = resolve4;

var resolve6 = function(domain, callback) {
  return resolve(domain, 'AAAA', function(err, results) {
    callback(err, results);
  });
};
exports.resolve6 = resolve6;

var resolveMx = function(domain, callback) {
  return resolve(domain, 'MX', function(err, results) {
    callback(err, results);
  });
};
exports.resolveMx = resolveMx;

var resolveTxt = function(domain, callback) {
  return resolve(domain, 'TXT', function(err, results) {
    callback(err, results);
  });
};
exports.resolveTxt = resolveTxt;

var resolveSrv = function(domain, callback) {
  return resolve(domain, 'SRV', function(err, results) {
    callback(err, results);
  });
};
exports.resolveSrv = resolveSrv;

var resolveNs = function(domain, callback) {
  return resolve(domain, 'NS', function(err, results) {
    callback(err, results);
  });
};
exports.resolveNs = resolveNs;

var resolveCname = function(domain, callback) {
  return resolve(domain, 'CNAME', function(err, results) {
    callback(err, results);
  });
};
exports.resolveCname = resolveCname;

var reverse = function(ip, callback) {
  var error, opts, res;

  if (!net.isIP(ip)) {
    error = new Error('getHostByAddr ENOTIMP');
    error.errno = error.code = 'ENOTIMP';
    throw error;
  }

  opts = {
    domain: utils.reverseIP(ip),
    rrtype: PTR
  };

  res = new Lookup(opts);

  res._cb = function(err, response) {
    var results = [];

    if (response) {
      response.answer.forEach(function(a) {
        if (a.type === PTR) {
          results.push(a.data);
        }
      });
    }

    if (results.length === 0) {
      results = undefined;
    }

    callback(err, results);
  };

  return res;
};
exports.reverse = reverse;

var Lookup = function(opts) {
  Resolve.call(this, opts);
  this._type = 'getaddrinfo';
};
util.inherits(Lookup, Resolve);

Lookup.prototype.start = function() {
  var self = this;

  if (!this._started) {
    this._search_path = platform.search_path.slice(0);
    this._preStart();
  }

  platform.hosts.lookup(this.question, function(results) {
    var packet;
    if (results && results.length) {
      debug('Lookup in hosts', results);
      packet = new Packet();
      packet.answer = results.slice();
      self._emit(null, packet);
    } else {
      debug('Lookup not in hosts');
      Resolve.prototype.start.call(self);
    }
  });
};

Lookup.prototype._shouldContinue = function() {
  debug('Lookup should continue', this._server_list.length,
        this._search_path.length);
  return this._server_list.length && this._search_path.length;
};

Lookup.prototype._nextQuestion = function() {
  debug('Lookup next question');
  this._buildQuestion([this._domain, this._search_path.pop()].join('.'));
};

var lookup = function(domain, family, callback) {
  var rrtype, revip, res;

  if (!callback) {
    callback = family;
    family = undefined;
  }

  if (!family) {
    family = 4;
  }

  revip = net.isIP(domain);

  if (revip === 4 || revip === 6) {
    process.nextTick(function() {
      callback(null, domain, revip);
    });
    return {};
  }

  if (!domain) {
    process.nextTick(function() {
      callback(null, null, family);
    });
    return {};
  }

  rrtype = consts.FAMILY_TO_QTYPE[family];

  var opts = {
    domain: domain,
    rrtype: rrtype
  };

  res = new Lookup(opts);

  res._cb = function(err, response) {
    var i, afamily, address, a, all;

    if (err) {
      callback(err, undefined, undefined);
      return;
    }

    all = response.answer.concat(response.additional);

    for (i = 0; i < all.length; i++) {
      a = all[i];

      if (a.type === A || a.type === AAAA) {
        afamily = consts.QTYPE_TO_FAMILY[a.type];
        address = a.address;
        break;
      }
    }

    callback(err, address, afamily);
  };

  return res;
};
exports.lookup = lookup;
