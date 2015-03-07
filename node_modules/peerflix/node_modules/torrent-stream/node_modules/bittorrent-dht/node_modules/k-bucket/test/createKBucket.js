"use strict";

var KBucket = require('../index.js');

var test = module.exports = {};

test['localNodeId should be a random SHA-1 if not provided'] = function (test) {
    test.expect(2);
    var kBucket = new KBucket();
    test.ok(kBucket.localNodeId instanceof Buffer);
    test.equal(kBucket.localNodeId.length, 20); // SHA-1 is 160 bits (20 bytes)
    test.done();
};

test['localNodeId is a Buffer populated from options if options.localNodeId Buffer is provided'] = function (test) {
    var localNodeId = new Buffer("some length");
    test.expect(2);
    var kBucket = new KBucket({localNodeId: localNodeId});
    test.ok(kBucket.localNodeId instanceof Buffer);
    test.equal(kBucket.localNodeId, localNodeId);
    test.done();
};

test['localNodeId is a Buffer populated from options if options.localNodeId String is provided'] = function (test) {
    var localNodeId = "some identifier";
    test.expect(2);
    var kBucket = new KBucket({localNodeId: localNodeId});
    test.ok(kBucket.localNodeId instanceof Buffer);
    test.deepEqual(kBucket.localNodeId, new Buffer("some identifier", 'base64'));
    test.done();
};

test['root is \'self\' if not provided'] = function (test) {
    test.expect(1);
    var kBucket = new KBucket();
    test.equal(kBucket.root, kBucket);
    test.done();
};