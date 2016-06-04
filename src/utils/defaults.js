import _ from 'lodash';
import ls from 'local-storage';

var map = {
    torrentContent: true,
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
    myFilmonPlugins: []
}

module.exports = () => {
    _.forEach(map, (el, ij) => {
        if (!ls.isSet(ij)) ls(ij, el);
    });
}
