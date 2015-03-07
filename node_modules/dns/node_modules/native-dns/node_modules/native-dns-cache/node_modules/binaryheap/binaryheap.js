// Copyright 2012 Timothy J Fontaine <tjfontaine@gmail.com>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE

'use strict';

var assert = require('assert');

var Heap = function(min) {
  this.length = 0;
  this.root = undefined;
  if (min) {
    this._comparator = this._smallest;
  } else {
    this._comparator = this._largest;
  }
};

Heap.init = function(obj, key) {
  obj._parent = null;
  obj._left = null;
  obj._right = null;
  obj._key = key;
  return obj;
};

Heap.prototype.count = function (node) {
  if (!node) return 0;

  var c = 1;

  c += this.count(node._left);
  c += this.count(node._right);

  return c;
};

Heap.prototype.insert = function(obj, key) {
  var insert, node;

  this.length += 1;

  node = Heap.init(obj, key);

  if (!this.root) {
    this.root = node;
  } else {
    insert = this._last();

    node._parent = insert;

    if (!insert._left)
      insert._left = node;
    else
      insert._right = node;

    this._up(node);
  }

  this._head();

  return node;
};

Heap.prototype.pop = function() {
  var ret, last;

  if (!this.root)
    return null;

  return this.remove(this.root);
};

Heap.prototype.remove = function(node) {
  var ret, last;

  ret = node;
  last = this._last();

  if (last._right)
    last = last._right;
  else
    last = last._left;

  this.length -= 1;

  if (!last) {
    if (ret == this.root)
      this.root = null;
    return ret;
  }

  if (ret == last) {
    if (ret._parent._left == node)
      ret._parent._left = null;
    else
      ret._parent._right = null;
    last = ret._parent;
    ret._parent = null;
  } else if (!ret._left && !ret._right) {
    // we're trying to remove an element without any children and its not the last
    // move the last under its parent and heap-up
    if (last._parent._left == last) last._parent._left = null;
    else last._parent._right = null;

    if (ret._parent._left == ret) ret._parent._left = last;
    else ret._parent._right = last;

    last._parent = ret._parent;

    ret._parent = null;

    // TODO in this case we shouldn't later also do a down, but it should only visit once
    this._up(last);
  } else {
    this._delete_swap(ret, last);
  }

  if (ret == this.root)
    this.root = last;

  this._down(last);
  this._head();

  return ret;
};

// TODO this probably isn't the most efficient way to ensure that we're always
// at the root of the tree, but it works for now
Heap.prototype._head = function() {
  if (!this.root)
    return;

  var tmp = this.root;
  while (tmp._parent) {
    tmp = tmp._parent;
  }

  this.root = tmp;
};

// TODO is there a more efficient way to store this instead of an array?
Heap.prototype._last = function() {
  var path, pos, mod, insert;

  pos = this.length;
  path = [];
  while (pos > 1) {
    mod = pos % 2;
    pos = Math.floor(pos / 2);
    path.push(mod);
  }

  insert = this.root;

  while (path.length > 1) {
    pos = path.pop();
    if (pos === 0)
      insert = insert._left;
    else
      insert = insert._right;
  }

  return insert;
};

Heap.prototype._swap = function(a, b) {
  var cleft, cright, tparent;

  cleft = b._left;
  cright = b._right;

  if (a._parent) {
    if (a._parent._left == a) a._parent._left = b;
    else a._parent._right = b;
  }

  b._parent = a._parent;
  a._parent = b;

  // This assumes direct descendents
  if (a._left == b) {
    b._left = a;
    b._right = a._right;
    if (b._right) b._right._parent = b;
  } else {
    b._right = a;
    b._left = a._left;
    if (b._left) b._left._parent = b;
  }

  a._left = cleft;
  a._right = cright;

  if (a._left) a._left._parent = a;
  if (a._right) a._right._parent = a;

  assert.notEqual(a._parent, a, "A shouldn't refer to itself");
  assert.notEqual(b._parent, b, "B shouldn't refer to itself");
};

Heap.prototype._delete_swap = function(a, b) {
  if (a._left != b) b._left = a._left;
  if (a._right != b) b._right = a._right;

  if (b._parent._left == b) b._parent._left = null;
  else b._parent._right = null;

  if (a._parent) {
    if (a._parent._left == a) a._parent._left = b;
    else a._parent._right = b;
  }

  b._parent = a._parent;

  if (b._left) b._left._parent = b;
  if (b._right) b._right._parent = b;

  a._parent = null;
  a._left = null;
  a._right = null;
};

Heap.prototype._smallest = function(heap) {
  var small = heap;

  if (heap._left && heap._key > heap._left._key) {
    small = heap._left;
  }

  if (heap._right && small._key > heap._right._key) {
    small = heap._right;
  }

  return small;
};

Heap.prototype._largest = function(heap) {
  var large = heap;

  if (heap._left && heap._key < heap._left._key) {
    large = heap._left;
  }

  if (heap._right && large._key < heap._right._key) {
    large = heap._right;
  }

  return large;
};

Heap.prototype._up = function(node) {
  if (!node || !node._parent)
    return;

  var next = this._comparator(node._parent);

  if (next != node._parent) {
    this._swap(node._parent, node);
    this._up(node);
  }
};

Heap.prototype._down = function(node) {
  if (!node)
    return;

  var next = this._comparator(node);
  if (next != node) {
    this._swap(node, next);
    this._down(node);
  }
};

var util = require('util');

Heap.prototype.print = function(stream) {
  stream.write('digraph {\n');
  Heap._print(this.root, stream);
  stream.write('}\n');
};

Heap._print = function(heap, stream) {
  if (!heap) return;

  if (heap._left) {
    stream.write(util.format('' + heap._key, '->', heap._left._key, '\n'));
    Heap._print(heap._left, stream);
  }

  if (heap._right) {
    stream.write(util.format('' + heap._key, '->', heap._right._key, '\n'));
    Heap._print(heap._right, stream);
  }
};

module.exports = Heap;
