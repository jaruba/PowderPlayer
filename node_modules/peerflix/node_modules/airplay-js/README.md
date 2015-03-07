node-airplay 
=================

node-airplay is a native javascript client library for Apple's AirPlay remote playback protocol.

## Installation

From npm:

	npm intall airplay-js

## Usage

``` javascript
// remote video
var browser = require( 'airplay-js' ).createBrowser();
browser.on( 'deviceOn', function( device ) {
    device.play( 'http://remotehost/video.mp4', 0, function() {
        console.info( 'video playing...' );
    });
});
browser.start();
```


## Help

+ [Unofficial AirPlay Protocol Specification](http://nto.github.io/AirPlay.html)
+ [HLS(HTTP Live Streaming)](http://tools.ietf.org/html/draft-pantos-http-live-streaming-12)
+ [ffmpeg build for ios](http://www.cocoachina.com/bbs/read.php?tid=142628&page=1)
+ [ffmpeg build for MacOS](http://trac.ffmpeg.org/wiki/MacOSXCompilationGuide#Shortcut:CompileFFmpegthroughHomebrew)
+ [mdns User Guide](http://agnat.github.io/node_mdns/user_guide.html)


## API

+ [Browser](https://github.com/zfkun/node-airplay/wiki/Browser-API)
+ [Device](https://github.com/zfkun/node-airplay/wiki/Device-API)
+ [Client](https://github.com/zfkun/node-airplay/wiki/Client-API)
+ [HLS](https://github.com/zfkun/node-airplay/wiki/HLS-API)

