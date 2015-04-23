/**
 * node-airplay
 *
 * @file airplay device
 * @author zfkun(zfkun@msn.com)
 * @thanks https://github.com/benvanik/node-airplay/blob/master/lib/airplay/device.js
 */

var events = require( 'events' );
var util = require( 'util' );

var Client = require( './client' ).Client;

function Device ( id, info, name, callback ) {
    var self = this;

    events.EventEmitter.call( this );

    this.id = id;
    this.info = info;
    this.name = name;
    // this.serverInfo = null;
    this.pingDelay = 5 * 1000; // 心跳间隔

    this.client = new Client(
        {
            host: info[0], port: 7000
            // ,user: 'zfkun', pass: ''
        },
        function () {
            self.client.serverInfo(function( info ) {
                self.serverInfo = info;
                self.onReady( callback );
            });
        }
    );
    this.client.on( 'ping', function () { self.emit( 'ping' ); });

    self.hls = require( '../airplay' ).createHLS();
    self.hls.on( 'start', function () {
        console.info( '[HLS] start: %s', self.hls.getURI() );
    });
    self.hls.on( 'stop', function () {
        console.info( '[HLS] stop: %s', self.hls.getURI() );
    });
    self.hls.on( 'request', function ( req ) {
        // var uri = url.parse( req.url, true );
        console.info( '[HLS] request: %s', req.url );
    });
    self.hls.on( 'process', function ( d ) {
        console.info( '[HLS] segment process: %s, %s, %s', d.index, d.file, d.out.toString() );
    });
    self.hls.on( 'segment', function ( d ) {
        console.info( '[HLS] segment created: %s, %s, %s', d.index, d.file, d.out );
    });
    self.hls.on( 'open', function ( d ) {
        console.info( '[HLS] opend: %s, %s', d.file, util.inspect( d.info ) );
    });
    self.hls.on( 'error', function ( err ) {
        console.info( '[HLS] segment error: ', util.inspect( err ) );
    });


}

util.inherits( Device, events.EventEmitter );
exports.Device = Device;


Device.prototype.onReady = function ( callback ) {
    this.ready = !0;

    if ( callback ) {
        callback( this );
    }

    this.emit( 'ready', this );
};

Device.prototype.isReady = function () {
  return !!this.ready;
};

Device.prototype.close = function() {
    if ( this.client ) {
        this.client.close();
    }

    this.client = null;
    this.ready = !1;

    this.emit( 'close', this );
};

Device.prototype.match = function ( info ) {
    for ( var key in info ) {
        if ( this.info[ key ] != info[ key ] ) {
            return !1;
        }
    }
    return !0;
};

Device.prototype.getInfo = function() {
    var info = this.info;
    var txtRecord = info.txtRecord || {};
    var serverInfo = this.serverInfo;

    return {
        id: this.id,
        name: info.name,
        fullName: info.fullname,
        deviceId: txtRecord.deviceid || serverInfo.deviceId,
        features: serverInfo.features || txtRecord.features,
        model: serverInfo.model,
        interfaceName: info.networkInterface,
        interfaceIndex: info.interfaceIndex,
        addresses: info.addresses,

        flags: txtRecord.flags,
        pk: txtRecord.pk,

        osVersion: serverInfo.osVersion,
        protocolVersion: serverInfo.protocolVersion,
        sourceVersion: serverInfo.sourceVersion || txtRecord.srcvers,
        vv: serverInfo.vv || txtRecord.vv,

        slideshowFeatures: [],
        supportedContentTypes: []
    };
};

Device.prototype.play = function(media, position, callback){
    var self = this

    //#TODO: Check if has ffmpeg and if not, go directly to simpleplay
    //
    console.log(typeof(media))
    self.hls.start( 7001 + this.id );

    console.log("going to play: "+media)
    self.hls.open( media , function ( info ) {
        device.simpleplay( self.hls.getURI(), '0.000000', function ( res ) {
            console.info( '->> ', res );
            setTimeout(function(){
                device.status( function ( info ) {
                    console.info( '->> ', info ? info : 'no info >(' );
                    if ( info ) {
                        console.log(info)
                    }
                });
            }, 4000);
        });
    });
    self.hls.on('NoFFMPEG', function(){
        self.simpleplay(media, position, callback);
        self.emit('NoFFMPEG')
    })

};


// extend airplay apis: 'localName[:clientName]'
[
    'status:playbackInfo', 'authorize',
    'simpleplay', 'stop', 'scrub', 'reverse', 'rate', 'volume',
    'photo'
].forEach(function ( api ) {
    api = api.split( ':' );
    api[1] = api[1] || api[0];

    Device.prototype[ api[0] ] = function() {
        this.client[ api[1] ].apply( this.client, arguments );
    };
});

