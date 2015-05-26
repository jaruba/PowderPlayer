upnp-device-client
==================
### A simple and versatile UPnP device client

This module can query UPnP devices descriptions, service descriptions and call actions on services. It also provides a simple interface to subscribe to UPnP services events.

Install
-------

```bash
$ npm install upnp-device-client
```

Usage
-----

```javascript
var Client = require('upnp-device-client');

// Instanciate a client with a device description URL (discovered by SSDP)
var client = new Client('http://192.168.1.50:4873/foo.xml');

// Get the device description
client.getDeviceDescription(function(err, description) {
  if(err) throw err;
  console.log(description);
});

// Get the device's AVTransport service description
client.getServiceDescription('AVTransport', function(err, description) {
  if(err) throw err;
  console.log(description);
});

// Call GetMediaInfo on the AVTransport service
client.callAction('AVTransport', 'GetMediaInfo', { InstanceID: 0 }, function(err, result) {
  if(err) throw err;
  console.log(result); // => { NrTracks: '1', MediaDuration: ... }
});

client.subscribe('AVTransport', function(e) {
  // Will receive events like { InstanceID: 0, TransportState: 'PLAYING' } when playing media
  console.log(e); 
});

// client.unsubscribe('AVTransport', listener);
```

Run with debug traces

```bash
$ DEBUG=* node index.js
```