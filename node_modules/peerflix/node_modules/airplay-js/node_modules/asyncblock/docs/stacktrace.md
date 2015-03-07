To maintain the stack trace across async calls, you don't have to do anything special. Note that callbacks which receive
an error will have the first argument converted into an actual Error object (for example, if a string was passed).
Thrown Errors will automatically get the previous stack trace appended to the stack.

For example:

```javascript
    var asyncTask = function(callback) {
        process.nextTick(function() {
            callback(new Error('An error occured')); //Line 130
        });
    };

    asyncblock(function(flow) {
        asyncTask(flow.add());
        flow.wait(); //Line 136
    });
```

Stack trace:

```javascript
Error: An error occured
    at Array.0 (.../sourcecode/asyncblock/test2.js:130:18) //<-- Error callback
    at EventEmitter._tickCallback (node.js:192:40)
=== Pre-async stack ===
Error
    at .../sourcecode/asyncblock/asyncblock.js:71:67
    at .../sourcecode/asyncblock/asyncblock.js:90:9
    at Object.wait (.../sourcecode/asyncblock/asyncblock.js:109:27)
    at .../sourcecode/asyncblock/test2.js:136:10  //<-- The original call to flow.wait()
    at .../sourcecode/asyncblock/asyncblock.js:12:4

```