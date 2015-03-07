## The asyncblock

When defining an asyncblock, a function is passed in. That function gets executed within a fiber. You can think of a fiber
as a normal javascript "thread", except that it has a special property. It can yield in-place without blocking the event loop,
then be told to resume from outside the fiber. This is the basic principle on which this library and other flow control
libraries built on top of fibers are based. Using this property we can emulate synchronous style programming using a variety
of techniques.

It is the goal of asyncblock to provide the end user many options, and let the user decide when to use each. As the API
has grown, it has become harder to sift through all the available features and figure out which to use or when to use them.
Each section below focuses on a specific usage pattern for the library. Intricate process flows can be written using any of these techniques
exclusively, or by mixing and matching as you gain familiarity with the library.

## flow.get & flow.set

Get and set are a very simple mechanism to control asynchronous process flow. Simply pass the result of flow.set(key)
as the callback to an asynchronous function. When you want to use the result, call flow.get(key).

If the result isn't ready yet, the fiber will yield until it's ready.
Flow.get stores the return value, so you can "get" the value as many times as you want.
The fiber will yield on the first call, and return the result on subsequent calls.

Simple example:

```javascript
asyncblock(function(flow){
    //Start reading two files in parallel
    fs.readFile(path1, 'utf8', flow.set('contents1'));
    fs.readFile(path2, 'utf8', flow.set('contents2'));

    //When the 2nd one is done, print its contents
    console.log(flow.get('contents2'));
    //When the 1st one is done, print its contents
    console.log(flow.get('contents1'));
});
```

### Pros

* Very simple and succinct for kicking off and getting the result of a single task
* No extra variables need to be defined
* Can model both series and parallel execution, with "just in time" yielding
* Maintains the "this" context of the async function call
* Flow.set can be used from outside the fiber (unless using maxParallel)

### Cons

* If just waiting on a task to finish, and you don't need the result, this isn't the simplest syntax
* Waiting on a collection of tasks (where we don't care about the individual tasks) is cumbersome
* Because flow.get stores the return value, it may stay in scope longer than intended (until the asyncblock ends). Use flow.del to remove results manually.
* Not possible to write as a "one-liner" (if you move the result of get into a variable)

## flow.add & flow.wait

Add and wait started out as the only available syntax to use with asyncblock. There are two basic usage models.

You can pass flow.add() as a callback to any number of asynchronous functions, and call flow.wait to wait on them all to finish.
This is useful in a case like uploading files, where you just want them all to finish without error, but don't care about the particular
return values.

The other approach is similar to using get & set. If you pass a key to flow.add, you can wait for that key specifically using flow.wait(key).
You can also use any number of flow.add(key)'s followed by a single flow.wait(), which will return a dictionary containing all the results
indexed by the keys passed to flow.add. One key difference between add / wait vs get / set is that results returned from wait are purged
from the asyncblock as soon as they are returned. This is good for garbage collection, but you can only get a key once.
If the same key is requested again, it will wait for a different task to be added with that key and complete before resuming.

Simple example:

```javascript
asyncblock(function(flow){
    //Start writing two files in parallel
    fs.writeFile(path1, contents1, flow.add());
    fs.writeFile(path2, contents2, flow.add());

    //Wait for both file writes to finish
    flow.wait();

    //Start reading two files in parallel
    fs.readFile(path1, 'utf8', flow.add('contents1'));
    fs.readFile(path1, 'utf8', flow.add('contents2'));

    //Wait for both file reads to finish. Returns { contents1: ..., contents2: ... }
    var contents = flow.wait();

    //Start reading two files in parallel
    fs.readFile(path1, 'utf8', flow.add('contents1'));
    fs.readFile(path1, 'utf8', flow.add('contents2'));

    //Wait for each task to finish separately
    var contents1 = flow.wait('contents1');
    var contents2 = flow.wait('contents2');

    //One-liner syntax
    var contents = flow.sync(fs.readFile(path, 'utf8', flow.callback())); //flow.add can also be used in place of flow.callback
});
```

### Pros

* The most straightforward syntax for waiting on tasks when you don't care about the result
* flow.wait waits on all outstanding tasks added through flow.add & flow.queue, so it's easy to wait on multiple tasks
* Can model both series and parallel execution
* Can wait on specific keys, which offers similar functionality to get / set
* Maintains the "this" context of the async function call
* Flow.add can be used from outside the fiber (unless using maxParallel)

### Cons

* May require additional variables to be declared (if moving the result of flow.wait into a variable)
* "One-liner" syntax is a little more verbose than other techniques

## x.sync(), x.defer() (Source transformation)

You can chain sync or defer on the end of any async function call. Sync waits for the call to finish before continuing.
Defer waits for the call to complete on the first access to the variable the result is stored into.
Future returns a future which you can read the .result property of to obtain the result.

Before the above syntax can be used, you must call asyncblock.enableTransform(). That will insert a transformation step in the module loading process,
so any modules loaded from then on may use the syntax.

Simple example:

```javascript
var asyncblock = require('asyncblock');

//If the enableTransform method is called like this, it can be used to transform the current module if it was loaded standalone
//This effectively "returns" from the original loading of this module, then asyncblock loads and runs the transformed version
//If you just want to enable the syntax transform on all modules loaded from this point on, just call asyncblock.enableTransform()
if(asyncblock.enableTransform(module)){ return; }

asyncblock(function(){
    //Wait for the read to finish before proceeding
    var contents = fs.readFile(path, 'utf8').sync();

    //Yield on the first access to the contents1 variable
    var contents1 = fs.readFile(path1, 'utf8').defer();

    //Wait for the file to finish writing before proceeding
    fs.writeFile(contents + contents1).sync();
});
```

### Pros

* The most clean and succinct syntax that asyncblock offers for cases when obtaining results from the async call
* Supports series and parallel operations
* Maintains the "this" context when calling the async function
* Source transformation will allow asyncblock to target harmony generators when avaiable in V8, further increasing performance and removing the dependency on fibers

### Cons

* When writing standalone scripts, you have to remember to enable the transform (like the example above)
* Adds some overhead to the module require process (I've profiled the code and made optimizations to keep the overhead minimal)

## flow.sync

Flow.sync is yet another shorthand for synchronous execution. Note that this is the standalone flow.sync function --
not the usage that converts a flow.add / wait to a one-liner.

Simple example:

```javascript
asyncblock(function(flow){
    var contents = flow.sync(fs.readFile, path, 'utf8');
});
```

### Pros

* Can be written in one line

### Cons

* Loses the "this" context of the async call
* Syntax is a little odd

## flow.queue

Flow.queue was added to the API to handle a specific use case. If using flow.maxParallel (limiting number of concurrent tasks),
you must use queue to add tasks if adding tasks from outside the fiber (for example, in an async callback).

Simple example:

```javascript
asyncblock(function(flow){
    process.nextTick(function(){
        //A task added with flow.queue
        flow.queue('contents1', function(callback) {
            fs.readFile(path, 'utf8', callback);
        };

        //You can also add queued tasks with flow.func
        flow.func(fs.readFile).key('contents2').queue(path, 'utf8');

        //Indicate that we're done adding tasks, so we can stop the forced wait
        flow.doneAdding();
    });

    //We have to force wait because no tasks have been added yet
    var results = flow.forceWait();
});
```

### Pros

* The only way to add tasks from outside the fiber when using maxParallel

### Cons

* No reason to use it except when it's required

## API doc

Be sure to check the API documentation for more information. Special options (like timeouts, result formatting, etc.)
can be applied no matter which methods are used.