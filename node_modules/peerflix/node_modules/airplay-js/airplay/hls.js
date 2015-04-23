/**
 * node-airplay
 *
 * @file HTTP Live Streaming
 * @author zfkun(zfkun@msn.com)
 */

var fs = require( 'fs' );
var url = require( 'url' );
var path = require( 'path' );
var http = require( 'http' );
var util = require( 'util' );
var events = require( 'events' );
var spawn = require( 'child_process' ).spawn;

var IP_LOCAL = require( './ip' );




function HLSServer( options ) {
    events.EventEmitter.call( this );
    var ops = this.options = options || {};

    // 是否启用流模式(影响m3u8生成机制)
    // ops.streaming = !!ops.streaming;
    // TS文件缓存
    ops.cache = !!ops.cache;
    // TS分片时长(s)
    ops.duration = ops.duration || 20;
    // 编解码库目录
    ops.lib = path.normalize( ops.lib || ( __dirname + '/../dep' ) ) + '/';
    if ( !fs.existsSync( ops.lib ) ) {
        ops.lib = '';
    }
    // TS分片输出目录
    ops.out = path.normalize( ops.out || ( '/tmp' ) ) + '/';
    if ( !fs.existsSync( ops.out ) ) {
        fs.mkdirSync( ops.out );
    }
}

util.inherits( HLSServer, events.EventEmitter );
exports.HLS = HLSServer;




HLSServer.prototype.start = function ( port ) {
    if ( !this.started ) {
        this.started = !0;

        this.baseURI = 'http://' + IP_LOCAL + ( port === 80 ? '' : ':' + port );

        this.server = http.createServer( this.httpHandler.bind( this ) );
        this.server.listen( port, IP_LOCAL );

        this.emit( 'start', { host: IP_LOCAL, port: port } );
    }

    this.port = port
    this.address = IP_LOCAL

    return this;
};

HLSServer.prototype.stop = function() {
    if ( this.started && this.server ) {
        this.server.close();
        this.emit( 'stop' );
    }

    this.started = !1;

    return this;
};

HLSServer.prototype.getURI = function ( type, index ) {
    if ( type === 'video' ) {
        return '/stream/0.m3u8';
    }
    else if ( type === 'audio' ) {
        return '/stream/1.m3u8';
    }
    else if ( type === 'iframes' ) {
        return '/iframes.m3u8';
    }
    else if ( type === 'segment' ) {
        return '/stream/0/' + index + '.ts';
    }
    else {
        return this.baseURI;
    }
};

HLSServer.prototype.setSubtitles = function( subtitles ){
    console.log("Setting subtitles to: "+subtitles)
    var self = this
    self.subtitles = subtitles
}

HLSServer.prototype.open = function ( fileFullPath, callback ) {
    var self = this;
    var media = fileFullPath

    console.log("fileFullPath:")
    console.log(fileFullPath)
    console.log(typeof(fileFullPath))
    if (typeof(fileFullPath) != 'string'){
        self.subtitles = media.subtitles
        fileFullPath = media.file
    }

    if ( this.openThread ) {
        this.openThread.kill();
    }

    this.file = fileFullPath;

    var whichCommand = /^win/.test(process.platform) ? 'where' : 'which'

    self.checkFirst = spawn(whichCommand,['ffprobe'])
    self.checkFirst.on('close', function(data){
        console.log("x:"+data)
        if(data!=0){
            console.log("No FFMPEG FOUND :(")
            self.emit("NoFFMPEG")
            return 0;
        }
    })
    self.checkFirst.stdout.on('data', function(data){
        console.log("d:"+data)

        // # -------------------------------------------------- # //
        // TODO: find the ffmpeg path when the object is constructed instead of resolving it now.
        // PATCH to actually find the ffmpeg executable
        var ffmpegPath = data.toString("utf8").trim()
        if(data.length > 0 && fs.existsSync(ffmpegPath)) {
            var ffmpegPath = path.dirname(ffmpegPath) + path.sep
            if(self.options.lib != ffmpegPath) {
                self.options.lib = ffmpegPath
                console.log("FFMPEG path set to " + ffmpegPath)
            }
        } else {
            self.emit("NoFFMPEG")
            return; // We assume that which will return != 0 so on('close') will handle the NoFFMPEG case.
        }
        // # -------------------------------------------------- # //

        if(data.length >0){
            self.openThread = spawn(
                self.options.lib + 'ffprobe',
                self.command4FFProbe( self.file ));
            var output = '';
            self.openThread.stdout.on( 'data', function ( chunk ) {
                output += chunk;
            });
            self.openThread.stderr.on( 'data', function ( err ) {
                self.emit(
                    'error',
                    { type: 'open', err: err, file: fileFullPath }
                );
            });
            self.openThread.stdout.on( 'end', function () {
                var json;
                try {
                    json = JSON.parse( output );
                } catch (e) {
                    self.emit(
                        'error',
                        { type: 'open', err: e.message, file: fileFullPath }
                    );
                }
                if ( json ) {
                    self.videoInfo = json;
                    // update store
                    self.segmentSize = Math.ceil( parseFloat( json.format.duration, 10 ) / self.options.duration );
                    self.emit( 'open', { file: fileFullPath, info: json } );
                }
                if ( callback ) {
                    callback( json );
                }
                self.openThread = null;
            });
            return self;
        }
    })
};


HLSServer.prototype.segment = function ( index, req, res ) {
    var self = this;
    var outfile = this.options.out + index + '.ts';

    // skip if exists
    if ( fs.existsSync( outfile ) && false) {
        fs.createReadStream( outfile ).pipe( res );
        return;
    }

    var f = spawn(
        this.options.lib + 'ffmpeg',
        this.command4FFMpeg( index, outfile )
    );

    var output = '';
    f.stdout.on( 'data', function ( chunk ) {
        output += chunk;
        self.emit( 'process', { index: index, file: outfile, out: chunk } );
    });
    f.stdout.on( 'error', function ( err ) {
        self.emit(
            'error',
            { type: 'segment', err: err, index: index, file: outfile }
        );
    });

    f.stdout.on( 'end', function () {
        self.emit( 'segment', { index: index, file: outfile, out: output } );
        fs.createReadStream( outfile ).pipe( res );
    });

};

HLSServer.prototype.command4FFProbe = function ( filePath ) {
    var opt = [
        '-v',
        'quiet',
        '-print_format', 'json',
        '-show_format',
        '-show_streams',
        filePath
    ];

    return opt;
};

HLSServer.prototype.command4FFMpeg = function ( tsIndex, tsOutput ) {
    var opt = [
        '-y',
        '-i',
        this.file,
        '-t', this.options.duration,
        '-ss', this.options.duration * (tsIndex - 1),
    ];

    var isH264 = this.videoInfo.streams.some(function ( s ) {
        return s.codec_name === 'h264';
    });

    // h264 && aac
    if ( isH264 ) {
        opt = opt.concat([
            '-c:v', 'libx264', // libx264 || copy
            '-c:a', 'aac', // aac || copy
            '-strict', '-2',
            '-vbsf', 'h264_mp4toannexb'
        ]);
    }
    else {
        opt = opt.concat([
            '-c:v', 'linx264',
            '-c:a', 'aac',
            // '-g', 100,
            // '-vcodec', 'copy',
            // '-acodec', 'copy',
            '-b', '500k',
            '-ac', '2',
            '-ar', '44100',
            '-ab', '32k'
        ]);
    }

    // TODO: HLS by ffmpeg
    // opt = opt.concat([
    //     '-f', 'hls',
    //     '-hls_time', '10',
    //     '-hls_list_size', '999',
    //     'out/0.m3u8'
    // ]);

    opt.push( tsOutput );

    return opt;
};

HLSServer.prototype.httpHandler = function ( request, response ) {
    var ops = this.options;
    var header = {};
    var body = [];
    var uri = url.parse( request.url, true );
    var self = this

    this.emit( 'request', request );

    if ( uri.pathname === '/' ) {
        console.log("attending /")
        body.push( '#EXTM3U' );
        body.push( '#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="audio",LANGUAGE="und",NAME="Original Audio",DEFAULT=YES,AUTOSELECT=YES' );
        console.log(this.subtitles)
        if(this.subtitles){
            this.subtitles.forEach(function(each){
                body.push( '#EXT-X-MEDIA:TYPE=SUBTITLES,GROUP-ID="subs",NAME="English",DEFAULT=YES,AUTOSELECT=YES,FORCED=NO,LANGUAGE="en",URI="http://'+self.address+':'+self.port+'/subtitles/'+each.language+'.m3u8"' )
            })
        }
        //body.push( '#EXT-X-MEDIA:TYPE=SUBTITLES,GROUP-ID="subs",NAME="Spanish",DEFAULT=NO,AUTOSELECT=NO,FORCED=YES,LANGUAGE="en",URI="http://carlosguerrero.com/b.m3u8"' )

        // stream#0
        if(this.subtitles){
            body.push( '#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=20000000,CODECS="mp4a.40.2,avc1.640028",AUDIO="audio",SUBTITLES="subs"' );
        }else{
            body.push( '#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=20000000,CODECS="mp4a.40.2,avc1.640028",AUDIO="audio"' );
        }
        body.push( this.getURI( 'video' ) );

        // // stream#1
        // body.push( '#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=20000000,CODECS="ac-3,avc1.640028",AUDIO="audio"' );
        // body.push( '/stream/1.m3u8' );

        // // frames
        // body.push( '#EXT-X-I-FRAME-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=20000000,CODECS="avc1.640028",URI="/iframes.m3u8"' );

        body.push( '#EXT-X-ENDLIST' );
        body = body.join( '\n' );

        // header['Content-Type'] = 'application/vnd.apple.mpegurl';
        header[ 'Content-Length' ] = body.length;

        response.writeHead( 200, header );
        response.write( body );

        response.end();
    }
    else if ( uri.pathname === this.getURI( 'video' ) ) {
        var tsDuration = ops.duration;
        var videoDuration = parseFloat( this.videoInfo.format.duration, 10 );

        body.push( '#EXTM3U' );
        body.push( '#EXT-X-VERSION:3' );
        // body.push( '#EXT-X-PLAYLIST-TYPE:EVENT' );
        body.push( '#EXT-X-MEDIA-SEQUENCE:0' );
        body.push( '#EXT-X-TARGETDURATION:' + tsDuration );
        body.push( '#EXT-X-PLAYLIST-TYPE:VOD' );
        body.push( '#EXT-X-ALLOW-CACHE:' + ( ops.cache ? 'YES' : 'NO') );

        for ( var i = 1, n = this.segmentSize; i < n; i++ ) {
            body.push(
                '#EXTINF:'
                // 最后一个分段一般会少一点，需要精确计算下
                + ( i >= n ? ( videoDuration % tsDuration || tsDuration ) : tsDuration )
                + ','
            );
            body.push( this.getURI( 'segment', i ) );
        }

        body.push( '#EXT-X-ENDLIST' );
        body = body.join( '\n' );

        // header['Connection'] = 'Keep-Alive';
        // header['Content-Type'] = 'application/vnd.apple.mpegurl';
        header['Content-Length'] = body.length;

        response.writeHead( 200, header );
        response.write( body );
        response.end();
    }
    // else if ( uri.pathname === this.getURI( 'audio' ) ) {
    // }
    // else if ( uri.pathname === this.getURI( 'iframes' ) ) {
    //     body.push( '#EXTM3U' );
    //     body.push( '#EXT-X-VERSION:4' );
    //     body.push( '#EXT-X-TARGETDURATION:3' );
    //     body.push( '#EXT-X-I-FRAMES-ONLY' );
    //     body.push( '#EXT-X-PLAYLIST-TYPE:VOD' );
    //     body.push( '#EXT-X-ALLOW-CACHE:YES' );
    //     body.push( '#EXT-X-MEDIA-SEQUENCE:0' );

    //     body.push( '#EXTINF:3.000000000000000,' );
    //     body.push( '#EXT-X-BYTERANGE:2097152@564' );

    //     body.push( '/iframes/0.ts' );
    //     body.push( '#EXTINF:3.000000000000000,' );
    //     body.push( '#EXT-X-BYTERANGE:2097152@564' );
    //     body.push( '/iframes/1.ts' );
    //     ...

    //     body.push( '#EXT-X-ENDLIST' );
    // }
    else if ( /^\/stream\/0\//.test( uri.pathname ) ) {
        header['Content-Type'] = 'video/MP2T';
        response.writeHead( 200, header );

        var tsIndex = parseInt( path.basename( uri.pathname, '.ts' ), 10 );
        this.segment( tsIndex, request, response );
        this.emit( 'stream', tsIndex, this.segmentSize );
        // fs.createReadStream( filePath ).pipe( response );
        // response.write( fs.readFileSync( filePath ) );
        // response.end();
    } else if ( /^\/subtitles/.test(uri.pathname) ){

        var selected = uri.pathname.substring(11,uri.pathname.length)

        body = []
        response.write('#EXTM3U\n')
        response.write('#EXT-X-TARGETDURATION:30\n')
        response.write('#EXT-X-VERSION:3\n')
        response.write('#EXT-X-MEDIA-SEQUENCE:1\n')
        response.write('#EXT-X-PLAYLIST-TYPE:VOD\n')

        this.subtitles.forEach(function(each){
            console.log(each)
            if( selected.indexOf(each.language)>-1 ){
                response.write('#EXTINF:30.0,\n')
                response.write(each.url+'\n')
            }
        });
        response.write('#EXT-X-ENDLIST\n')

        body = ""
        response.end();
    } else {
        response.writeHead( 404 );
        response.end();
    }

};

