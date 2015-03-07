In some cases, you may want to run tasks in parallel, but not all of them at once. For example, consider the case of
uploading a large number of files to a remote server. Keeping some number of uploads going at once would be a good solution.
Setting flow.maxParallel makes this easy:

```javascript
asyncblock(function(flow){
    flow.maxParallel = 10;

    for(var i = 0; i < files.length; i++) {
        uploadFile(files[i], flow.add());
    }

    flow.wait(); //Wait for all uploads to finish
});
```

When flow.add is called, if 10 or more uploadFile calls have not executed their callbacks yet,
execution will yield until one of the callbacks is fired. As soon as the callback is fired, the flow.add call will
return and the code in the asyncblock will continue to execute. In this way, there will always be a "pool" of 10
uploads executing, until fewer than 10 tasks remain. The final tasks are waited on by the final flow.wait call.

## Adding tasks asynchronously

Version 0.7 adds the ability to add tasks asynchronously. Consider the following example:

```javascript

asyncblock(function(flow) {
    process.nextTick(function(){
        setTimeout(flow.add(), 1000);
    });

    flow.wait();
});

```

In the above example, the flow.wait call is executed before the flow.add call, so asyncblock thinks there's nothing to wait on,
and exits. We can handle this case by using flow.forceWait and flow.doneAdding:

```javascript
asyncblock(function(flow) {
    process.nextTick(function(){
        setTimeout(flow.add(), 1000);

        flow.doneAdding();
    });

    flow.forceWait();
});
```

The forceWait call will make the fiber yield, even if it's not waiting on anything. This can give asynchronous operations
a chance to add tasks later on. But, we have to let asyncblock know when we're done adding tasks, or it will just wait forever.
It's important not to forget to call doneAdding when using forceWait, or the fiber won't get cleaned up.

## You can't wait from outside the fiber

flow.wait and flow.forceWait can only be called from within the "call stack" that is running within the asyncblock.
Check out this example:

```javascript
asyncblock(function(flow) {
   process.nextTick(function(){
       setTimeout(flow.add(), 1000);
       flow.wait(); // This doesn't work

       flow.doneAdding();
   });

   flow.forceWait();
});
```

It seems like something like that might be able to work. Note that this doesn't just apply to process.nextTick, it
applies to any case where there is code executing from a "call stack" that's outside the fiber -- for example, in
an event callback from a file or stream reader.

The reason it doesn't work is that the code running in the nextTick originated from a different "call stack", so it's not
running in a fiber. When calling wait, it's impossible for that code to yield, because it wasn't running in a fiber to
begin with. The only code running in a fiber is the contents of the function defined in the asyncblock. So, that's the
only place from which we can call wait.

Note that this works:

```javascript
asyncblock(function(flow) {
   process.nextTick(function(){
       asyncblock(function(innerFlow){
           setTimeout(innerFlow.add(), 1000);
           innerFlow.wait(); //Wait on the setTimout call

           flow.doneAdding(); //Tell the outer fiber that it can stop waiting
       });
   });

   flow.forceWait(); //Forcewait gets called first
});
```

## flow.queue

In 0.7, a new function called flow.queue was added. It differs slightly in usage from flow.add. Here is a simple example:

```javascript
asyncblock(function(flow) {
   flow.queue(function(callback) {
       setTimeout(callback, 1000);
   });

   flow.wait(); //This will wait for about a second
});
```

Note that the above example is equivalent to this:

```javascript
asyncblock(function(flow){
    setTimeout(flow.add(), 1000);
    flow.wait();
});
```

The difference is the order of execution. In the second example, the setTimeout call will start immediately, then flow.wait
is called. In the first example, the asyncblock gets control over when to run the queued function. This turns out to be
important when using maxParallel in conjunction with functions added within an async callback.

Consider this example:

```javascript
asyncblock(function(flow) {
   flow.maxParallel = 2;

   process.nextTick(function(){
       //This "call stack" is not running within the fiber
       setTimeout(flow.add(), 1000);
       setTimeout(flow.add(), 2000);
       setTimeout(flow.add(), 3000); // Error!

       flow.doneAdding();
   });

   flow.forceWait();
});
```

So, what's the problem? When flow.add is called, if the number of max parallel operations has been exceeded (2 in this case),
the current fiber will yield until one of the operations is complete. However, because the code is running from within
the nextTick, there is no current fiber, so an error is thrown on the third flow.add call.

To work around the issue, you can use flow.queue:

```javascript
asyncblock(function(flow) {
   flow.maxParallel = 2;

   process.nextTick(function(){
       flow.queue(function(callback) {
           setTimeout(callback, 1000);
       });

       flow.queue(function(callback) {
           setTimeout(callback, 2000);
       });

       flow.queue(function(callback) {
           setTimeout(callback, 3000);
       });

       flow.doneAdding();
   });

   flow.forceWait();
});
```

The above example will work, and should take about 4 seconds (The first two will run in parallel. When the first finishes,
the third one will start). This example works, because the queued operations are stored up until control returns to the
fiber, so the yielding will work properly.

Note that the arguments to flow.queue are the same as flow.add, except that the last argument is the function to
execute. The first two arguments (key & response format) are optional.

When adding flow.queue, an alias for flow.add was created called flow.callback. You may find it easier to distinguish
the behavior of the two:

```javascript
asyncblock(function(flow) {
    setTimeout(flow.callback(), 1000);

    flow.queue(function(callback) {
        setTimeout(callback, 1000);
    });

    flow.wait();
});
```