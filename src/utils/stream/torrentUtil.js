import peerflix from 'peerflix';
import path from 'path';
import remote from 'remote';
import readTorrent from 'read-torrent';
import Promise from 'bluebird';
import getPort from 'get-port';
import torrentActions from '../../actions/torrentActions';

let temp = path.join(remote.require('app').getPath('temp'), 'Powder-Player');


module.exports = {
    init(torrent) {
        Promise.all([this.parse(torrent), getPort()])
            .spread((torrentInfo, port) => {
                torrentActions.add(peerflix(torrentInfo, {
                    tracker: true,
                    port: port,
                    tmp: temp,
                    buffer: (1.5 * 1024 * 1024).toString()
                }));
            })
            .catch((error) => {
                console.log(error);
            });
    },
    preload(torrent) {

    },
    getIndex(files) {
        return new Promise((resolve, reject) => {

        });
    },
    destroy(infoHash) {
        if (this.streams[infoHash]) {
            if (this.streams[infoHash].server._handle) {
                this.streams[infoHash].server.close();
            }
            this.streams[infoHash].destroy();
        }
    },
    parse(torrent) {
        return new Promise((resolve, reject) => {
            readTorrent(torrent, (err, torrent) => {
                return (err || !torrent) ? reject(err) : resolve(torrent);
            });
        });
    },
};