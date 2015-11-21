import Promise from 'bluebird';
import path from 'path';
import mime from 'mime';
import request from 'request';
import nodeURL from 'url';
import MetaInspector from 'node-metainspector';
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
                    if (headers.catagory === 'direct')
                        return resolve(headers); //its streamable -- send to player direct

                    if (headers.status === 200) {


                        if (headers.type.parsed === 'html') {


                        } else {

                        }

                    } else {
                        resolve({
                            catagory: 'error'
                        });
                    }
                }).catch((error) => {
                    resolve({
                        catagory: 'error'
                    });
                })
        });
    },
    getHeaders(url) {
        var headers = {};
        return new Promise((resolve, reject) => {
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
    },
    getWebTitle(url) {
        console.log(url);

        var client = new MetaInspector(url, {
            timeout: 3000
        });
        return new Promise((resolve, reject) => {

            client.on("fetch", function() {
                console.log("Description: " + client.description);

                console.log("Links: " + client.links.join(","));
            });

            client.on("error", function(err) {
                console.log(error);
            });

            client.fetch();
        });


    }
};