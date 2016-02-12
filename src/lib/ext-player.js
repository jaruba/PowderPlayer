
var fs = require('fs');
var async = require('async');
var path = require('path');
var knownNames = ['VLC', 'MPlayer', 'MPV', 'MPC-HC', 'MPC-BE', 'SMPlayer', 'Bomi', 'PotPlayer', 'PotPlayerMini', 'PotPlayerMini64'];
var knownExes = knownNames.join('/').toLowerCase().split('/');

var DEBUT = Date.now();

var USER_INPUT = process.argv[2],
    FOUND_PLAYER,
    PATH_TO_PLAYER;

var searchPaths = {
    linux: [],
    darwin: [],
    win32: []
};

var addPath = function (path) {
    if (fs.existsSync(path)) {
        searchPaths[process.platform].push(path);
    }
};

// linux
addPath('/usr/bin');
addPath('/usr/local/bin');
// darwin
addPath('/Applications');
addPath(process.env.HOME + '/Applications');
// win32
addPath(process.env.SystemDrive + '\\Program Files\\');
addPath(process.env.SystemDrive + '\\Program Files (x86)\\');
addPath(process.env.LOCALAPPDATA + '\\Apps\\2.0\\');

async.each(searchPaths[process.platform], function (folderName, pathcb) {
    folderName = path.resolve(folderName);
//    console.log('Scanning: ' + folderName);
    var appIndex = -1;
    var fileStream = require('readdirp')({
        root: folderName,
        depth: 3
    });
    fileStream.on('data', function (d) {
        var app = d.name.replace('.app', '').replace('.exe', '').toLowerCase();
//        var match = app === USER_INPUT.trim().toLowerCase();

		if (knownExes.indexOf(app) > -1) var match = true;
		else var match = false;

        if (match) {
            FOUND_PLAYER = knownNames[knownExes.indexOf(app)]; // ex: vlc
            PATH_TO_PLAYER = d.fullPath; // ex: C:\Program Files\VideoLan\vlc.exe --> SAVE THAT JARUBA!
            if (!FOUND_PLAYER) {
//                console.log('%s not found :(', USER_INPUT);
                // make something to warn the user "you need to manually point to binary"
            } else {
//                console.log('Full path to %s is: %s', FOUND_PLAYER, PATH_TO_PLAYER)
				if (FOUND_PLAYER == 'mplayer') {
					PATH_TO_PLAYER += '[]quote[] -playlist';
				}
				window.$('#ext-player-list').append('<div class="actionButton modal-item" onclick="setCustomPlayer(\'' + PATH_TO_PLAYER.split('\\').join('\\\\') + '\')">' + FOUND_PLAYER + '</div>');
            }
            return;
        }
    });
    fileStream.on('end', function () {
        pathcb();
    });
}, function (err) {

    if (err) {
		window.$('#ext-player-announce').hide(0);
		window.$('#ext-player-error').css('display','block');
        console.error('External Players: scan', err);
        return;
    } else {
		window.$('#ext-player-announce').hide(0);
		window.$('#ext-player-list').show(0);
//        console.log('External Players: scan finished in %s milliseconds', Date.now() - DEBUT);
//        console.log('Full path to %s is: %s', FOUND_PLAYER, PATH_TO_PLAYER)
        return;
    }
});
