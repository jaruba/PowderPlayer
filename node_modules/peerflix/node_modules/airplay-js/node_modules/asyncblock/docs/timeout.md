New in 0.9.0, you may specify the amount of time you want to wait for any single task in an asyncblock by setting flow.taskTimeout to
the desired number of milliseconds. If a task takes longer than the taskTimeout, an error will be raised in a similar way
as if the async task itself had returned an error.

When a timeout occurs, the actual task itself cannot automatically be aborted. To perform cleanup manually, you may
attach to the flow.on('taskTimeout') event source. Here is an example:

```javascript
var asyncTask = function(callback) {
    asyncblock(function(flow){
        flow.errorCallback = callback;
        flow.taskTimeout = 1000; //Wait up to 1 second for each task to complete in this block
        flow.on('taskTimeout', function(info) {
            //Perform cleanup here for the task that timed out (close sockets, file handles, etc.)
            console.log('Task ' + info.key + ' timed out after running for ' + info.runtime + 'ms');
        });

        setTimeout(flow.add('timer'), 2000); //Add a task that takes 2 seconds to complete
        flow.wait();

        //Code here will not run
    });
});
```

To add a timeout for just a single task, use the alternate add syntax:

```javascript
asyncblock(function(flow){
    setTimeout(flow.add({key: 'timer', timeout: 1000}, 2000);
    flow.wait();

    //Code here will not run
});
```

Note that timeout can be used in conjunction with ignoreError. This is a dangerous as other errors would be ignored as well.

```javascript
asyncblock(function(flow){
    setTimeout(flow.addIgnoreError({key: 'timer', timeout: 1000}, 2000);
    flow.wait(); //The fiber will yield here for 1 second, then continue

    //Code here will run
});
```

A better way to not treat timeouts as errors (new in 0.9.2):

```javascript
asyncblock(function(flow){
    setTimeout(flow.add({timeout: 1000, timeoutIsError: false}, 2000);
    flow.wait(); //The fiber will yield here for 1 second, then continue

    //Code here will run
});
```

Or,

```javascript
asyncblock(function(flow){
    flow.timeoutIsError = false;

    setTimeout(flow.add({timeout: 1000}, 2000);
    flow.wait(); //The fiber will yield here for 1 second, then continue

    //Code here will run
});
```

Even if timeoutIsError is set to false, the taskTimeout event will still be emitted. Also, flow.wait will return undefined
for the tasks that timed out.

### Usage with queue

A timeout may be explicitly defined on a queue call with the following syntax:

```javascript
asyncblock(function(flow){
    flow.queue({ key: 'timer', timeout: 1000, timeoutIsError: false}, function(callback){
        setTimeout(callback, 2000);
    });

    flow.wait(); //The fiber will yield here for 1 second, then continue

    //Code here will run
});
```