import peerflix from 'peerflix';
import path from 'path';
import {
    app
}
from 'remote';
import readTorrent from 'read-torrent';
import Promise from 'bluebird';
import getPort from 'get-port';
import _ from 'lodash';
import torrentActions from '../../actions/torrentActions';

import sorter from '../../components/Player/utils/sort';
import parser from '../../components/Player/utils/parser';


const temp = path.join(app.getPath('temp'), 'Powder-Player');

const supported = {
    all: [".mkv", ".avi", ".mp4", ".mpg", ".mpeg", ".webm", ".flv", ".ogg", ".ogv", ".mov", ".wmv", ".3gp", ".3g2", ".m4a", ".mp3", ".flac"],
    video: ["mkv", "avi", "mp4", "mpg", "mpeg", "webm", "flv", "ogg", "ogv", "mov", "wmv", "3gp", "3g2"],
    audio: ["m4a", "mp3", "flac"]
};

module.exports = {
    init(torrent) {
        return new Promise((resolve, reject) => {
            Promise.all([this.read(torrent), getPort()])
                .spread((torrentInfo, port) => {
                    var engine = peerflix(torrentInfo, {
                        tracker: true,
                        port: port,
                        tmp: temp,
                        buffer: (1.5 * 1024 * 1024).toString()
                    })
                    engine['stream-port'] = port;
                    resolve(engine);
                    engine = null;
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
    getContents(files, infoHash) {
        return new Promise((resolve) => {

            var seen = new Set();
            var directorys = [];
            var files_total = files.length;
            var files_organized = {};
            var files_firstName;

            for (var fileID in files) {
                var file = files[fileID];
                if (!files_firstName)
                    files_firstName = file.name;

                files[fileID].fileID = fileID;
            }

            if (files_total > 1) {
                if (parser(files_firstName).shortSzEp()) {
                    files = sorter.episodes(files, 2);
                } else {
                    files = sorter.naturalSort(files, 2);
                }
            }

            for (var fileID in files) {
                var file = files[fileID];
                var fileParams = path.parse(file.path);
                var streamable = (supported.all.indexOf(fileParams.ext) > -1);

                if (streamable) {
                    if (!files_organized.ordered)
                        files_organized.ordered = [];

                    files_organized.ordered.push({
                        size: file.length,
                        id: file.fileID,
                        name: file.name,
                        streamable: true,
                        infoHash: infoHash
                    });
                    directorys.push(fileParams.dir);
                }
            }

            directorys = directorys.filter(function(dir) {
                return !seen.has(dir) && seen.add(dir);
            });
            files_organized['folder_status'] = (directorys.length > 1);
            files_organized['files_total'] = files_total;
            resolve(files_organized);
        })
    }
};