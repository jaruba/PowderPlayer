var browser = require( '../' ).createBrowser();

var media = {
    url : 'http://commondatastorage.googleapis.com/gtv-videos-bucket/big_buck_bunny_1080p.mp4',
    file: '/Users/guerrerocarlos/Desktop/a.mp4',
    subtitles: [{
        language: 'en-US',
        url: 'http://carlosguerrero.com/captions_styled.vtt',
        name: 'English',
    }
    ],
}

browser.on( 'deviceOn', function( device ) {
    device.simpleplay(media , 0, function() {
        console.info( 'video playing...' );
    });
});
browser.start();

