# random-access-file

Continuous reading or writing to a file using random offsets and lengths

	npm install random-access-file

## Why?

If you are receiving a file in multiple pieces in a distributed system it can be useful to write
these pieces to disk one by one in various places throughout the file without having to open and
close a file descriptor all the time.

random-access-file allows you to do just this.

## It is easy to use

``` js
var randomAccessFile = require('random-access-file');

// an optional file size can be given as 2nd param to randomAccessFile
var file = randomAccessFile('my-file.txt');

file.write(10, new Buffer('hello'), function(err) {
    // write a buffer to offset 10
    file.read(10, 5, function(err, buffer) {
        console.log(buffer); // read 5 bytes from offset 10
        file.close(function() {
        	console.log('file is closed');
        });
    });
});
```

file will use an open file descriptor. When you are done with the file you should call file.close().

## License

MIT