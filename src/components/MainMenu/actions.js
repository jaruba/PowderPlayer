import {
    dialog
}
from 'remote';
import alt from '../../alt'
import path from 'path'
import ModalActions from './../Modal/actions';
import PlayerActions from './../Player/actions';

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
            properties: ['openFile', 'createDirectory'],
            filters: filters
        }, (filename) => {
            if (filename && filename.length) {
                PlayerActions.open({
                    uri: 'file:///'+filename[0],
                    title: path.normalize(path.basename(filename[0]))
                });
                console.log(filename)
            }
        });

    }
}

export
default alt.createActions(MainMenuActions);