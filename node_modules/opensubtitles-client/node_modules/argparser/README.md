argparser
==================
[Node.js] Parses command line args and options.

## Installation ##
    git clone git://github.com/shinout/argparser.git

    OR

    npm install argparser

## Usage ##

a command 

    node script.js -r --num 100 file1.txt 11

in script.js

    var ap = require('argparser')
             .files(0)
             .nums(1, "num")
             .nonvals('r')
             .parse();

    var file = ap.arg(0) // "file1.txt"
    var n    = ap.arg(1) // 11
    var num  = ap.opt("num") // 100
    var r    = ap.opt("r")   // true

## API Documentation ##
- ArgParser.create()
- ap.vals()
- ap.nonvals()
- ap.files()
- ap.dirs()
- ap.nums()
- ap.defaults()
- ap.err()
- ap.arglen()
- ap.parse(arr)
- ap.opt(op1, op2, ...)
- ap.arg()
- ap.stringify()
- ap.invalids()
- ap.emptyValue

### ArgParser.create() ###
Creates an instance of ArgParser.

    var ap = ArgParser.create().parse();

This can be omitted using **shortcut methods**.

Returns an instance of ArgParser.

### ap.vals() ###
Adds options with value.

a command 

    node script.js --seq ACTG -n 1

in script.js

    var ap = require('argparser')
             .vals("n", "seq")
             .parse();

    var n   = ap.opt("n")   // "1"
    var seq = ap.opt("seq") // "ACTG"

"--" is used for long option name (more than one characters).

"-" is used for short option name (just one character).

    node script.js --long long -s short

Returns this.

### ap.nonvals() ###
Adds options without values.

a command 

    node script.js -t --no-save

in script.js

    var ap = require('argparser')
             .nonvals("t", "no-save")
             .parse();

    var t      = ap.opt("t")       // true
    var nosave = ap.opt("no-save") // true

"--" is used for long option name (more than one characters).

"-" is used for short option name (just one character).

    node script.js --long -s

Returns this.

### ap.files() ###
Specifies an argument or an option is a file.

These values are checked in **ap.parse()**.

If there is an invalid filename, an exception is thrown.

a command 

    node script.js --txt foo.txt bar.txt

in script.js

    var ap = require('argparser')
             .files("txt", 0)
             .parse();

    var txt    = ap.opt("txt")  // "foo.txt"
    var nosave = ap.arg(0)      // "bar.txt"

"0" in the example means the first argument.

"1" will be the second, and so on.

We don't need to call **ap.vals()** to the option name used in **ap.files()**.

Returns this.


### ap.dirs() ###
Specifies an argument or an option is a directory.

The same specs as **ap.files()**.

Returns this.

### ap.nums() ###
Specifies an argument or an option is a number.

If isNaN, an exception is thrown.

a command 

    node script.js -n 11 bar.txt 300

in script.js

    var ap = require('argparser')
             .files(0)
             .nums("n", 1)
             .parse();

    var file   = ap.arg(0)   // "bar.txt"
    var n      = ap.opt("n") // 11 
    console.log(typeof n) // "number"
    var num    = ap.arg(1) // 300
    console.log(typeof num) // "number"

The same specs as **ap.files()**.

Returns this.


### ap.defaults(obj, noSetNums) ###
set default values to options with a value.

a command 

    node script.js

in script.js

    var ap = require('argparser')
             .defaults({
               n : 3,
               file : "file1.txt"
              })
             .files("file")
             .parse();

    var n = ap.opt("n") // 3
    var file = ap.opt("file") // "file1.txt"

If **noSetNums** is true, **ap.nums()** is not called to options
whose default value is number.
By default, **ap.nums()** are called to these options automatically.


### ap.err(fn) ###
Registers a function called when an error is thrown in parsing.

The argument passed to **fn** is the thrown error.

Return value of the function is the return value of **ap.parse()**.

By default, it returns **false**.

    var ap = require('argparser')
             .files(0)
             .err(function(e) {
               console.error(e.message)
               console.error("[usage]\n\tnode", __filename, "<file>")
             })
             .parse();

    if (!ap) process.exit();


### ap.arglen(min, max) ###
Registers a limit of argument length.

ArgParser throws an error if **min** is larger than arguments.length.

ArgParser throws an error if **max** is smaller than arguments.length.

We can set just **min** like the following sample.

    var ap = require('argparser')
             .arglen(3) // three arguments are required
             .parse();



### ap.parse(arr) ###
Parses arguments.

**arr** is optional.

If **arr** is not set, parses **process.argv** (without process.argv[0] and process.argv[1]).

    var ap = require('argparser').files(0, "f").parse(["-f", "file1.txt", "file2.txt"]);
    var f  = ap.opt("f"); // "file1.txt"
    var f2 = ap.arg(0);   // "file2.txt"


### ap.arg() ###
Get arguments. 

a command 

    node script.js arg1 arg2 --opt arg3 --valopt optval

in script.js

    var ap = require('argparser')
             .vals("valopt")
             .nonvals("opt")
             .parse();

    var a1 = ap.arg(0); // arg1
    var a2 = ap.arg(1); // arg2
    var a3 = ap.arg(2); // arg3
    var a4 = ap.arg(3); // undefined


### ap.opt(op1, op2, ...) ###
Get options value.

a command 

    node script.js -o --valopt optval arg1 --aaa
 
in script.js

    var ap = require('argparser')
             .vals("valopt", "v2")
             .nonvals("o", "opt")
             .parse();

When registered vals options are passed, returns the value.

    var o1 = ap.opt("valopt"); // "optval"

When registered nonvals options are passed, returns true.

    var o2 = ap.opt("o");      // true


When registered options are not passed, returns **ap.emptyValue**.
    
    console.log(ap.emptyValue) // false
    var o3 = ap.opt("opt");    // false
    var o4 = ap.opt("v2");     // false

**ap.emptyValue** is writable.


If multiple arguments are passed, the first matched value is returned.

    var o3 = ap.opt("opt", "o");    // true
    var o4 = ap.opt("valopt", "v2); // "optval"


When not a registered option is passed, it is parsed as an invalid nonval option.

    var o5 = ap.opt("aaa");    // true
    var o6 = ap.invalids();    // ["aaa"]
    var o7 = ap.opt("eee");    // undefined


### ap.emptyValue ###
When a registered options is not set, this value is returned in **ap.opt()**.

    ap.emptyValue = null


### ap.invalids() ###
Gets a list of invalid options.

a command 

    node script.js -a --bcd

in script.js

    var ap = require('argparser').parse();
    var list = ap.invalid();
    console.log(list); // "a", "bcd"


### ap.stringify() ###
Gets canonical format.

a command 

    node script.js -a 1 arg1 -t --invalid_opt --bcd file.txt arg2 arg3

in script.js

    var ap = require('argparser')
             .vals("a", "bcd")
             .nonvals("t")
             .parse();
    console.log(ap.stringify()); // -t -a 1 --bcd file.txt arg1 arg2 arg3

**Note that invalid options are removed.**

## shortcut methods ##

- ArgParser.vals()
- ArgParser.nonvals()
- ArgParser.files()
- ArgParser.dirs()
- ArgParser.nums()
- ArgParser.defaults()
- ArgParser.parse()

    ArgParser.vals("a")

is completely equivalent to

    ArgParser.create().vals("a")

## licence ##
(The MIT License)

Copyright (c) 2011-2012 SHIN Suzuki <shinout310@gmail.com>

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
