var util = require( 'util' );
var url = require( 'url' );


var hls = require( '../airplay' ).createHLS();

hls.on( 'start', function () {
    console.info( '[HLS] start: %s', hls.getURI() );
});
hls.on( 'stop', function () {
    console.info( '[HLS] stop: %s', hls.getURI() );
});
hls.on( 'request', function ( req ) {
    // var uri = url.parse( req.url, true );
    console.info( '[HLS] request: %s', req.url );
});
hls.on( 'process', function ( d ) {
    console.info( '[HLS] segment process: %s, %s, %s', d.index, d.file, d.out.toString() );
});
hls.on( 'segment', function ( d ) {
    console.info( '[HLS] segment created: %s, %s, %s', d.index, d.file, d.out );
});
hls.on( 'open', function ( d ) {
    console.info( '[HLS] opend: %s, %s', d.file, util.inspect( d.info ) );
});
hls.on( 'error', function ( err ) {
    console.info( '[HLS] segment error: ', util.inspect( err ) );
});


hls.start( 7001 );


setTimeout(function () {
    var filePath = '/Users/fankun/git/zfkun/iplay/video/1.mkv';
    hls.open( filePath, function ( info ) {
        console.info( 'Visit: %s', hls.baseURI + hls.getURI( 'segment', 10 ) );
    });

}, 2000);
