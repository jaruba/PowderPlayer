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
                this.streams[torrentInfo.infoHash] = peerflix(torrentInfo, {
                    tracker: true,
                    port: port,
                    tmp: App.settings.tmpLocation,
                    buffer: (1.5 * 1024 * 1024).toString(),
                    index: 1 //change this to a dynamic index later 
                });
            })
            .catch((error) => {
                console.log(error);
            });
    },
    preload: function(torrent) {

    },
    getIndex: function(files) {
        return new Promise((resolve, reject) => {

        });
    },
    destroy: function(infoHash) {
        if (this.streams[infoHash]) {
            if (this.streams[infoHash].server._handle) {
                this.streams[infoHash].server.close();
            }
            this.streams[infoHash].destroy();
        }
    },
    parse: function(torrent) {
        return new Promise((resolve, reject) => {
            readTorrent(torrent, (err, torrent) => {
                return (err) ? reject(err) : resolve(torrent);
            });
        });
    },
};