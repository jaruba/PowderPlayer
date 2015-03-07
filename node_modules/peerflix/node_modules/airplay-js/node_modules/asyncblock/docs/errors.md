The easiest way to do error handling with asyncblock is to always set flow.errorCallback to be the current function's callback.
If errorCallback is set, Errors which are thrown within the asyncblock will be passed to the callback and will not bubble
up the call stack. This can help guard against bugs in libraries which don't properly account for exceptions getting thrown
from user code.

If errorCallback is not set, the error will be re-thrown and bubble up the call stack.

Here are some examples to illustrate the error handling behavior:

```javascript
var callback = function(err){
    console.log('cb');

    if(err) {
        console.log(err);
    }
};

var callbackThrowError = function(err){
    console.log('cb throw error');

    if(err) {
        console.log(err);
    } else {
        throw new Error('callback error');
    }
};

process.on('uncaughtException', function(err) {
    console.log('uncaught');
    console.log(err);
});

var asyncThrow = function(callback){
    setTimeout(function(){
        try{
            throw new Error('async');
        } finally {
            callback();
        }
    }, 1000);
};

var asyncError = function(callback){
    callback('asyncError');
};

var asyncTickError = function(callback){
    process.nextTick(function(){
        callback('asyncError');
    });
};
```

```javascript
asyncblock(function(flow){
    flow.errorCallback = callback;

    asyncTickError(flow.add());
    flow.wait();

    console.log('here');

    callback();
});

/* Prints
cb
asyncError
*/
```

```javascript
asyncblock(function(flow){
    asyncTickError(flow.add());
    flow.wait();

    console.log('here');

    callback();
});

/* Prints
uncaught
[Error: asyncError]
*/
```

```javascript
asyncblock(function(flow){
    flow.errorCallback = callback;

    asyncThrow(flow.add());
    flow.wait();

    console.log('here');

    callback();
});

/* Prints
here
cb
uncaught
[Error: async]
*/
```

The above case is interesting as an uncaught Error is thrown from within the setTimeout call. This Error bubbles up
a separate call stack, so it does not prevent the rest of the current flow from executing. Note that there is no way
to catch that exception from the asyncblock.

```javascript
asyncblock(function(flow){
    flow.errorCallback = callbackThrowError;

    callbackThrowError();

    console.log('here');
});

/* Prints
cb throw error
cb throw error
[Error: callback error]
*/
```

The above example illustrates what happens if the callback itself throws an error. The Error will get caught by the
async block, then passed back to the callback as the error parameter. In this way, it's possible that the callback could
get called twice, so it's important to have the callback not proceed if an error occured.

Note that asyncblock will call the errorCallback only on the first error.