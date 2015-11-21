import Promise from 'bluebird';
import path from 'path';
import mime from 'mime';
import request from 'request';
import nodeURL from 'url';
import _ from 'lodash';

const supported = {
    all: [".mkv", ".avi", ".mp4", ".mpg", ".mpeg", ".webm", ".flv", ".ogg", ".ogv", ".mov", ".wmv", ".3gp", ".3g2", ".m4a", ".mp3", ".flac"],
    video: ["mkv", "avi", "mp4", "mpg", "mpeg", "webm", "flv", "ogg", "ogv", "mov", "wmv", "3gp", "3g2"],
    audio: ["m4a", "mp3", "flac"]
};

export
default {
    parseURL(url) {
        return new Promise((resolve, reject) => {
            this.getHeaders(url)
                .then((headers) => {
                    switch (headers.catagory) {
                        case 'direct':
                            resolve(headers); //its streamable -- send to player direct
                            break;
                        case 'magnet':
                            resolve({
                                catagory: 'torrent'
                            });
                            break;
                        default:
                            if (headers.type.parsed === 'torrent')
                                return resolve({
                                    catagory: 'torrent'
                                });

                            resolve({
                                catagory: 'error'
                            });
                            break;
                    }
                }).catch((error) => {
                    resolve({
                        catagory: 'error'
                    });
                })
        });
    },
    getHeaders(url) {
        if (nodeURL.parse(url).protocol === 'magnet:')
            var magnet = true;
        return new Promise((resolve, reject) => {
            if (magnet)
                return resolve({
                    catagory: 'magnet'
                });
            request
                .get(url)
                .on('response', function(response) {
                    var type = mime.extension(response.headers['content-type']);
                    resolve({
                        status: response.statusCode,
                        url: url,
                        title: path.basename(nodeURL.parse(url).pathname),
                        catagory: (supported.all.indexOf('.' + type > -1) ? 'direct' : 'other'),
                        type: {
                            raw: response.headers['content-type'],
                            parsed: type
                        }
                    })
                })
                .on('error', reject);
        });
    }   
};