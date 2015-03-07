var BinaryHeap = require('./binaryheap');
var heap = new BinaryHeap();

var a = [6, 5, 3, 1, 8, 7, 2, 4];

a.forEach(function (k) {
  heap.insert({ value: k }, k);
});

heap.print(process.stdout);

while (heap.length) {
  console.log('popping', heap.pop().value);
  heap.print(process.stdout);
}
