When more than one parameter is passed from an asynchronous function's callback, only the first is returned:

```javascript
    var asyncTask = function(callback) {
        process.nextTick(function() {
            callback(null, 1, 2, 3);
        });
    }

    asyncblock(function(flow) {
        asyncTask(flow.add());

        var result = flow.wait();
        console.log(result); // Prints 1
    });
```

In some cases, it may be desirable to add some more structure to the result:

```javascript
var asyncTask = function(callback) {
    process.nextTick(function() {
        callback(null, 1, 2, 3);
    });
};

asyncblock(function(flow) {
    asyncTask(flow.add(['first', 'second', 'third']));

    var result = flow.wait();
    console.log(result); // Prints { first: 1, second: 2, third: 3 }

    asyncTask(flow.add('key1', ['first', 'second', 'third']));
    asyncTask(flow.add('key2', ['a', 'b', 'c']));
    var result = flow.wait();
    console.log(result); // Prints { key1: { first: 1, second: 2, third: 3 }, key2: { a: 1, b: 2, c: 3} }
});
```

When calling flow.add, you may pass a format array conditionally. If provided, it will be used to build an object bag
when returning the results to flow.wait.