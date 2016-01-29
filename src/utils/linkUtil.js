import MimeUtil from './mimeDetectorUtil';
import PlayerActions from './../components/Player/actions';
import LinkSupport from './../components/Player/utils/supportedLinks';
import metaParser from './../components/Player/utils/metaParser';
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
                .then(parsed => {
                    switch (parsed.category) {
                        case 'torrent':
                            torrentActions.addTorrent(inputvalue);
                            break;
                        case 'direct':
                            ModalActions.close();
                            var Linky = new LinkSupport;
                            if (parsed.type.parsed == 'html') {
                                Linky.handleURL(parsed).then(resolvedLink => {
                                    var newFiles = resolvedLink[0];
                                    var queueParser = resolvedLink[1];
                                    if (newFiles.length) {
                                        PlayerActions.addPlaylist(newFiles);

                                        // start searching for thumbnails after 1 second
                                        _.delay(() => queueParser.forEach(el => {
                                            metaParser.push(el);
                                        }), 1000);
                                    } else {
                                        // add the direct link anyway, maybe vlc will do some magic
                                        PlayerActions.addPlaylist([parsed.url]);
                                         resolve(parsed.url);
                                    }
                                });
                            } else {
                                // it's not html, maybe it's some protocol vlc can handle
                                PlayerActions.addPlaylist([parsed.url]);
                                resolve(parsed.url);
                            }
                            break;
                        case 'error':
                            reject(new Error('Error: Invalid URL'));
                            break;
                    }
                })
        } else {
            reject(new Error('Error: No URL Given'));
        }
    });
}