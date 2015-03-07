```
                                        ______  ______              ______  
______ ______________  _________ __________  /_ ___  /______ __________  /__
_  __ `/__  ___/__  / / /__  __ \_  ___/__  __ \__  / _  __ \_  ___/__  //_/
/ /_/ / _(__  ) _  /_/ / _  / / // /__  _  /_/ /_  /  / /_/ // /__  _  ,<   
\__,_/  /____/  _\__, /  /_/ /_/ \___/  /_.___/ /_/   \____/ \___/  /_/|_|  
                /____/                                                      

```
==================================================================

A fully fledged flow control library built on top of fibers.

###Installation

```javascript
npm install asyncblock
```

See [node-fibers](https://github.com/laverdet/node-fibers) for more information on fibers

### Why should I use asyncblock?

* Write async code in synchronous style without blocking the event loop
* Effortlessly combine serial and parallel operations with minimal boilerplate
* Produce code which is easier to read, reason about, and modify
    * Compared to flow control libraries, asyncblock makes it easy to share data between async steps. There's no need to create variables in an outer scope or use "waterfall".
* Simplify error handling practices
    * If an error occurs in an async step, automatically call your callback with the error, or throw an Error
* Improve debugging by not losing stack traces across async calls
    * Line numbers don't change. What's in the stack trace maps directly to your code (You may lose this with CPS transforms)
    * If using a debugger, it's easy to step line-by-line through asyncblock code (compared to async libraries)

## Overview

Check out the [overview](https://github.com/scriby/asyncblock/blob/master/docs/overview.md) to get an at-a-glance overview
of the different ways asyncblock can be used.

## Examples

A few quick examples to show off the functionality of asyncblock:

### Sleeping in series

```javascript
asyncblock(function(flow){
    console.time('time');

    setTimeout(flow.add(), 1000);
    flow.wait(); //Wait for the first setTimeout to finish

    setTimeout(flow.add(), 2000);
    flow.wait(); //Wait for the second setTimeout to finish

    console.timeEnd('time'); //3 seconds
});
```

### Sleeping in parallel

```javascript
asyncblock(function(flow){
    console.time('time');

    setTimeout(flow.add(), 1000);
    setTimeout(flow.add(), 2000);
    flow.wait(); //Wait for both setTimeouts to finish

    console.timeEnd('time'); //2 seconds
});
```

### Trapping results

```javascript
asyncblock(function(flow) {
    //Start two parallel file reads
    fs.readFile(path1, 'utf8', flow.set('contents1'));
    fs.readFile(path2, 'utf8', flow.set('contents2'));
    
    //Print the concatenation of the results when both reads are finished
    console.log(flow.get('contents1') + flow.get('contents2'));
    
    //Wait for a large number of tasks
    for(var i = 0; i < 100; i++){
        //Add each task in parallel with i as the key
        fs.readFile(paths[i], 'utf8', flow.add(i));                                    
    }
    
    //Wait for all the tasks to finish. Results is an object of the form {key1: value1, key2: value2, ...}
    var results = flow.wait();
    
    //One-liner syntax for waiting on a single task
    var contents = flow.sync( fs.readFile(path, 'utf8', flow.callback()) );
    
    //See overview & API docs for more extensive description of techniques
});
```

### With source transformation

```javascript
//asyncblock.enableTransform() must be called before requiring modules using this syntax.
//See overview / API for more details

asyncblock(function(flow) {
    //Start two parallel file reads
    var contents1 = fs.readFile(path1, 'utf8').defer();
    var contents2 = fs.readFile(path2, 'utf8').defer();
    
    //Print the concatenation of the results when both reads are finished
    console.log(contents1 + contents2);
    
    var files = [];
    //Wait for a large number of tasks
    for(var i = 0; i < 100; i++){
        //Add each task in parallel with i as the key
        files.push( fs.readFile(paths[i], 'utf8').future() );
    }
    
    //Get an array containing the file read results
    var results = files.map(function(future){
        return future.result;
    });
    
    //One-liner syntax for waiting on a single task
    var contents = fs.readFile(path, 'utf8').sync();
    
    //See overview & API docs for more extensive description of techniques
});
```

### Error handling

```javascript
var asyncTask = function(callback) {
    asyncblock(function(flow) {
        flow.errorCallback = callback; //Setting the errorCallback is the easiest way to perform error handling. If erroCallback isn't set, and an error occurs, it will be thrown instead of returned to the callback
        
        fs.readFile(path, 'utf8', flow.add()); //If readFile encountered an error, it would automatically get passed to the callback
        var contents = flow.wait();
        
        console.log(contents); //If an error occured above, this code won't run
    });
});
```

### Returning results

```javascript
var asyncTask = function(callback) {
    asyncblock(function(flow) {
        var contents = fs.readFile(path, 'utf8').sync(); //If readFile encountered an error, it would automatically get passed to the callback

        return contents; //Return the value you want to be passed to the callback
    }, callback); //The callback can be specified as the 2nd arg to asyncblock. It will be called with the value returned from the asyncblock as the 2nd arg.
                  //If an error occurs, the callback will be called with the error as the first argument.
});
```

## API

See [API documentation](https://github.com/scriby/asyncblock/blob/master/docs/api.md)

## Stack traces

See [stack trace documentation](https://github.com/scriby/asyncblock/blob/master/docs/stacktrace.md)

## Error handling

See [error handling documentation](https://github.com/scriby/asyncblock/blob/master/docs/errors.md)

## Formatting results

See [formatting results documentation](https://github.com/scriby/asyncblock/blob/master/docs/results.md)

## Parallel task rate limiting

See [maxParallel documentation](https://github.com/scriby/asyncblock/blob/master/docs/maxparallel.md)

## Task timeouts

See [timeout documentation](https://github.com/scriby/asyncblock/blob/master/docs/timeout.md)

## Concurrency

Both fibers, and this module, do not increase concurrency in nodejs. There is still only one thread executing at a time.
Fibers are threads which are allowed to pause and resume where they left off without blocking the event loop.

## Risks

* Fibers are fast, but they're not the fastest. CPU intensive tasks may prefer other solutions (you probably don't want to do CPU intensive work in node anyway...)
* Not suitable for cases where a very large number are allocated and used for an extended period of time ([source](http://groups.google.com/group/nodejs/browse_thread/thread/ddd6e2756f1f4d8c/164f8f34d8261fdb?lnk=gst&q=fibers#164f8f34d8261fdb))
* It requires V8 extensions, which are maintained in the node-fibers module
     * In the worst case, if future versions of V8 break fibers support completely, a custom build of V8 would be required
     * In the best case, V8 builds in support for coroutines directly, and asyncblock becomes based on that
* When new versions of node (V8) come out, you may have to wait longer to upgrade if the fibers code needs to be adjusted to work with it

Note that when V8 supports generators, which is currently planned, the source transformation functionality of asyncblock will be able to transform
most of the asyncblock code to be based on generators instead of fibers with no change to the original source. This helps
reduce risk as it provides a path forward for asyncblock even if support for fibers became impossible in the future.

## Compared to other solutions...

A sample program in pure node, using the async library, and using asyncblock + fibers.

### Pure node

```javascript

function example(callback){
    var finishedCount = 0;
    var fileContents = [];

    var continuation = function(){
        if(finishedCount < 2){
            return;
        }

        fs.writeFile('path3', fileContents[0] + fileContents[1], function(err) {
            if(err) {
                throw new Error(err);
            }

            fs.readFile('path3', 'utf8', function(err, data){ 
                console.log(data);
                console.log('all done');
            });
        });
    };

    fs.readFile('path1', 'utf8', function(err, data) {
        if(err) {
            throw new Error(err);
        }

        fnishedCount++;
        fileContents[0] = data;

        continuation();
    });

    fs.readFile('path2', 'utf8', function(err, data) {
        if(err) {
            throw new Error(err);
        }

        fnishedCount++;
        fileContents[1] = data;

        continuation();
    });
}
```

### Using async

```javascript

var async = require('async');

var fileContents = [];

async.series([
    function(callback){
        async.parallel([
            function(callback) {
                fs.readFile('path1', 'utf8', callback);
            },

            function(callback) {
                fs.readFile('path2', 'utf8', callback);
            }
        ],
            function(err, results){
                fileContents = results;                                    
                callback(err);
            }
        );
    },

    function(callback) {
        fs.writeFile('path3', fileContents[0] + fileContents[1], callback);
    },

    function(callback) {
        fs.readFile('path3', 'utf8', function(err, data){
            console.log(data);
            callback(err);
        });
    }
],
    function(err) {
        if(err) {
            throw new Error(err);
        }
        
        console.log('all done');
    }
);
```

### Using asyncblock + fibers

```javascript

var asyncblock = require('asyncblock');

asyncblock(function(flow){
    fs.readFile('path1', 'utf8', flow.add('first'));
    fs.readFile('path2', 'utf8', flow.add('second'));
    
    //Wait until done reading the first and second files, then write them to another file
    fs.writeFile('path3', flow.wait('first') + flow.wait('second'), flow.add()); 
    flow.wait(); //Wait on all outstanding tasks

    fs.readFile('path3', 'utf8', flow.add('data'));

    console.log(flow.wait('data')); //Print the 3rd file's data
    console.log('all done');
});
```

### Using asyncblock + source transformation

```javascript
//Requires asyncblock.enableTransform to be called before requiring this module
var asyncblock = require('asyncblock');

asyncblock(function(flow){
    var first = fs.readFile('path1', 'utf8').defer();
    var second = fs.readFile('path2', 'utf8').defer();
    
    fs.writeFile('path3', first + second).sync();

    var third = fs.readFile('path3', 'utf8').defer();

    console.log(third);
    console.log('all done');
});
```

### No prototypes were harmed in the making of this module