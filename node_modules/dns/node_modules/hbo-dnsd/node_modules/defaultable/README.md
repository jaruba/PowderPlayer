# Default options for NodeJS, NPM, and CommonJS modules

Defaultable is a simple drop-in tool to make your Node API very convenient for your users. It comes from internal [Iris Couch](http://www.iriscouch.com) tooling.

Defaultable is pure CommonJS Javascript, and is also available as an NPM module.

    $ npm install defaultable

## Is it any good?

Yes.

## What your users see

With Defaultable, these are the promises you make to your users (in documentation, presentations, etc.)

*Dear users, just require my code and use it like normal.*

```javascript
var api = require("my_mod");

api.do_stuff("Bob", { minimum:5, dollars:10 }); // Process Bob.
api.do_stuff("Eve", { minimum:5, dollars:800}); // Process Eve.
```

*If you are using the same options a lot, set them as defaults.*

```javascript
var api = require("my_mod").defaults({ "minimum": 5 });

api.do_stuff("Bob", { dollars:10 }); // minimum will be 5
api.do_stuff("Eve", { dollars:800}); // minimum is still 5
```

*Defaults can even inherit from other defaults.*

```javascript
var api = require("my_mod");

var fivers = api.defaults({ "minimum": 5}});
var rich = fivers.defaults({"dollars": 10});
var poor = fivers.defaults({"dollars": 800});

poor.do_stuff("Bob"); // dollars will be 10, minimum will be 5
rich.do_stuff("Eve"); // dollars will be 800, minimum is still 5
```

## What you see

Defaulable wraps a CommonJS module.

Your original code:

```javascript
// my_mod.js

// My code basically starts here
var DEFAULTS = { "minimum":0, "dollars":0 };

exports.do_stuff = function(person, opts) {
  opts = opts || {};

  console.log("Processing: " + person);
  console.log("  minimum = " + opts.minimum || DEFAULTS.minimum);
  console.log("  dollars = $" + opts.dollars || DEFAULTS.dollars);
}
// And obviously it ends here.
```

Your new code:

```javascript
// my_mod.js

// Insert these lines at the top...
require('defaultable')(module,
  { "minimum": 0
  , "dollars": 0
  }, function(module, exports, DEFAULTS) { // The rest of your code follows unchanged.

// My code basically starts here (pretty much unmodified, but no hard-coded DEFAULTS)
exports.do_stuff = function(person, opts) {
  opts = opts || {};
  console.log("Processing: " + person);
  console.log("  minimum = " + opts.minimum || DEFAULTS.minimum);
  console.log("  dollars = $" + opts.dollars || DEFAULTS.dollars);
}
// Code ends here, just one more thing to append...

}) // defaultable
```

## How it works

It's really simple.

Defaultable passes the initial defaults to you as `DEFAULTS`. Use `module`, `module.exports`, or `exports` as usual to build your module API.

Your API gets an additional `.defaults()` function, which will re-evaluate your code with new user-provided defaults.

## Automatic defaults in require()

If you have multiple related modules, it can be nice for them to share defaults.

```javascript
// main.js
require('defaultable')(module,
  { "minimum": 0
  , "dollars": 0
  }, function(module, exports, DEFS) {

var submod = require('./sub_mod').defaults(DEFS); // Bad!

})
```

For this situation, defaultable provides a wrapped `require()` function. It works just like before, however if the modules you load is itself defaultable, it will be initialized with the current defaults.

```javascript
// main.js
require('defaultable')(module,
  { "minimum": 0
  , "dollars": 0
  }, function(module, exports, DEFS, require) {

var submod = require('./sub_mod'); // Good! Notice the "require" parameter above.

var legacy_mod = require('./legacy_mod'); // Still works.
var http = require('http');               // Still works.

})
```

If you *do not* want your module to inherit anything implicitly, use Defaultable's `.def()` function instead. This is useful for top-level modules of packages, for example.

```javascript
// main.js -- The "main" file in package.json
require('defaultable').def(module,
  { "minimum": 0
  , "dollars": 0
  }, function(module, exports, DEFS) {

exports.check = function() {
  console.log("Dollars = " + dollars); // Always "0" for require(); still changeable via .defaults()
}

})
```
