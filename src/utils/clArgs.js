import ModalActions from '../components/Modal/actions';
import PlayerActions from '../components/Player/actions';
import parser from '../components/Player/utils/parser';
import sorter from '../components/Player/utils/sort';
import metaParser from '../components/Player/utils/metaParser';
import linkUtil from './linkUtil';
import _ from 'lodash';
import url from 'url';
import path from 'path';

module.exports = {
    process: (args) => {
        if (args.length) {
//            console.log(args);
            var files = [];
            args.forEach( el => {
                if (el.startsWith('--')) {
                    // command line args
                    
                } else {
                    if (path.isAbsolute(el)) {
                        // local file
                        files.push({
                            name: parser(el).filename(),
                            path: el
                        });
                    } else if (url.parse(el).protocol) {
                        // url
                        ModalActions.open({
                            title: 'Thinking',
                            type: 'thinking'
                        });
        
                        linkUtil( el, error => {
                            ModalActions.thinking(false);
                            MessageActions.open(error);
                        });
                    }
                }
            });
            
            if (files.length) {
                // if local files wore found, load them

                var newFiles = [];
                var queueParser = [];
                
                if (parser(files[0].name).shortSzEp())
                    files = sorter.episodes(files, 2);
                else
                    files = sorter.naturalSort(files, 2);

                files.forEach( (file, ij) => {
                    newFiles.push({
                        title: parser(file.name).name(),
                        uri: 'file:///'+file.path,
                        path: file.path
                    });
                    queueParser.push({
                        idx: ij,
                        url: 'file:///'+file.path,
                        filename: file.name
                    });
                });

                PlayerActions.addPlaylist(newFiles);

                // start searching for thumbnails after 1 second
                _.delay(() => {
                    queueParser.forEach( el => {
                        metaParser.push(el);
                    });
                },1000);

            }
        }
    }
}