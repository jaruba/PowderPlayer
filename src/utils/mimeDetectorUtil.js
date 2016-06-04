import Promise from 'bluebird';
import path from 'path';
import mime from 'mime';
import request from 'request';
import nodeURL from 'url';
import _ from 'lodash';
import supported from './isSupported';

export
default {
    parseURL(url) {
            return new Promise((resolve, reject) => {
                this.getHeaders(url).then(headers => {
                    switch (headers.category) {
                        case 'direct':
                            resolve(headers); //its streamable -- send to player direct
                            break;
                        case 'magnet':
                        case 'torrent':
                            resolve({
                                category: 'torrent'
                            });
                            break;
                        case 'other':
                            // validate as correct anyway, we might still be able to play it
                            headers.category = 'direct';
                            resolve(headers);
                            break;
                        default:
                            if (headers.type.parsed === 'torrent')
                                return resolve({
                                    category: 'torrent'
                                });

                            resolve({
                                category: 'error'
                            });
                            break;
                    }
                }).catch((error) => {
                    resolve({
                        category: 'error'
                    });
                })
            });
        },
        getHeaders(url) {

            if (nodeURL.parse(url).protocol === 'magnet:')
                var magnet = true;

            return new Promise((resolve, reject) => {
                if (magnet) {
                    return resolve({
                        category: 'magnet'
                    });
                }
                request
                    .get(url)
                    .on('response', (response) => {
                        var type = mime.extension(response.headers['content-type']);
                        if (type && type == 'torrent') {
                            return resolve({
                                category: 'torrent'
                            });
                        }
                        resolve({
                            status: response.statusCode,
                            url: url,
                            title: path.basename(nodeURL.parse(url).pathname),
                            category: (supported.is('.' + type, 'allMedia') ? 'direct' : 'other'),
                            type: {
                                raw: response.headers['content-type'],
                                parsed: type
                            }
                        });
                    })
                    .on('error', reject);
            });
        }
};