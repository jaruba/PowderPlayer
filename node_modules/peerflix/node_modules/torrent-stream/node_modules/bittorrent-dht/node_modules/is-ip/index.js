'use strict';
var ipRegex = require('ip-regex');

var ip = module.exports = function (str) {
	return ipRegex({exact: true}).test(str);
};

ip.v4 = function (str) {
	return ipRegex.v4({exact: true}).test(str);
};

ip.v6 = function (str) {
	return ipRegex.v6({exact: true}).test(str);
};
