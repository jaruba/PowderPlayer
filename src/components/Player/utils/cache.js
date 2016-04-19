import _ from 'lodash';
import engineStore from '../../../stores/engineStore';
import ProgressActions from '../components/Controls/components/ProgressBar/actions';

var playingPart = 0;
var targetPos = 0;
var lastTargetPart = 0;
var cacheInterval = false;

var cacher = {
    start: (player) => {
        cacheInterval = setInterval(cacher.checkCache.bind(this, player), 3000);
    },
    stop: () => {
        clearInterval(cacheInterval);
    },
    checkCache: (player, nextPos) => {
        var engineState = engineStore.getState();

        if (engineState.torrents && engineState.infoHash && engineState.torrents[engineState.infoHash] && engineState.torrents[engineState.infoHash].torrent) {
            // we have a running torrent

            if (player.wcjs.playlist.currentItem == -1) return;
            var current = player.wcjs.playlist.currentItem;

            if (!player.itemDesc(current)) return

            // make sure that the currently running playlist item is a file from the torrent
            if (typeof player.itemDesc(current).setting.streamID == 'undefined') return

            var file = engineState.torrents[engineState.infoHash].files[player.itemDesc(current).setting.streamID];
            if (!file) return;

            var pieceInfo = engineState.torrents[engineState.infoHash].torrent.pieces.bank.get();

            if (pieceInfo.downloaded == pieceInfo.total) {
                _.defer(() => {
                    ProgressActions.setCache(1);
                });
            } else {

                // get current position from the progress bar CSS directly
                var playerPos = nextPos ? nextPos : parseFloat(window.document.querySelector('.time').style.width) / 100;

                var pieceLength = engineState.torrents[engineState.infoHash].torrent.pieceLength;
                var fileOffset = Math.floor(file.offset / pieceLength);
                var fileLength = Math.ceil(file.length / pieceLength);

                targetPos = Math.floor((fileLength * playerPos) + fileOffset);

                if (targetPos < playingPart && lastTargetPart < targetPos) {
                    lastTargetPart = targetPos;
                    targetPos = playingPart;
                } else {
                    lastTargetPart = targetPos;
                }

                var bank = pieceInfo.map;

                var last = fileOffset + fileLength; // last piece related to this file

                // we selected this piece based on a percentage so it may still be an inexact piece index
                // a situation in which this can be wrong is when 2-3 files share the same start / end piece
                // this should be thought about more in the future, as it should to be exact
                if (!bank[targetPos] && bank[targetPos-1] && targetPos > 0) targetPos--;
                else if (!bank[targetPos] && bank[targetPos+1] && targetPos < last) targetPos++;

                if (targetPos > last) targetPos = last;

                if (bank[targetPos]) {

                    // find last sequencial piece
                    var lastSeq = targetPos;
                    for (var jhk = targetPos; bank[jhk] && jhk <= last; jhk++) {
                        lastSeq = jhk;
                    }

                    if (lastSeq <= last) {
                        if (lastSeq == last) {
                            var cachePos = 1; // fully downloaded
                        } else {
                            playingPart = lastSeq;
                            var cachePos = (lastSeq - fileOffset) / fileLength;
                        }
                        _.defer(() => {
                            ProgressActions.setCache(cachePos); // print cache bar
                        });
                    }
                }
            }
        }
    }
}

module.exports = cacher;
