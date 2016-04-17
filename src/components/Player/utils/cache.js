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
            if (player.wcjs.playlist.currentItem == -1) return;
            var current = player.wcjs.playlist.currentItem;

            if (!player.itemDesc(current)) return
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

                if (!bank[targetPos]) targetPos--;

                var last = fileOffset + fileLength;

                if (targetPos > last) targetPos = last;

                if (bank[targetPos]) {
                    for (var jhk = targetPos; bank[jhk] && jhk <= last; jhk++) { }
                    jhk--;
                    if (typeof jhk !== 'undefined' && jhk <= last) {
                        if (jhk == last) {
                            var cachePos = 1;
                        } else {
                            playingPart = jhk;
                            var cachePos = (jhk - fileOffset) / fileLength;
                        }
                        _.defer(() => {
                            ProgressActions.setCache(cachePos);
                        });
                    }
                }
            }
        }
    }
}

module.exports = cacher;
