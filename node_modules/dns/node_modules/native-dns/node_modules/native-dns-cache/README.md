Cache
-----

If you perform a query on an A or AAAA type and it doesn't exist, the cache
will attempt to lookup a CNAME and then resolve that.

The constructor takes an optional object with the following properties:

 * `store` -- implements the cache store model (optional, default MemoryStore)

Methods:

 * `lookup(question, cb)` -- for a given question check the cache store for
existence
 * `store(packet)` -- iterates over the resource records in a packet and sends
them to the cache store
 * `purge()` -- clears the cache store of all entries

MemoryStore / Cache store model
-------------------------------

`MemoryStore(opts)` -- An in memory store based on a js object

Methods:

 * `get(domain, key, cb)`
  - `domain` is the holder under which keys will be applied,
`key` is the subdomain that is being queried for.
If you `get('example.com', 'www', cb)` you are really asking for `www.example.com`.
  - `cb(err, results)` -- results is an object of types and array of answers
   * `{ 1: [{address: '127.0.0.1', ttl: 300, type: 1, class: 1}] }`
 * `set(domain, key, data, cb)`
  - `domain` is the parent under which this key is stored.
`key` is the subdomain we are storing, `data` is an object of types with an array of answers.
   * `set('example.com', 'www', {1: [{class:1, type:1, ttl:300, address:'127.0.0.1'}]}, cb)`
  - `cb(err, data)` -- cb merely returns the data that was passed.
 * `delete(domain[, key[, type]], cb)` -- delete all from a domain, a domain and key,
or a domain a key and a type.

Lookup
------

Is a mechanism that given a store performs the common resolution pattern.

Given `example.com` previous added to a store:

  * `www.example.com CNAME foo.bar.example.com.`
  * `*.example.com A 127.0.0.1`

A `Lookup(store, 'example.com', {name:'www.example.com', type:1}, cb)`
will resolve `www` to the CNAME and then search for `foo.bar.example.com` which
will return no results, and then search for `*.bar.example.com` which will also
return no results, and ultimately searches for `*.example.com` which will return
the desired record.

Callback will be called with `(err, results)` where results is an array suitable
for use in `Packet.answer`
