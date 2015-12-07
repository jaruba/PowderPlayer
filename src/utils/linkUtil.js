import MimeUtil from './mimeDetectorUtil';
import PlayerActions from './../components/Player/actions';
import LinkSupport from './../components/Player/utils/supportedLinks';
import ModalActions from './../components/Modal/actions';
import torrentActions from './../actions/torrentActions';
import _ from 'lodash';

module.exports = (inputvalue, cb) => {

    if (inputvalue.length > 0) {

        if (inputvalue.indexOf('://') == -1 && inputvalue.indexOf(':?') == -1 && inputvalue.indexOf('http') != 0) {
            inputvalue = 'http://'+inputvalue;
        }

        MimeUtil.parseURL(inputvalue).then((parsed) => {
            switch (parsed.category) {
                case 'torrent':
                    torrentActions.addTorrent(inputvalue);
                    break;
                case 'direct':
                    ModalActions.close();
                    if (parsed.type.parsed == 'html') {
                        LinkSupport.handleURL(parsed, function(newFiles, queueParser) {

                            if (newFiles.length) {
                                PlayerActions.addPlaylist(newFiles);

                                // start searching for thumbnails after 1 second
                                _.delay(() => {
                                    queueParser.forEach( el => {
                                        PlayerActions.parseURL(el);
                                    });
                                },1000);
                            } else {
                                // add the direct link anyway, maybe vlc will do some magic
                                PlayerActions.addPlaylist([{
                                    uri: parsed.url
                                }]);
                            }
                        });
                    } else {
                        // it's not html, maybe it's some protocol vlc can handle
                        PlayerActions.addPlaylist([{
                            uri: parsed.url
                        }]);
                    }
                    break;
                case 'error':
                    cb('Error: Invalid URL');
                    break;
            }
        })
    } else {
        cb('Error: No URL Given');
    }

}
