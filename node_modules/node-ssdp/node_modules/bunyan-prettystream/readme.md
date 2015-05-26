  [![Build Status](https://secure.travis-ci.org/mrrama/node-bunyan-prettystream.png?branch=master)](http://travis-ci.org/mrrama/node-bunyan-prettystream)
  [![Coverage Status](https://coveralls.io/repos/mrrama/node-bunyan-prettystream/badge.png?branch=master)](https://coveralls.io/r/mrrama/node-bunyan-prettystream?branch=master)

bunyan-prettystream is a stream based implementation of the [Bunyan][bunyan] CLI tool's pretty printing capabilities. It allows
apps using bunyan to log directly to the console or file in human readable format instead of as JSON without having to
run or pipe into the bunyan tool. This is useful for working with IDEs which do not have the ability to pipe console
output to another application (such as WebStorm).

This library is only really meant for development and should not be used on production environments.

# Usage

  ```javascript
  var bunyan = require('bunyan');
  var PrettyStream = require('bunyan-prettystream');

  var prettyStdOut = new PrettyStream();
  prettyStdOut.pipe(process.stdout);

  var log = bunyan.createLogger({
          name: 'foo',
          streams: [{
              level: 'debug',
              type: 'raw',
              stream: prettyStdOut
          }]
  });
  ```

# Tests

Running unit tests requires `mocha` installed.

  ```bash
  make test
  ```

## Coverage

  ```bash
  make coverage
  ```

# License

(The MIT License)

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

[bunyan]: https://github.com/trentm/node-bunyan

