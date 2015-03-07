var browser = require( '../' ).createBrowser();

var media = {
    url : 'http://commondatastorage.googleapis.com/gtv-videos-bucket/big_buck_bunny_1080p.mp4',
    file: '/Users/guerrerocarlos/Desktop/a.mp4',
    subtitles: [{
        language: 'en-US',
        url: 'http://carlosguerrero.com/captions_styled.vtt',
        name: 'English',
    },
    {
        language: 'es-ES',
        url: 'http://carlosguerrero.com/captions_styled_es.vtt',
        name: 'Spanish',
    }
    ],
    cover: {
        title: 'Big Bug Bunny',
        url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg'
    },
    subtitles_style: {
          backgroundColor: '#FFFFFFFF', // see http://dev.w3.org/csswg/css-color/#hex-notation
          foregroundColor: '#000FFFF', // see http://dev.w3.org/csswg/css-color/#hex-notation
          edgeType: 'DROP_SHADOW', // can be: "NONE", "OUTLINE", "DROP_SHADOW", "RAISED", "DEPRESSED"
          edgeColor: '#AA00FFFF', // see http://dev.w3.org/csswg/css-color/#hex-notation
          fontScale: 1.5, // transforms into "font-size: " + (fontScale*100) +"%"
          fontStyle: 'BOLD_ITALIC', // can be: "NORMAL", "BOLD", "BOLD_ITALIC", "ITALIC",
          fontFamily: 'Droid Sans',
          fontGenericFamily: 'CURSIVE', // can be: "SANS_SERIF", "MONOSPACED_SANS_SERIF", "SERIF", "MONOSPACED_SERIF", "CASUAL", "CURSIVE", "SMALL_CAPITALS",
          windowColor: '#AA00FFFF', // see http://dev.w3.org/csswg/css-color/#hex-notation
          windowRoundedCornerRadius: 10, // radius in px
          windowType: 'ROUNDED_CORNERS' // can be: "NONE", "NORMAL", "ROUNDED_CORNERS"
    }
}

browser.on( 'deviceOn', function( device ) {
    device.simpleplay(media , 0, function() {
        console.info( 'video playing...' );
    });
});
browser.start();

