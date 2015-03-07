var request = require('request');
var extend = require('xtend');
var fs = require('fs');
var zlib = require('zlib');
var parseTorrent = require('parse-torrent');
var magnet = require('magnet-uri');

module.exports = function readTorrent(url, options, callback) {
    // Check if we have a callback
    if (!callback) {
        callback = options;
        options = {};
    }

    // Ensure true async callback, no matter what.
    var asyncCallback = function(err, result, data) {
        process.nextTick(function() {
            callback(err, result, data);
        });
    };

    var onData = function(err, data) {
        if (err) return asyncCallback(err);
        try {
            var result = parseTorrent(data);
        } catch (e) {
            return asyncCallback(e);
        }
        asyncCallback(null, result, data);
    };

    var onMagnet = function(data) {
        try {
            var result = magnet(url);
        } catch (e) {
            return asyncCallback(e);
        }

        if (result) return asyncCallback(null, result, data);
        asyncCallback(new Error('Malformed Magnet URI'));
    };

    var onResponse = function(err, response) {
        if (err) return asyncCallback(err);
        if (response.statusCode >= 400) return asyncCallback(new Error('Bad Response: ' + response.statusCode));
        if (response.headers['content-encoding'] === 'gzip') return zlib.gunzip(response.body, onData);
        onData(null, response.body);
    };

    if (Buffer.isBuffer(url)) return onData(null, url);
    if (/^https?:/.test(url)) return request(extend({ url: url, encoding: null }, options), onResponse);
    if (/^magnet:/.test(url)) return onMagnet(url);

    fs.readFile(url, onData);
};