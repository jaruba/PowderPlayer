# dnsd: DNS encoder, decoder, and server

*dnsd* is a Node.js package for working with DNS. It converts binary DNS messages to and from convenient JavaScript objects; and it provides a server API, for running a custom name server.

*dnsd* is available as an npm module.

    $ npm install dnsd

## Example: Running a server

This simple DNS server responds with an "A" (address) record of `1.2.3.4` for every request.

```javascript
var dnsd = require('dnsd')
dnsd.createServer(function(req, res) {
  res.end('1.2.3.4')
}).listen(5353, '127.0.0.1')
console.log('Server running at 127.0.0.1:5353')
```

Now test your server:

    $ dig @localhost -p 5353 foo.example A

    ; <<>> DiG 9.8.1-P1 <<>> @localhost -p 5353 foo.example A
    ; (1 server found)
    ;; global options: +cmd
    ;; Got answer:
    ;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 27955
    ;; flags: qr rd; QUERY: 1, ANSWER: 1, AUTHORITY: 0, ADDITIONAL: 0
    ;; WARNING: recursion requested but not available

    ;; QUESTION SECTION:
    ;foo.example.			IN	A

    ;; ANSWER SECTION:
    foo.example.		3600	IN	A	1.2.3.4

    ;; Query time: 1 msec
    ;; SERVER: 127.0.0.1#5353(127.0.0.1)
    ;; WHEN: Wed Aug  8 05:10:40 2012
    ;; MSG SIZE  rcvd: 45

This example logs all requests. For address (A) queries, it returns two records, with a random TTL, and the final octet of the IP address is the length of the hostname queried.

```javascript
var dnsd = require('dnsd')

var server = dnsd.createServer(handler)
server.zone('example.com', 'ns1.example.com', 'us@example.com', 'now', '2h', '30m', '2w', '10m')
      .listen(5353, '127.0.0.1')
console.log('Server running at 127.0.0.1:5353')

function handler(req, res) {
  console.log('%s:%s/%s %j', req.connection.remoteAddress, req.connection.remotePort, req.connection.type, req)

  var question = res.question[0]
    , hostname = question.name
    , length = hostname.length
    , ttl = Math.floor(Math.random() * 3600)

  if(question.type == 'A') {
    res.answer.push({name:hostname, type:'A', data:"1.1.1."+length, 'ttl':ttl})
    res.answer.push({name:hostname, type:'A', data:"2.2.2."+length, 'ttl':ttl})
  }
  res.end()
}
```

Test the SOA response:

    $ dig @localhost -p 5353 example.com soa

    ; <<>> DiG 9.8.1-P1 <<>> @localhost -p 5353 example.com soa
    ; (1 server found)
    ;; global options: +cmd
    ;; Got answer:
    ;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 30176
    ;; flags: qr aa rd; QUERY: 1, ANSWER: 1, AUTHORITY: 0, ADDITIONAL: 0
    ;; WARNING: recursion requested but not available

    ;; QUESTION SECTION:
    ;example.com.			IN	SOA

    ;; ANSWER SECTION:
    example.com.		600	IN	SOA	ns1.example.com. us.example.com. 1344403648 7200 1800 1209600 600

    ;; Query time: 5 msec
    ;; SERVER: 127.0.0.1#5353(127.0.0.1)
    ;; WHEN: Wed Aug  8 05:27:32 2012
    ;; MSG SIZE  rcvd: 72

And test the address (A) response:

    $ dig @localhost -p 5353 example.com a

    ; <<>> DiG 9.8.1-P1 <<>> @localhost -p 5353 example.com a
    ; (1 server found)
    ;; global options: +cmd
    ;; Got answer:
    ;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 19419
    ;; flags: qr aa rd; QUERY: 1, ANSWER: 2, AUTHORITY: 0, ADDITIONAL: 0
    ;; WARNING: recursion requested but not available

    ;; QUESTION SECTION:
    ;example.com.			IN	A

    ;; ANSWER SECTION:
    example.com.		1222	IN	A	1.1.1.11
    example.com.		1222	IN	A	2.2.2.11

    ;; Query time: 1 msec
    ;; SERVER: 127.0.0.1#5353(127.0.0.1)
    ;; WHEN: Wed Aug  8 05:27:34 2012
    ;; MSG SIZE  rcvd: 61

Server output for these queries:

    Server running at 127.0.0.1:5353
    127.0.0.1:34427/udp4 {"id":30176,"type":"request","responseCode":0,"opcode":"query","authoritative":false,"truncated":false,"recursion_desired":true,"recursion_available":false,"authenticated":false,"checking_disabled":false,"question":[{"name":"example.com","type":"SOA","class":"IN"}]}
    127.0.0.1:59596/udp4 {"id":19419,"type":"request","responseCode":0,"opcode":"query","authoritative":false,"truncated":false,"recursion_desired":true,"recursion_available":false,"authenticated":false,"checking_disabled":false,"question":[{"name":"example.com","type":"A","class":"IN"}]}


## Example: MX Records
This is an example if you need to route your mail server with an MX record.

```javascript
// Example MX response with dnsd
//
// To test:
// 1. Run this program
// 2. dig @localhost -p 5353 example.com mx
 
var dnsd = require('dnsd')
 
var server = dnsd.createServer(handler)
server.zone('example.com', 'ns1.example.com', 'us@example.com', 'now', '2h', '30m', '2w', '10m')
server.listen(5353, '127.0.0.1')
console.log('Listening at 127.0.0.1:5353')
 
function handler(req, res) {
  var question = res.question && res.question[0]
 
  if(question.type != 'MX')
    return res.end()
 
  console.log('MX lookup for domain: %s', question.name)
  res.answer.push({'name':question.name, 'type':'MX', 'data':[10, 'mail.example.com']})
  res.answer.push({'name':question.name, 'type':'MX', 'data':[20, 'mail.backupexample.com']})
  
  return res.end()
}
```

The MX data attribute needs to be an Array to work properly, the first value is the priority, the second is the server.
This server name must be a domain string and not an IP address. Make sure you have an A record or CNAME setup for this.

See http://support.google.com/a/bin/answer.py?hl=en&answer=140034 for more info on MX records and configuration.



## Example: Parse a message

```javascript
var fs = require('fs')
var dnsd = require('dnsd')

var msg_file = require.resolve('dnsd/_test_data/registry.npmjs.org-response')
  , msg_data = fs.readFileSync(msg_file)
  , message = dnsd.parse(msg_data)

console.dir(message)
```

Output

```javascript
{ id: 34233,
  type: 'response',
  responseCode: 0,
  opcode: 'query',
  authoritative: false,
  truncated: false,
  recursion_desired: true,
  recursion_available: true,
  authenticated: false,
  checking_disabled: false,
  question: [ { name: 'registry.npmjs.org', type: 'A', class: 'IN' } ],
  answer:
   [ { name: 'registry.npmjs.org',
       type: 'CNAME',
       class: 'IN',
       ttl: 85,
       data: 'isaacs.iriscouch.net' },
     { name: 'isaacs.iriscouch.net',
       type: 'CNAME',
       class: 'IN',
       ttl: 2821,
       data: 'ec2-23-23-147-24.compute-1.amazonaws.com' },
     { name: 'ec2-23-23-147-24.compute-1.amazonaws.com',
       type: 'A',
       class: 'IN',
       ttl: 356336,
       data: '23.23.147.24' } ] }
```

## Example: Encode a message

```javascript
var dnsd = require('dnsd')

var questions = [ {name:'example.com', class:'IN', type:'TXT'} ]
  , message = {type:'query', id:123, opcode:'query', recursion_desired:true, question:questions}
  , msg_data = dnsd.binify(message)

console.log('Encoded = %j', Array.prototype.slice.apply(msg_data))

message = dnsd.parse(msg_data)

console.log('Round trip:')
console.dir(message)
```

Output:

```javascript
Encoded = [0,123,1,0,0,1,0,0,0,0,0,0,7,101,120,97,109,112,108,101,3,99,111,109,0,0,16,0,1]
Round trip:
{ id: 123,
  type: 'request',
  responseCode: 0,
  opcode: 'query',
  authoritative: false,
  truncated: false,
  recursion_desired: true,
  recursion_available: false,
  authenticated: false,
  checking_disabled: false,
  question: [ { name: 'example.com', type: 'TXT', class: 'IN' } ] }
```

## Defaults

`dnsd` is [defaultable][def]. The option `convenient` (`true` by default) adds convenience code when running a server.  Convenience mode adds several features, mostly to build standards-compliant name servers.

```javascript
var dnsd_easy = require('dnsd')
var dnsd_hard = dnsd_easy.defaults({convenient: false})
```

First, your handler's response object already has `.type = "response"` set; then there are many helpers processing your response:

* You can pass a value to `res.end()`, with special handling depending on type:
  * Array: those values will be added to the `res.answer` section.
  * Object: that object will be sent as a response (`res` is unused).
  * String: the response will add an anser `A` record with your value as the IP address.
* Automatically respond to `SOA` queries with the `SOA` record.
* Responses to an `A` query with no answers will add the `SOA` record to the response.
* If the response records are missing a TTL, use the one from the `.zone()` definition (the `SOA` record)

Without convenience mode, dnsd will simply send your response verbatim, as you define it (or throw an encoding error for missing or bad data).

## Tests

Follow uses [node-tap][tap]. If you clone this Git repository, tap is included.

    $ tap test
    ok test/api.js ........................................ 10/10
    ok test/convenience.js ................................ 22/22
    ok test/message.js .................................. 176/176
    ok test/print.js ...................................... 10/10
    ok test/server.js ..................................... 35/35
    total ............................................... 253/253

    ok

## License

Apache 2.0

See the [Apache 2.0 license](dnsd/blob/master/LICENSE).

[tap]: https://github.com/isaacs/node-tap
[def]: https://github.com/iriscouch/defaultable
