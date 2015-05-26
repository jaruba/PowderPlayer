upnp-mediarenderer-client
=========================
### An UPnP/DLNA MediaRenderer client

This module allows you to control an UPnP/DLNA MediaRenderer directly (usually your TV set). It implements load, play, pause, stop and seek commands.

Events coming from the MediaRenderer (ie. fired from the TV remote) such as `playing`, `paused`, `stopped` can be listened to.

External subtitles are supported through DIDL-Lite metadata, but be aware that some MediaRenderers require the HTTP server serving the media file to return specific headers as illustrated in this [gist](https://gist.github.com/thibauts/5f5f8d8ce6566c8289e6). Also, some MediaRenderers don't support external subtitles at all.

Installation
------------

```bash
$ npm install upnp-mediarenderer-client
```

Usage
-----

```javascript
var MediaRendererClient = require('upnp-mediarenderer-client');

// Instanciate a client with a device description URL (discovered by SSDP)
var client = new MediaRendererClient('http://192.168.1.50:4873/foo.xml');

// Load a stream with subtitles and play it immediately
var options = { 
  autoplay: true,
  contentType: 'video/avi',
  metadata: {
    title: 'Some Movie Title',
    creator: 'John Doe',
    type: 'video', // can be 'video', 'audio' or 'image'
    subtitlesUrl: 'http://url.to.some/subtitles.srt'
  }
};

client.load('http://url.to.some/stream.avi', options, function(err, result) {
  if(err) throw err;
  console.log('playing ...');
});

// Pause the current playing stream
client.pause();

// Unpause
client.play();

// Stop
client.stop();

// Seek to 10 minutes
client.seek(10 * 60);

client.on('status', function(status) {
  // Reports the full state of the AVTransport service the first time it fires,
  // then reports diffs. Can be used to maintain a reliable copy of the
  // service internal state.
  console.log(status);
});

client.on('loading', function() {
  console.log('loading');
});

client.on('playing', function() {
  console.log('playing');

  client.getPosition(function(err, position) {
    console.log(position); // Current position in seconds
  });

  client.getDuration(function(err, duration) {
    console.log(duration); // Media duration in seconds
  });
});

client.on('paused', function() {
  console.log('paused');
});

client.on('stopped', function() {
  console.log('stopped');
});

client.on('speedChanged', function(speed) {
  // Fired when the user rewinds of fast-forwards the media from the remote
  console.log('speedChanged', speed);
});
```
