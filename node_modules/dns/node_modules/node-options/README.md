Command line argument parser
[![Build Status](https://travis-ci.org/hbouvier/node-options.png)](https://travis-ci.org/hbouvier/node-options)
[![Coverage Status](https://coveralls.io/repos/hbouvier/node-options/badge.png)](https://coveralls.io/r/hbouvier/node-options)
[![dependency Status](https://david-dm.org/hbouvier/node-options/status.png?theme=shields.io)](https://david-dm.org/hbouvier/node-options#info=dependencies)
[![devDependency Status](https://david-dm.org/hbouvier/node-options/dev-status.png?theme=shields.io)](https://david-dm.org/hbouvier/node-options#info=devDependencies)
[![NPM version](https://badge.fury.io/js/node-options.png)](http://badge.fury.io/js/node-options)

========
#

This module is a command line argument parser, based on regular expression.
It is able to validate the arguments based on the "properties" of an object.

#LICENSE:

This module is licensed under the Apache License v2.0

# Installation

npm install node-options

# Usage

    var options = require('options');

    // A simple use case for an http server could be that you want to be able
    // to specify the port number on which your server will listen by having
    // a default value in the code (e.g. 3000) or use the PORT environment
    // variable, if it is present or finally specify the port number on the
    // command line (e.g. --port=8080). You could also change your server
    // verbosity (e.g. logging) by adding "--verbose" to the command line.
    // Finaly, you want to be able to change the path from which your server
    // would serve the "static" html pages.
    //
    var opts =  {
                  "port"    : process.env.PORT | 3000,
                  "verbose" : false
                };

    // Remove the first two arguments, which are the 'node' binary and the name
    // of your script.
    var result = options.parse(process.argv.slice(2), opts);

    // If an argument was passed on the command line, but was not defined in
    // the "opts" object, lets print the USAGE.
    if (result.errors) {
        if (opts.verbose) console.log('Unknown argument(s): "' + result.errors.join('", "') + '"');
        console.log('USAGE: [--port=3000] [--verbose] [public/path/to/static/resources]');
        process.exit(-1);
    }

    console.log('port=', opts.port);
    console.log('verbose=', opts.verbose);
    if (result.args)
        if (result.args.length === 1) {
            console.log('public=', result.args)
        } else {
            console.log('Only one non-option argument is supported by the app: '" + result.result.join('", "') + '"');
            process.exit(-2);
        }
    }

# Other usage

If you want to pass some arguments to another process "as-is", the parser
support the double-dash as an indicator to grab all the arguments left and
return them in the "result.passThrough" property.

# Sample

    node server.js --verbose --port=80 proxy.json -- --port=80 ./public/static/www
                   ^         ^         ^             ^         ^
                   |         |         |             |         |
     opt.verbose --+         |         |             |         |
     opt.port ---------------+         |             |         |
     result.args[0] -------------------+             |         |
     result.end[0] ----------------------------------+         |
     result.end[1] --------------------------------------------+

 All the options needs to be first (e.g. --XXX) and they are stored in the object
 passed to the parse function (e.g. options.parse(arguments.argv.slice(2), OBJECT).
 After the options, the "free form" files, paths, text is stored into the returned
 object inside the property 'args' which is an array. Lastly, if a double dash
 is encountered everyting afterward is in the returned object property 'end'.

