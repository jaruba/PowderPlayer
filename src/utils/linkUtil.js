import MimeUtil from './mimeDetectorUtil';
import PlayerActions from './../components/Player/actions';
import LinkSupport from './../components/Player/utils/supportedLinks';
import ModalActions from './../components/Modal/actions';
import torrentActions from './../actions/torrentActions';
import Promise from 'bluebird';
import _ from 'lodash';

module.exports = (inputvalue, cb) => {
    return new Promise((resolve, reject) => {
        if (inputvalue.length > 0) {

            if (inputvalue.indexOf('://') == -1 && inputvalue.indexOf(':?') == -1 && inputvalue.indexOf('http') != 0) {
                inputvalue = 'http://' + inputvalue;
            }

            MimeUtil.parseURL(inputvalue)
                .then((parsed) => {
                    switch (parsed.category) {
                        case 'torrent':
                            torrentActions.addTorrent(inputvalue);
                            break;
                        case 'direct':
                            ModalActions.close();
                            if (parsed.type.parsed == 'html') {
                                LinkSupport.handleURL(parsed, (newFiles, queueParser) => {

                                    if (newFiles.length) {
                                        PlayerActions.addPlaylist(newFiles);

                                        // start searching for thumbnails after 1 second
                                        _.delay(() => queueParser.forEach(el => {
                                            PlayerActions.parseURL(el);
                                        }), 1000);
                                    } else {
                                        // add the direct link anyway, maybe vlc will do some magic
                                        resolve(parsed.url);
                                    }
                                });
                            } else {
                                // it's not html, maybe it's some protocol vlc can handle
                                resolve(parsed.url);
                            }
                            break;
                        case 'error':
                            reject('Error: Invalid URL');
                            break;
                    }
                })
        } else {
            reject('Error: No URL Given');
        }
    });
}