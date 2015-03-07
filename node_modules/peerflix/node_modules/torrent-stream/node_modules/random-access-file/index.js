var fs = require('fs');
var thunky = require('thunky');
var path = require('path');
var EventEmitter = require('events').EventEmitter;
var util = require('util');

var POOL_SIZE = 512*1024;

var noop = function() {};
var pool = null;
var used = 0;

var alloc = function(size) {
	if (size >= POOL_SIZE) return new Buffer(size);

	if (!pool || used+size > pool.length) {
		used = 0;
		pool = new Buffer(POOL_SIZE);
	}

	return pool.slice(used, used += size);
};

var RandomAccessFile = function(filename, size) {
	if (!(this instanceof RandomAccessFile)) return new RandomAccessFile(filename, size);
	EventEmitter.call(this);

	var self = this;
	this.filename = filename;
	this.fd = null;
	this.opened = false;
	this.open = thunky(function(callback) {
		var onfinish = function(err, fd) {
			if (err) return callback(err);
			self.fd = fd;
			self.emit('open');
			callback(err, self);
		};

		self.opened = true;
		fs.exists(filename, function(exists) {
			fs.open(filename, exists ? 'r+' : 'w+', function(err, fd) {
				if (err || typeof size !== 'number') return onfinish(err, fd);
				fs.ftruncate(fd, size, function(err) {
					if (err) return onfinish(err);
					onfinish(null, fd);
				});
			});
		});
	});
};

util.inherits(RandomAccessFile, EventEmitter);

RandomAccessFile.prototype.close = function(callback) {
	callback = callback || noop;

	var self = this;
	var onclose = function() {
		self.emit('close');
		callback();
	};

	if (!this.opened) return process.nextTick(onclose);
	this.open(function(err) {
		if (err) return callback(err);
		fs.close(self.fd, function(err) {
			if (err) return callback(err);
			onclose();
		});
	});
};

RandomAccessFile.prototype.read = function(offset, length, callback) {
	this.open(function(err, self) {
		if (err) return callback(err);
		fs.read(self.fd, alloc(length), 0, length, offset, function(err, read, buffer) {
			if (read !== buffer.length) return callback(new Error('range not satisfied'));
			callback(err, buffer);
		});
	});
};

RandomAccessFile.prototype.write = function(offset, buffer, callback) {
	callback = callback || noop;
	if (typeof buffer === 'string') buffer = new Buffer(buffer);
	this.open(function(err, self) {
		if (err) return callback(err);
		fs.write(self.fd, buffer, 0, buffer.length, offset, callback);
	});
};

RandomAccessFile.prototype.unlink = function(callback) {
	callback = callback || noop;
	var self = this;
	this.close(function(err) {
		if (err) return callback(err);
		fs.unlink(self.filename, callback);
	});
};

module.exports = RandomAccessFile;