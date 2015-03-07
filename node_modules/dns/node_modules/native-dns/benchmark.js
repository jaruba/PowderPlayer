'use strict';

var assert = require('assert');
var EventEmitter = require('events').EventEmitter;
var util = require('util');

/*
Does ramping up "concurrency" test our ability to keep track of
multiple queries in flight, or does it just benchmark process.nextTick?

output format: <library> <oncurrency> <time> <completed queries / time>

results with caching
====================

stock 1 0.304 3289.4736842105262
stock 2 0.139 7194.244604316546
stock 4 0.067 14925.373134328358
stock 8 0.037 27027.027027027027
stock 16 0.037 27027.027027027027
stock 32 0.031 32258.064516129034
stock 64 0.033 30303.0303030303
stock 128 0.032 31250
stock 256 0.031 32258.064516129034
stock 512 0.03 33333.333333333336
stock 1024 5.08 196.8503937007874

native-dns 1 0.18 5555.555555555556
native-dns 2 0.113 8849.557522123894
native-dns 4 0.083 12048.192771084337
native-dns 8 0.08 12500
native-dns 16 0.079 12658.227848101265
native-dns 32 0.076 13157.894736842105
native-dns 64 0.085 11764.70588235294
native-dns 128 0.067 14925.373134328358
native-dns 256 0.068 14705.882352941175
native-dns 512 0.096 10416.666666666666
native-dns 1024 0.129 7751.937984496124

results without caching
=======================

stock 1 0.543 1841.6206261510129
stock 2 0.143 6993.006993006994
stock 4 0.068 14705.882352941175
stock 8 0.036 27777.77777777778
stock 16 0.032 31250
stock 32 0.034 29411.76470588235
stock 64 0.037 27027.027027027027
stock 128 0.032 31250
stock 256 0.037 27027.027027027027
stock 512 5.117 195.42700801250732
stock 1024 6.011 166.36167027116952

native-dns 1 0.517 1934.2359767891683
native-dns 2 0.309 3236.2459546925566
native-dns 4 0.236 4237.28813559322
native-dns 8 0.216 4629.62962962963
native-dns 16 0.164 6097.560975609756
native-dns 32 0.157 6369.426751592357
native-dns 64 0.15 6666.666666666667
native-dns 128 0.18 5555.555555555556
native-dns 256 0.176 5681.818181818182
native-dns 512 0.173 5780.346820809249
native-dns 1024 0.164 6097.560975609756
*/

var names = [
  'www.google.com',
  'www.facebook.com',
  'www.intel.com',
  'www.amd.com',
  'www.yahoo.com',
  'www.msnbc.com',
  'www.microsoft.com',
  'www.apple.com',
  'www.youtube.com',
  'www.amazon.com',
  'www.twitter.com',
  'www.ebay.com',
  'www.ask.com',
  'www.aol.com',
  'www.reddit.com',
  'www.wikipedia.org',
  'www.wordpress.com',
  'www.linkedin.com',
];

var Bench = function(name, library, count, concurrency) {
  this.name = name;
  this.library = library;
  this.count = count;
  this.completed = 0;
  this.dispatched = 0;
  this.concurrency = concurrency;
  this.ended = false;
};
util.inherits(Bench, EventEmitter);

var nextTick = process.nextTick;
var nextTick = global.setImmediate || process.nextTick;

Bench.prototype.start = function() {
  var i, self = this;

  this.start = Date.now();

  for (i = 0; i < this.concurrency; i++) {
    nextTick(function() {
      self.query();
    });
  }
};

Bench.prototype.query = function() {
  var self = this;

  if (this.dispatched < this.count) {
    this.dispatched += 1;
    this.library.resolve(names[this.dispatched % names.length], 'A', function (err, res) {
      self.done = Date.now();
      if (err) {
        self.count = 0;
        console.log(err);
        console.log(err.stack);
        self.end();
      } else {
        self.completed += 1;
        self.query();
      }
    });
  } else if(this.completed === this.count) {
    this.end();
  }
};

var results = {};

Bench.prototype.end = function() {
  if (this.ended) return;

  this.ended = true;

  var total_seconds = (this.done - this.start) / 1000;

  if (!results[this.name]) {
    results[this.name] = {};
  }

  results[this.name][this.concurrency] = {
    time: total_seconds,
    completed: this.completed,
    qps: this.completed/total_seconds,
  };

  this.emit('end');
};

var opt = require('optimist').usage('Usage: $0 <library> <concurrency> <queries>');
var argv = opt.argv._;

if (argv.length != 3) {
  opt.showHelp()
  process.exit(1)
}

var library_name = argv[0].toLowerCase();
var concurrent = parseInt(argv[1]);
var queries = parseInt(argv[2]);

if (['stock', 'native-dns'].indexOf(library_name) === -1) {
  opt.showHelp();
  console.error('library should be one of: stock, native-dns\r\n');
  process.exit(1);
}

if (isNaN(concurrent) || isNaN(queries)) {
  opt.showHelp();
  console.error('concurrency and queries should be integers');
  process.exit(1);
}

var library;

if (library_name === 'stock') {
  library = require('dns');
} else {
  library = require('./dns');
  // to be fair don't cache
  library.platform.cache = false;
}

var bench = new Bench(library_name, library, queries, concurrent);

function check() {
  if (library.platform && !library.platform.ready)
    nextTick(check)
  else
    bench.start()
}

bench.on('end', function () {
  Object.keys(results).forEach(function(library) {
    var l = results[library];
    Object.keys(results[library]).forEach(function(concurrency) {
      var r = l[concurrency];
      console.log(library, concurrency, r.time, r.qps);
    });
  });
});

check();
