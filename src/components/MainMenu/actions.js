const dialog = require('remote').require('dialog');

import alt from '../../alt';

import ModalActions from './../Modal/actions';
import PlayerActions from './../Player/actions';
import TorrentActions from '../../actions/torrentActions';

import sorter from './../Player/utils/sort';
import parser from './../Player/utils/parser';

import _ from 'lodash';

class MainMenuActions {

    openURL(paste = false) { // for pasting later 

        if (typeof paste !== 'string')
            ModalActions.open({
                title: 'Add URL',
                type: 'URLAdd'
            });

    }

    openLocal(type) {
        var filters;

        switch (type) {
            case 'torrent':
                filters = [{
                    name: 'Torrents',
                    extensions: ['TORRENT', 'MAGNET']
                }]
                break;
            case 'video':
                filters = [{
                    name: 'Videos',
                    extensions: ['MP4', 'MKV', 'MOV', 'AVI', 'WMV', 'WMA', 'ASF', '3GP', 'OGM', 'OGG', 'WAV', 'Real']
                }]
                break;
        }

        dialog.showOpenDialog({
            title: 'Select file',
            properties: ['openFile', 'createDirectory', 'multiSelections'],
            filters: filters
        }, (filename) => {
            if (filename && filename.length) {
                
                if (filters[0].name == 'Videos') {
                
                    if (parser(filename[0]).shortSzEp()) {
                        filename = sorter.episodes(filename, 1);
                    } else {
                        filename = sorter.naturalSort(filename, 1);
                    }
                    
                    var newFiles = [];
                    var queueParser = [];
                    
                    filename.forEach( (file, ij) => {
                        newFiles.push({
                            title: parser(file).name(),
                            uri: 'file:///'+file,
                            path: file
                        });
                        queueParser.push({
                            idx: ij,
                            url: 'file:///'+file,
                            filename: file.replace(/^.*[\\\/]/, '')
                        });
                    });

                    PlayerActions.addPlaylist(newFiles);
                    
                    // start searching for thumbnails after 1 second
                    _.delay(() => {
                        queueParser.forEach( el => {
                            PlayerActions.parseURL(el);
                        });
                    },1000);
                    
                } else if (filters[0].name == 'Torrents') {

                    ModalActions.open({
                        type: 'thinking'
                    });

                    TorrentActions.addTorrent(filename[0]);

                }
            }
        });

    }
}

export
default alt.createActions(MainMenuActions);