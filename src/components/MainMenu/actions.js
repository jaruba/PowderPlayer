import {
    dialog
}
from 'remote';
import alt from '../../alt'
import ModalActions from './../Modal/actions';

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
            console.log(filename)
        });

    }
}

export
default alt.createActions(MainMenuActions);