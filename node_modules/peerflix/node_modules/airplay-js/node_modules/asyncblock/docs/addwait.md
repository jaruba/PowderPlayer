Pass the result of flow.add() as a callback to asynchronous functions. All the code you call before calling flow.wait
will run in parallel. When flow.wait is called, execution pauses until all the asynchronous functions are done. Note
that the event loop does not pause -- other tasks in node will continue to execute as if you were making an async call.

You may pass a key to flow.add, which can be used to get the result from flow.wait. For example, calling
flow.add('key1') and flow.add('key2') would produce a result { key1: value1, key2: value2 }. It is not necessary to
pass a key to flow.add if you do not need to get the result, or if there is only one result.

If there is only one call to flow.add and no key is passed, the result will be returned as is without the object wrapper.

If an error occurred in one of the async calls, code execution will stop at that point. The error handling behavior depends
on whether flow.errorCallback was set. See the error handling section for more information.

When getting results from the flow.wait call, all but the first argument (the error) will be provided.
If more than one parameter was passed to the callback, only the second (first is error) will be returned. Pass a
responseFormat to flow.add to get the other results.

## Passing a key to flow.wait

New in 0.8.0, you can pass a key to flow.wait to wait on a specific operation. This gives you even more flexibility to
create intricate control flows easily. Here's an example of starting to read 4 files, then taking an action when 2 of
them are finished:

```javascript
asyncblock(function(flow){
   fs.readFile(path1, 'utf8', flow.add(1));
   fs.readFile(path2, 'utf8', flow.add(2));
   fs.readFile(path3, 'utf8', flow.add(3));
   fs.readFile(path4, 'utf8', flow.add(4));

   console.log(flow.wait(1) + flow.wait(2)); //The fiber will yield here until 1 & 2 are finished

   console.log(flow.wait(4)); //THe fiber will yield here until 4 is done

   if(flow.wait(3) === 'asdf') { //The fiber will yield here until 3 is done
       console.log("3's contents are equal to asdf");
   }
});
```

Once you get the result for a key, it will no longer be retrievable. If you request the same key twice, asyncblock will
wait for another task with that key to be run.

Something like this is also perfectly valid:

```javascript
asyncblock(function(flow){
    process.nextTick(function(){
        fs.readFile(path, 'utf8', flow.add('file')); //Add the "file" task here, asynchronously in a different "call stack"
    });

    var fileContents = flow.wait('file'); //Wait here until a task named "file" is added and finished at some point in the future
});
```