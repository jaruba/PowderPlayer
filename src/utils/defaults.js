import _ from 'lodash';
import ls from 'local-storage';

var map = {
    torrentContent: false,
    resizeOnPlaylist: true,
    ytdlQuality: 2,
    renderFreq: 500,
    renderHidden: true,
    subEncoding: 'auto',
    peerPort: 6881,
    maxPeers: 200,
    bufferSize: 7000,
    removeLogic: 0,
    downloadType: 0,
    playerType: false,
    adultContent: false,
    torrentWarning: 1,
    casting: {},
    extPlayers: [],
    dlnaFinder: 0,
    history: [],
    historyLimit: 20,
    speedLimit: 0,
    downloadAll: false,
    forceDownload: false,
    peerID: 'PP0110',
    subLimits: ['best', 'all', 3, 4 ,5],
    subLimit: 0
}

module.exports = () => {
    _.forEach(map, (el, ij) => {
        if (!ls.isSet(ij)) ls(ij, el);
    });
}
