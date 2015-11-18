import peerflix from 'peerflix';
import path from 'path';
import remote from 'remote';
import readTorrent from 'read-torrent';
import Promise from 'bluebird';
import getPort from 'get-port';
import _ from 'lodash';
import torrentActions from '../../actions/torrentActions';



let temp = path.join(remote.require('app').getPath('temp'), 'Powder-Player');


module.exports = {
    init(torrent) {
        return new Promise((resolve, reject) => {
            Promise.all([this.read(torrent), getPort()])
                .spread((torrentInfo, port) => {
                    resolve(peerflix(torrentInfo, {
                        tracker: true,
                        port: port,
                        tmp: temp,
                        buffer: (1.5 * 1024 * 1024).toString()
                    }));
                })
                .catch(reject);
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
    read(torrent) {
        return new Promise((resolve, reject) => {
            readTorrent(torrent, (err, parsedTorrent) => {
                return (err || !parsedTorrent) ? reject(err) : resolve(parsedTorrent);
            });
        });
    },
    getFileIndex(infoHash, files) {
        console.log(infoHash, files)





        return new Promise((resolve, reject) => {});
    }
};