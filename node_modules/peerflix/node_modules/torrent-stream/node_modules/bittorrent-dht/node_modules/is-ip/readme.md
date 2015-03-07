# is-ip [![Build Status](https://travis-ci.org/sindresorhus/is-ip.svg?branch=master)](https://travis-ci.org/sindresorhus/is-ip)

> Check if a string is an IP address


## Install

```sh
$ npm install --save is-ip
```


## Usage

```js
var isIp = require('is-ip');

isIp('192.168.0.1');
//=> true

isIp('1:2:3:4:5:6:7:8');
//=> true

isIp.v4('1:2:3:4:5:6:7:8');
//=> false
```


## API

### isIp(string)

Check if a string is IPv4 or IPv6.

### isIp.v4(string)

Check if a string is IPv4.

### isIp.v6(string)

Check if a string is IPv6.


## License

MIT © [Sindre Sorhus](http://sindresorhus.com)
