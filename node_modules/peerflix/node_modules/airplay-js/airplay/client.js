/**
 * node-airplay
 * 
 * @file airplay protocol client
 * @author zfkun(zfkun@msn.com)
 * @thanks https://github.com/benvanik/node-airplay/blob/master/lib/airplay/client.js
 */

var buffer = require( 'buffer' );
var events = require( 'events' );
var net = require( 'net' );
var util = require( 'util' );
var plist = require( 'plist-with-patches' );

var CLIENT_USERAGENT = 'MediaControl/1.0';
var CLIENT_PING_DELAY = 30; // 心跳间隔(s)


var Client = function ( options, callback ) {
    events.EventEmitter.call( this );

    var self = this;

    // { port, host, localAddress, path, allowHalfOpen }
    this.options = options;
    this.responseQueue = [];

    this.socket = net.createConnection( options, function() {
        self.responseQueue.push( callback );
        self.ping();
    });

    this.socket.on( 'data', function( data ) {
        var res = self.parseResponse( data.toString() );
        // util.puts( util.inspect( res ) );

        var fn = self.responseQueue.shift();
        if ( fn ) {
            fn( res );
        }
    });

    // TODO
    this.socket.on( 'error', function ( err ) {
        // FIXME: 这里会时不时的抛出异常: 'Uncaught, unspecified "error" event.'
        try {
            self.emit( 'error', { type: 'socket', res: err } );
        } catch( e ) {
            console.info( e.message );
        }
    });
};

util.inherits( Client, events.EventEmitter );
exports.Client = Client;


// just for keep-alive
// bug fix for '60s timeout'
Client.prototype.ping = function ( force ) {
    if ( !this.pingTimer || force === true ) {
        clearTimeout( this.pingTimer );
    }

    if ( !this.pingHandler ) {
        this.pingHandler = this.ping.bind( this );
    }

    this.socket.write(
        [
            'GET /playback-info HTTP/1.1',
            'User-Agent: ' + CLIENT_USERAGENT,
            'Content-Length: 0',
            '\n'
        ].join( '\n' ) + '\n'
    );

    this.emit( 'ping', !!force );

    // next
    this.pingTimer = setTimeout( this.pingHandler, CLIENT_PING_DELAY * 1000 );

    return this;
};

Client.prototype.close = function() {
    if ( this.socket ) {
        this.socket.destroy();
    }
    this.socket = null;
    return this;
};

Client.prototype.parseResponse = function( res ) {
    // Look for HTTP response:
    // HTTP/1.1 200 OK
    // Some-Header: value
    // Content-Length: 427
    // \n
    // body (427 bytes)

    var header = res;
    var body = '';
    var splitPoint = res.indexOf( '\r\n\r\n' );
    if ( splitPoint != -1 ) {
        header = res.substr(0, splitPoint);
        body = res.substr(splitPoint + 4);
    }

    // Normalize header \r\n -> \n
    header = header.replace(/\r\n/g, '\n');

    // Peel off status
    var status = header.substr( 0, header.indexOf( '\n' ) );
    var statusMatch = status.match( /HTTP\/1.1 ([0-9]+) (.+)/ );
    header = header.substr( status.length + 1 );

    // Parse headers
    var allHeaders = {};
    var headerLines = header.split( '\n' );
    for ( var n = 0; n < headerLines.length; n++ ) {
        var headerLine = headerLines[n];
        var key = headerLine.substr( 0, headerLine.indexOf( ':' ) );
        var value = headerLine.substr( key.length + 2 );
        allHeaders[key] = value;
    }

    // Trim body?
    return {
        statusCode: parseInt( statusMatch[1], 10 ),
        statusReason: statusMatch[2],
        headers: allHeaders,
        body: body
    };

};

Client.prototype.request = function( req, body, callback ) {
    if ( !this.socket ) {
        util.puts('client not connected');
        return;
    }

    req.headers = req.headers || {};
    req.headers['User-Agent'] = CLIENT_USERAGENT;
    req.headers['Content-Length'] = body ? buffer.Buffer.byteLength( body ) : 0;

    // GET时不能启用Keep-Alive,会造成阻塞
    if ( req.method === 'POST') {
        // req.headers['Connection'] = 'keep-alive';
    }


    // 1. base
    var text = req.method + ' ' + req.path + ' HTTP/1.1\n';
    // 2. header
    for ( var key in req.headers ) {
        text += key + ': ' + req.headers[key] + '\n';
    }
    text += '\n'; // 这个换行不能少~~
    // 3. body
    text += body || '';


    this.responseQueue.push( callback );

    this.socket.write( text );
};

Client.prototype.get = function( path, callback ) {
    this.request( { method: 'GET', path: path }, null, callback );
};

Client.prototype.post = function( path, body, callback ) {
    this.request( { method: 'POST', path: path }, body, callback );
};



Client.prototype.serverInfo = function ( callback ) {
    this.get( '/server-info', function ( res ) {
        var info = {};
        
        var obj = plist.parseStringSync( res.body );
        if ( obj ) {
            info = {
                deviceId: obj.deviceid,
                features: obj.features,
                model: obj.model,
                osVersion: obj.osBuildVersion,
                protocolVersion: obj.protovers,
                sourceVersion: obj.srcvers,
                vv: obj.vv
            };
        }
        else {
            this.emit( 'error', { type: 'serverInfo', res: res } );
        }

        if ( callback ) {
            callback( info );
        }
    });
};
Client.prototype.playbackInfo = function ( callback ) {
    this.get( '/playback-info', function ( res ) {
        var info;

        if ( res ) {
            var obj = plist.parseStringSync( res.body );
            if ( obj && Object.keys( obj ).length > 0 ) {
                info = {
                    duration: obj.duration,
                    position: obj.position,
                    rate: obj.rate,
                    readyToPlay: obj.readyToPlay,
                    readyToPlayMs: obj.readyToPlayMs,
                    playbackBufferEmpty: obj.playbackBufferEmpty,
                    playbackBufferFull: obj.playbackBufferFull,
                    playbackLikelyToKeepUp: obj.playbackLikelyToKeepUp,
                    loadedTimeRanges: obj.loadedTimeRanges,
                    seekableTimeRanges: obj.seekableTimeRanges,

                    uuid: obj.uuid,
                    stallCount: obj.stallCount
                };
            }
        }
        else {
            this.emit( 'error', { type: 'playbackInfo', res: res } );
        }

        if ( callback) {
            callback( info );
        }
    });
};

// position: 0 ~ 1
Client.prototype.simpleplay = function ( src, position, callback ) {
    var body = [
        'Content-Location: ' + src,
        'Start-Position: ' + (position || 0)
    ].join( '\n' ) + '\n';

    this.post( '/play', body, function( res ) {
        callback && callback( res );
    });
};
Client.prototype.stop = function ( callback ) {
    this.post( '/stop', null, function( res ) {
        callback && callback( res );
    });
};
Client.prototype.rate = function ( value, callback ) {
    this.post( '/rate?value=' + value, null, function( res ) {
        callback && callback( res );
    });
};
Client.prototype.volume = function ( value, callback ) {
    this.post( '/volume?value=' + value, null, function( res ) {
        callback && callback( res );
    });
};
Client.prototype.scrub = function ( position, callback ) {
    this.post( '/scrub?position=' + position, null, function( res ) {
        callback && callback( res );
    });
};
Client.prototype.reverse = function ( callback ) {
    this.post( '/reverse', null, function( res ) {
        callback && callback( res );
    });
};
Client.prototype.photo = function ( callback ) {
    callback && callback();
};
Client.prototype.authorize = function ( callback ) {
    callback && callback();
};
Client.prototype.slideshowFeatures = function ( callback ) {
    callback && callback();
};
