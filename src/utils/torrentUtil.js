import peerflix from 'peerflix';
import path from 'path';
import readTorrent from 'read-torrent';
import Promise from 'bluebird';
import getPort from 'get-port';


export
default {
    streams: [],

    init: function(torrent) {
        Promise.all([this.parse(torrent), getPort()])
            .spread((torrentInfo, port) => {

            })
            .catch((error) => {
                console.log(error);
            });
    },
    preload: function(torrent) {

    },
    parse: function(torrent) {
        return new Promise((resolve, reject) => {
            readTorrent(torrent, (err, torrent) => {
                return (err) ? reject(err) : resolve(torrent);
            });
        });
    },
}

};