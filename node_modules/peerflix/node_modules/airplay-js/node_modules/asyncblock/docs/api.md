### flow.add([options], [key], [responseFormat])

* Options: An object bag containing:
    * ignoreError: If true, errors will be returned instead of calling the error handler / throwing. Default: false
    * key: A name (string or number) for the task. If provided, the result will be returned under this key in an object bag. Additionally, this task may be waited on specifically by name if a key is provided.
    * responseFormat: An array specifying names in the case that the async function returns multiple values in its callback. For example, the responseFormat ['a', 'b', 'c'] would convert a result of [1, 2, 3] to {a: 1, b: 2, c: 3}, so that the arguments may be referred to by name instead of by ordinal
    * timeout: Number of milliseconds to wait before aborting this task
    * timeoutIsError: If true (the default), a timeout is considered in error and will abort the current flow. If false, a timeout will not be treated as an error.
    * dontWait: If true, the result of this task will not be returned from flow.wait(). The result may only be obtained by passing a key to flow.wait.
    * firstArgIsError: If false, the first argument passed to the callback is not treated as an error. Default is true. This may also be specified on the flow variable, in which case it applies to all added tasks.
* key: Same as if specified in options
* responseFormat: same as if specified in options

Pass the result of flow.add() as a callback to asynchronous functions, then use flow.wait() to wait on all added tasks or a single task. This is the most common way to use asyncblock.

See [add / wait documentation](https://github.com/scriby/asyncblock/blob/master/docs/addwait.md) for more details.

### flow.callback

Alias of flow.add

### flow.wait([key])

* key: The name (string or number) of a task to wait on. If not specified, all tasks are waited on.

If waiting by key on a single task, or waiting on a single task with no key, the result will be returned "raw". If flow.wait was called with no key, and waiting on a task with a key specified, the result will be of the form { key1: value1, key2: value2 }. If the task passes more than one parameter to the callback and no responseFormat is specified, only the second (first is error) will be returned.

### flow.set([options], key, [responseFormat])

Pass the result of flow.set(key) as a callback to asynchronous functions, then use flow.get() to wait for and get the result.

### flow.get(key)

Pass the key used in a previous flow.set call to get the result. If the result is not yet ready, the fiber will yield until it is ready.
Note that you may call flow.get(key) multiple times with the same key and it will return the stored result.

### flow.del(key)

Used to clear out stored results when using flow.set & flow.get. Not usually necessary, but provided for rare circumstances where
the garbage collector needs to collect results before the asyncblock ends.

### anyAsyncMethod().sync([options], [responseFormat]);

A call to sync() may be chained on the end of any async call to convert to a synchronous style call. The fiber (thread) will pause here, but the event loop will not be blocked.
When the asyc operation completes, execution will resume from where it left off.

Options and responseFormat are the same as for the add call.

Source transform must be enabled to use this syntax. Call asyncblock.enableTransform() once in the application before requiring modules that use this syntax.

```javascript
asyncblock(function(){
    if(fs.stat(path).sync().isFile()){
        var contents = fs.readFile(path, 'utf8').sync();

        console.log(contents);
    }
});
```

### anyAsyncMethod().defer([options], [responseFormat]);

Defer is similar to sync, except the fiber pauses to obtain the result on the first usage of the variable, not when the async call is made.
The result of defer should be written directly into a variable, which was either just created, or has been declared but not yet assigned.
If using defer and not storing the result into a variable, it will be converted to a sync call instead.
Examples of this include returning the value directly, storing the value into an array or object property (x.y), etc.

Options and responseFormat are the same as for the add call.

Source transform must be enabled to use this syntax. Call asyncblock.enableTransform() once in the application before requiring modules that use this syntax.

```javascript
asyncblock(function(){

    var contents1 = fs.readFile(path1, 'utf8').defer();
    var contents2 = fs.readFile(path2, 'utf8').defer();
    var contents3 = fs.readFile(path3, 'utf8').defer();

    if(contents1 === 'some text'){ //Wait for contents1 read to finish here
        console.log(contents3); //Wait for contents3 read to finish here
    } else if(contents2 === 'some other text'){ //Wait for contents2 read to finish here
        console.log(contents2);
    } else {
        contents.log(contents3); //Wait for contents3 read to finish here
    }
});
```

### asyncblock.enableTransform([module])

Enables source transformation using asyncblock. If a module is passed (typically using the module keyword), it will be reloaded by asyncblock with source transformations made.
After calling enableTransform, any modules required throughout the life of the application will have source transformations applied.

```javascript
var asyncblock = require('asyncblock');

asyncblock.enableTransform();

require('...');
```

```javascript
var asyncblock = require('asyncblock');

//Use this line at the top of standalone scripts to re-load the current module with source transformations applied
if(asyncblock.enableTransform(module)) { return; }
```

### flow.sync([options], toExecute, [extra args])

* options:
    * Same as add.options
    * self: A reference to the object to use as the "this" context when executing toExecute
* toExecute: An async function to execute, which takes a callback as the last argument
* extra args: Passed along to toExecute in order when called

A concise way to execute a single task and wait for the result. Note that flow.sync may only be called from the context of the original asyncblock. It cannot be called from async callbacks as those are not executing from within a fiber (flow.add & flow.queue can be called from async callbacks).

```javascript
asyncblock(function(flow){
    var contents = flow.sync(fs.readFile, path, 'utf8'); //Wait on only this result without blocking the event loop, then continue
    console.log(contents);
});
```

The above is equivalent to this:

```javascript
asyncblock(function(flow){
    fs.readFile(path, 'utf8', flow.add());
    var contents = flow.wait();
    console.log(contents);
});
```

And similar to this:

```javascript
asyncblock(function(flow){
    fs.readFile(path, 'utf8', flow.add('contents'));
    console.log(flow.wait('contents'));
});
```

### flow.sync(async task execution)

Pass the entire result of an async task execution to flow.sync to create a synchronous wrapper for the last added task.

For example:

```javascript
asyncblock(function(flow){
    //Read synchronously
    var contents = flow.sync(fs.readFile(path, 'utf8', flow.callback()));

    //Write synchronously
    flow.sync(fs.writeFile(path, contents, flow.callback()));
});
```

### flow.queue([options], [key], [responseFormat], toExecute)

* Options, key, and responseFormat are the same as in flow.add
* toExecute: A function which is to be executed when control returns to the fiber

In general, there is little benefit to using flow.queue. The syntax is a little more verbose, and it requires the creation of another closure. The only time its use is required is when using flow.maxParallel and adding tasks asynchronously (from outside the fiber). More detail is in the readme.

As of 1.4.5, you can use the queue method of the flow.func chained syntax to achieve the same effect.

### flow.maxParallel

A property which can be set to limit the maximum number of tasks executing in parallel at once.

When using flow.maxParallel, you can not use flow.add to add tasks if doing so from outside the fiber (in an asynchronous callback). flow.queue (or flow.func's queue) must be used in this case. See the readme for more information.

### flow.errorCallback

If this property is set, errors which occur within the asyncblock (either thrown exceptions or errors passed to callbacks) will be passed to the specified function.

Setting this property is the preferred way to do error handling with asyncblock.

### flow.taskTimeout

A property indicating the number of milliseconds to wait for any single task within this asyncblock.

### flow.timeoutIsError

A property indicating whether a timeout should be treated as an error. If treated as an error, a timeout will cause the current flow to abort.

### asyncblock

```javascript
var asyncblock = require('asyncblock');

asyncblock(function(flow){
    //This code is running in a fiber. It may yield "in-place" without blocking the event loop
});
```

### asyncblock.nostack

When creating an asyncblock, the current stack is captured so it can be used to construct full stack traces if an error occurs.
This incurs a small performance penalty, but is generally worthwhile.

```javascript
var asyncblock = require('asyncblock');

asyncblock.nostack(function(flow){
    //If errors occur in here, they will get less detail added to their stack trace
});
```