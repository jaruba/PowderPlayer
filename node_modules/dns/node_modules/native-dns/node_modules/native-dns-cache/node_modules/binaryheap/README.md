BinaryHeap
==========

Basic binary heap tree using linked lists

Usage
-----

```javascript
var BinaryHeap = require('binaryheap');
var heap = new BinaryHeap();

var a = [6, 5, 3, 1, 8, 7, 2, 4];

a.forEach(function (k) {
  heap.insert({ value: k }, k);
});

heap.print();

while (heap.length) {
  console.log('popping', heap.pop().value);
}
```

By default it stores as a max-heap, if you pass truthy to the constructor though
it will behave as a min-heap.

Methods
-------

 * `insert(obj, key)` -- obj can be any new or existing object, and key is any
value that behaves sanely with `>` or `<`
 * `pop()` -- removes and returns the maximum or minimum object from the root
of the heap
 * `remove(obj)` -- removes a previously inserted object from the heap
 * `print()` -- mostly for debugging purposes prints a graphviz dot style
digraph to confirm ordering

Members
-------

 * `length` -- number of objects currently in the heap
