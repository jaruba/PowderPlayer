import engineStore from '../../../stores/engineStore';

var player;
var prebufMap = [];
var current;

// helper functions

function isDefined(param) {
    return typeof param != 'undefined';
}

function isFileFromTorrent() {
    return player && isDefined(current) && isDefined(player.itemDesc(current).setting.streamID) ? true : false;
}

// end helper functions

function onPiece() {

    var engineState = engineStore.getState();

    if (player.wcjs.state > 1) {
        prebuffering.end();
        return;
    }

    // get file progress

    var fileSel = player.itemDesc(current).setting.streamID;

    // buffering with WebChimera.js is set in time, not byte length
    // we can never know the real prebuffering percent because we can't know
    // the amount of playback time that a piece holds or the duration of
    // the video, no excuse for the silly logic in the next 3 lines, but
    // it takes into account file lengths, more often then not it's correct
    var file = engineState.torrents[engineState.infoHash].files[fileSel];
    var fileProgress = Math.round(engineState.torrents[engineState.infoHash].torrent.pieces.bank.filePercent(file.offset, file.length) * 100);
    var prebuf = Math.floor( fileProgress * 45 );

    var announcer = {};
    announcer.text = 'Prebuffering ' + prebuf + '%';

    clearTimeout(player.announceTimer);

    if (prebuf >= 100) {

        prebuffering.end();

        announcer.text = 'Opening Media';
        announcer.effect = false;

    } else if (player.announceEffect)
        announcer.effect = false;

    if (Object.keys(announcer).length)
        player.events.emit('announce', announcer);
}

var prebuffering = {
    start: (playerObj) => {

        player = playerObj;

        var engineState = engineStore.getState();
        if (engineState.torrents && engineState.infoHash && engineState.torrents[engineState.infoHash] && engineState.torrents[engineState.infoHash].torrent) { 
            // we have a torrent running

            if (!prebufMap[engineState.infoHash]) prebufMap[engineState.infoHash] = [];

            if (player.wcjs.playlist.currentItem == -1) current = 0;
            else current = player.wcjs.playlist.currentItem;

            // make sure that the currently running playlist item is a file from the torrent
            if (!isFileFromTorrent()) return

            if (!prebufMap[engineState.infoHash][current]) {

                // video is opening for the first time, show prebuffering

                clearTimeout(player.announceTimer);
                player.events.emit('announce', {
                    text: 'Prebuffering 0%',
                    effect: false
                });

                engineState.torrents[engineState.infoHash].on('download', onPiece);

            }
        }
    },

    end: () => {
        if (isFileFromTorrent()) {

            var engineState = engineStore.getState();

            if (!prebufMap[engineState.infoHash][current]) {
                engineState.torrents[engineState.infoHash].removeListener('download', onPiece);
                prebufMap[engineState.infoHash][current] = true;
            }

            // clear these so garbage collection can take care of it
            player = null;
            current = null;
        }
    }

}

module.exports = prebuffering;
