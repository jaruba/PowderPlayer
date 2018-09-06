import React from 'react';
import _ from 'lodash';
import {
    History
}
from 'react-router';

import ModalActions from '../actions';
import ModalStore from '../store';
import EngineStore from '../../../stores/engineStore';
import TorrentActions from '../../../actions/torrentActions'
import PlayerActions from '../../Player/actions';
import player from '../../Player/utils/player';
import parser from '../../Player/utils/parser';
import metaParser from '../../Player/utils/metaParser';
import MessageActions from '../../Message/actions';

import linkUtil from '../../../utils/linkUtil';

var finishedScan = false;
var hrefFor = {};

export
default React.createClass({

    mixins: [History],

    getInitialState() {
        return {
            parseLink: ModalStore.getState().parseLink,
            allFiles: {}
        };
    },
    
    componentDidMount() {
        this.refs['dialog'].open();
    },

    componentDidUpdate() {
        this.refs['dialog'].open();
    },

    componentWillMount() {
        ModalStore.listen(this.update);
        
finishedScan = false;
var allFiles = {};

var parseLink = ModalStore.getState().parseLink;

var invalidChars = ['\\', '/', ':', '*', '?', '&', '%', "#", "@", "!", "^", "(", ")", "[", "]", "{", "}", ";", '"', '<', '>', '|', '.', "'" , "=", "+"];

var exceptions = [];


function dbName(str) {
    for (var i = 0; invalidChars[i]; i++) str = str.split(invalidChars[i]).join('');
    return str;
}

function toTitleCase(str) {
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

var isLocked = require('lockfile').checkSync(require("path").join(require("os").tmpdir(), dbName(parseLink)));
if (isLocked) {
    var newDbName = new Date().getTime();
    newDbName = newDbName.toString();
} else {
    var newDbName = dbName(parseLink);
}

//var multipass = require('multipass-torrent/cli/multipass');

multipass.init({
    dbPath: require("path").join(require("os").tmpdir(), newDbName),
    replicate: false,
    minSeedImportant: 5
});

multipass.processing(true);

multipass.on("linkError", function(errorLink) {
    if (parseLink == errorLink) {
        console.log('parse error');
        console.log(errorLink);
    }
});

multipass.on("starterInfo", function(starterSource,starterTorrent) {
    if (starterTorrent && starterSource == parseLink) {

        if (starterTorrent.infoHash) var hash = starterTorrent.infoHash;
        else if (starterTorrent.hash) var hash = starterTorrent.hash;

        hrefFor[starterTorrent.infoHash] = starterTorrent.href;

        if (starterTorrent.title) {
            
            multipass.nameParser(starterTorrent.title.replace(':','')+'.avi',function(err,data) {
                if (err) {
                    console.log('error parsing title');
                } else {
                    var trueTitle;
                    var segments = starterTorrent.title.replace(':','').split('  ').join(' ').split(/\.| |_/);
                    if (data.name) {
                        var titleParts = data.name.split(/\.| |_/);
                    }
                    
                    var cleaner = function(clean) {
                        return clean.split('(').join('').split(')').join('').split('[').join('').split(']').join('').toLowerCase();
                    }
                    
                    var getEnder = function(segments, name, year) {
                        var finisher = [];
                        var titleParts = name.split(/\.| |_/);
                        var founder = false;
                        
                        if (year)
                            titleParts.push('' + year);
                        
                        segments.forEach( (el, ij) => {
                            if (titleParts.indexOf(cleaner(el)) == -1) founder = true;
                            if (founder) finisher.push(el);
                        });
                        
                        return founder ? finisher.join(' ') : false;
                    }
                    
                    data.partialName = getEnder(segments, data.name, data.year);
                    
                    if (data.name && data.year) {
                        if (data.name.substr(data.name.indexOf(data.year.toString())) == data.year.toString()) {
                            trueTitle = toTitleCase(data.name).replace(data.year.toString(),'('+data.year+')');
                        } else {
                            trueTitle = toTitleCase(data.name)+' ('+data.year+')';
                        }
                    } else if (data.name) {
                        trueTitle = toTitleCase(data.name);
                    }
                    data.trueTitle = trueTitle;

                    var cleanTorrent = {
                        fileName: data.partialName,
                        infoHash: hash,
                        href: hrefFor[hash] ? hrefFor[hash] : torrent.torrentLink
                    };
                    
                    if (tempState[trueTitle] && tempState[trueTitle].length) {
                        tempState[trueTitle].push(cleanTorrent);
                    } else
                        tempState[trueTitle] = [cleanTorrent];

                    allFiles = tempState;
                    _.delay(() => {
                        that.setState({ allFiles: tempState });
                    });
                    _.delay(() => {
                        var torrentSel = Polymer.dom().querySelector('#torrentSelDialog');
                        torrentSel && torrentSel.center();
                    });
                }
            });

        }
    
        if (exceptions.indexOf(hash.toLowerCase()) == -1) exceptions.push(hash.toLowerCase());
        
    }
    
//    injectInfo(starterSource,starterTorrent);
});

multipass.on("minimalInfo", function(source, torrent) {
    console.log('minimal info');
    console.log(torrent);
});

var tempState = {};
var that = this;

multipass.on("found", function(source, torrent) {
    console.log('found info');
    console.log(torrent);
    torrent.title = torrent.title ? torrent.title : torrent.name;
    if (torrent.title) {
        multipass.nameParser(torrent.title.replace(':','')+'.avi',function(err,data) {
            if (err) {
                trueTitle = torrent.title;
                var hash = torrent.infoHash ? torrent.infoHash : torrent.hash;
                if (!torrent.seeds && torrent.popularity) {
                    torrent.seeds = 0;
                    torrent.leechs = 0;
                    _.forEach(torrent.popularity, el => {
                        if (el[0]) torrent.seeds += el[0];
                        if (el[1]) torrent.leechs += el[1];
                    });
                }
                if (!torrent.size && torrent.length) torrent.size = torrent.length;
                var cleanTorrent = {
                    fileName: torrent.title,
                    infoHash: hash,
                    seeds: torrent.seeds,
                    leechs: torrent.leechs,
                    size: torrent.size,
                    href: hrefFor[hash] ? hrefFor[hash] : torrent.torrentLink ? torrent.torrentLink : 'magnet:?xt=urn:btih:' + hash
                };
                
                if (hrefFor[hash] && tempState[trueTitle] && tempState[trueTitle].length) {
                    tempState[trueTitle].some( (el, ij) => {
                        if (el.infoHash == hash) {
                            tempState[trueTitle][ij] = cleanTorrent;
                            return true;
                        } else return false;
                    });
                } else {
                    if (tempState[trueTitle] && tempState[trueTitle].length) {
                        tempState[trueTitle].push(cleanTorrent);
                    } else
                        tempState[trueTitle] = [cleanTorrent];
                }
                allFiles = tempState;
                _.delay(() => {
                    that.setState({ allFiles: tempState });
                });
                _.delay(() => {
                    var torrentSel = Polymer.dom().querySelector('#torrentSelDialog');
                    torrentSel && torrentSel.center();
                });
                console.log('error parsing title');
            } else {
                var trueTitle;
                var segments = torrent.title.replace(':','').split('  ').join(' ').split(/\.| |_/);
                if (data.name) {
                    var titleParts = data.name.split(/\.| |_/);
                }
                
                var cleaner = function(clean) {
                    return clean.split('(').join('').split(')').join('').split('[').join('').split(']').join('').toLowerCase();
                }
                
                var getEnder = function(segments, name, year) {
                    var finisher = [];
                    var titleParts = name.split(/\.| |_/);
                    var founder = false;
                    
                    if (year)
                        titleParts.push('' + year);
                    
                    segments.forEach( function(el, ij) {
                        if (titleParts.indexOf(cleaner(el)) == -1) founder = true;
                        if (founder) finisher.push(el);
                    });
                    
                    return founder ? finisher.join(' ') : false;
                }
                
                data.partialName = getEnder(segments, data.name, data.year);
                
                if (data.name && data.year) {
                    if (data.name.substr(data.name.indexOf(data.year.toString())) == data.year.toString()) {
                        trueTitle = toTitleCase(data.name).replace(data.year.toString(),'('+data.year+')');
                    } else {
                        trueTitle = toTitleCase(data.name)+' ('+data.year+')';
                    }
                } else if (data.name) {
                    trueTitle = toTitleCase(data.name);
                }
                data.trueTitle = trueTitle;
                torrent.parsedName = data;
                var hash = torrent.infoHash ? torrent.infoHash : torrent.hash;
                if (!torrent.seeds && torrent.popularity) {
                    torrent.seeds = 0;
                    torrent.leechs = 0;
                    _.forEach(torrent.popularity, el => {
                        if (el[0]) torrent.seeds += el[0];
                        if (el[1]) torrent.leechs += el[1];
                    });
                }
                if (!torrent.size && torrent.length) torrent.size = torrent.length;
                var cleanTorrent = {
                    fileName: data.partialName,
                    infoHash: hash,
                    seeds: torrent.seeds,
                    leechs: torrent.leechs,
                    size: torrent.size,
                    href: hrefFor[hash] ? hrefFor[hash] : torrent.torrentLink
                };
                
                if (hrefFor[hash] && tempState[trueTitle] && tempState[trueTitle].length) {
                    tempState[trueTitle].some( (el, ij) => {
                        if (el.infoHash == hash) {
                            tempState[trueTitle][ij] = cleanTorrent;
                            return true;
                        } else return false;
                    });
                } else {
                    if (tempState[trueTitle] && tempState[trueTitle].length) {
                        tempState[trueTitle].push(cleanTorrent);
                    } else
                        tempState[trueTitle] = [cleanTorrent];
                }
                allFiles = tempState;
                _.delay(() => {
                    that.setState({ allFiles: tempState });
                });
                _.delay(() => {
                    var torrentSel = Polymer.dom().querySelector('#torrentSelDialog');
                    torrentSel && torrentSel.center();
                });
            }
        });
    } else {
        console.log('else no title...');
    }
});

multipass.on("buffering",function(source,perc) {
    if (source == parseLink) {
        var progress = that.refs['progress'];
        if (progress)
            progress.value = perc * 100;
        if (perc == 1) {
            setTimeout(function() {
                if (!finishedScan) multipass.emit("finished", source);
            },1000);
            if (progress)
                progress.style.opacity = 0.6;
        }
    }
});

multipass.on("parserFinished",function(source) {
    console.log('parser finished');
});

multipass.on("finished",function(source) {
    finishedScan = true;
    multipass.removeAllListeners();
});

multipass.import(this.state.parseLink);


    },

    componentWillUnmount() {
        ModalStore.unlisten(this.update);
    },

    handelCancel() {
        ModalActions.close();
    },
    
    handleSelectFolder(key) {
        var current = window.document.querySelector('.menu-show');
        if (current) {
            current.className = current.className.replace(' menu-show', '');
            var currentSel = window.document.querySelector('.menu-sel');
            currentSel.className = currentSel.className.replace(' menu-sel', '');
        }

        if (!current || current.className.indexOf('menu-' + key) == -1) {
            var menu = window.document.querySelector('.menu-' + key);
            menu.className += ' menu-show';
            var menuSel = window.document.querySelector('.menu-holder-' + key);
            menuSel.className += ' menu-sel';
        }
        var selDialog = Polymer.dom().querySelector('#torrentSelDialog');
        _.delay(() => {
            selDialog && selDialog.center();
        }, 250);
        _.delay(() => {
            selDialog && selDialog.center();
        }, 500);
    },

    update() {
        if (this.isMounted()) {
            this.setState({
                torrentPlugin: ModalStore.getState().torrentPlugin
            });
        }
    },

    getContent() {
        var incc = 500;
        var content = [];
        _.forEach(this.state.allFiles, (folder, key) => {
            incc++;
            content.push(this.generateFolder(folder, key, incc))
        });
        return content;
    },

    generateFolder(files, name, key) {
        var content = [];

        var inc = 0;

        _.forEach(files, (file) => {
            if (!file.fileName && name) file.fileName = name;
            content.push(this.generateFile(file, inc))
        });

        return (
            <div key={key} style={{ marginTop: '0' }}>
                <paper-icon-item className={'menu-holder-' + key} onClick={this.handleSelectFolder.bind(this, key)} style={{cursor: 'pointer', padding: '11px 15px', display: 'block'}} toggles={false}>
                    <iron-icon icon="icons:folder" item-icon style={{ float: 'left', display: 'block', position: 'relative', bottom: '3px', marginRight: '10px', color: 'rgba(0,0,0,0.7)' }} />
                    {name}
                </paper-icon-item>
    
                <div className={'menu-hide menu-' + key}>
                  {content}
                </div>
            </div>
        );
    },

    handleSelectFile(file) {
        ModalActions.thinking(true);
        var inputvalue = file.href;

        linkUtil(inputvalue).then(url => {
            ModalActions.thinking(false);
        }).catch(error => {
            ModalActions.thinking(false);
            ModalActions.open({
                title: 'Add URL',
                type: 'URLAdd'
            });
            MessageActions.open(error.message);
        });
    },

    generateFile(file, key) {
        return (
            <paper-icon-item key={file.fileName} onClick={this.handleSelectFile.bind(this, file)} style={{cursor: 'pointer', padding: '5px 15px', display: 'block'}} toggles={false}>
            <iron-icon icon="editor:insert-drive-file" item-icon style={{ float: 'left', display: 'block', position: 'relative', bottom: '-8px', marginRight: '10px', marginLeft: '20px', color: 'rgba(0,0,0,0.7)' }} />
            <paper-item-body two-line>
            <div style={{ fontWeight: 'normal', whiteSpace: 'nowrap', textOverflow: 'ellipsis',overflow: 'hidden' }}>{file.fileName ? file.fileName : '-'}</div>
            <div secondary style={{ fontWeight: 'normal', marginLeft: '10px', fontSize: '12px', color: 'gray' }}>{file.seeds ? 'Seeds: ' + file.seeds + ' / ' : ''} { file.leechs ? 'Leechers: ' + file.leechs + ' / ' : '' } { file.size ? 'Size: ' + this.formatBytes(file.size) : '???'}</div>
            </paper-item-body>
            </paper-icon-item>
        );
    },
    formatBytes(bytes, decimals) {
        if (bytes == 0) return '0 Byte';
        var k = 1000;
        var dm = decimals + 1 || 3;
        var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        var i = Math.floor(Math.log(bytes) / Math.log(k));
        return (bytes / Math.pow(k, i)).toPrecision(dm) + ' ' + sizes[i];
    },
    render() {
        let playDisabled = this.state.selectedFile ? false : true;
        let content = this.state.allFiles ? this.getContent() : [];
        return (
            <paper-dialog
                ref="dialog"
                id="torrentSelDialog"
                style={{width: '440px', textAlign: 'left', borderRadius: '3px', overflowX: 'auto'}}
                className="prettyScrollWhite"
                opened={true}
                with-backdrop >

                <div style={{ marginBottom: '10px' }}>

                    <paper-progress ref="progress" value="0" min="0" max="100" className="green-progress" style={{ width: '100%', marginBottom: '14px', transition: 'all 0.5s ease' }} />
    
                    {content.map(function(content_item) {
                        return content_item;
                    })}
    
                    <paper-button
                        raised
                        onClick={this.handelCancel}
                        style={{float: 'right', background: 'rgba(0, 0, 0, 0.1)', color: 'rgba(0, 0, 0, 0.8)', marginRight: '10px', padding: '8px 15px', fontWeight: 'bold', marginTop: '15px', textTransform: 'none', marginBottom: '24px'}}
                        dialog-dismiss>
                    Cancel
                    </paper-button>

                </div>

            </paper-dialog>
        );
    }
});