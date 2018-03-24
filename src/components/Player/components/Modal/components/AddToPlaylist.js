import React from 'react';

import ModalActions from '../actions';

import supported from '../../../../../utils/isSupported';

import {
    dialog
}
from 'remote';

import {
    clipboard
} from 'electron';

export
default React.createClass({

    getInitialState() {
        return {
        }
    },
    
    componentDidMount() {
        this.refs.dialog.open();
    },
    
    componentDidUpdate() {
        this.refs.dialog.open();
    },
    
    update() {
    },
    
    componentWillMount() {
        this.update();
    },
    
    addFromURL() {
        window.playerDrop({ preventDefault: () => {}, dataTransfer: { files: [], getData: function() { return clipboard.readText('text/plain') } } })
        ModalActions.close()
    },
    
    addFromFile() {

        var filters = [{
            name: 'All Supported',
            extensions: supported.ext['torrent'].concat(supported.ext['video']).concat(supported.ext['audio']).map( el => { return el.substr(1).toUpperCase() })
        }, {
            name: 'Torrents',
            extensions: supported.ext['torrent'].map( el => { return el.substr(1).toUpperCase() })
        }, {
            name: 'Videos',
            extensions: supported.ext['video'].map( el => { return el.substr(1).toUpperCase() })
        }, {
            name: 'Audio',
            extensions: supported.ext['audio'].map( el => { return el.substr(1).toUpperCase() })
        }]

        dialog.showOpenDialog({
            title: 'Select file',
            properties: ['openFile', 'createDirectory', 'multiSelections'],
            filters: filters
        }, (filename) => {
            if (filename && filename.length) {
                var files = []
                filename.forEach((el) => {
                    files.push({
                        path: el,
                        name: el.replace(/^.*[\\\/]/, '')
                    })
                })
    
                window.playerDrop({ dataTransfer: { files: files }, preventDefault: () => {} })
                
                ModalActions.close()
            }
        })
    },

    render() {
        return (
            <paper-dialog
                ref="dialog"
                style={{width: '300px', textAlign: 'left', borderRadius: '3px', maxWidth: '90%', backgroundColor: '#303030', padding: '20px', paddingBottom: '32px', overflowX: 'auto'}}
                opened={false}
                className="trakt-info-dialog"
                with-backdrop >
                
                <paper-button
                    raised
                    onClick={this.addFromURL}
                    style={{ display: 'block', marginBottom: '10px', marginRight: '0', width: '100%' }}
                    className='playerButtons-primary' >
                Add URL From Clipboard
                </paper-button>

                <paper-button
                    raised
                    onClick={this.addFromFile}
                    style={{ display: 'block', marginBottom: '10px', marginRight: '0', width: '100%' }}
                    className='playerButtons-primary' >
                Add From File
                </paper-button>
                
                <paper-button
                    raised
                    onClick={ModalActions.close}
                    style={{ display: 'block', marginBottom: '10px', marginRight: '0', width: '100%' }}
                    className='playerButtons-primary' >
                Close
                </paper-button>
                
            </paper-dialog>
        );
    }
});