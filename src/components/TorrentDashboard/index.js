import React from 'react';

import engineStore from '../../stores/engineStore';
import torrentActions from '../../actions/torrentActions';
import ModalActions from '../Modal/actions';
import player from '../Player/utils/player';

import _ from 'lodash';

import utils from '../../utils/util';

function readableSize(fileSizeInBytes) {
    
    if (!fileSizeInBytes) return '0.0 kB';
    
    var i = -1;
    var byteUnits = [' kB', ' MB', ' GB', ' TB', 'PB', 'EB', 'ZB', 'YB'];
    do {
        fileSizeInBytes = fileSizeInBytes / 1024;
        i++;
    } while (fileSizeInBytes > 1024);
    
    return Math.max(fileSizeInBytes, 0.1).toFixed(1) + byteUnits[i];
}

export
default React.createClass({
    getInitialState() {

        var engineState = engineStore.getState();

        return {
            torrents: engineState.torrents,
            infoHash: engineState.infoHash
        };
    },
    componentDidMount() {
        engineStore.listen(this.update);
        this.updateUI();
        _.defer(() => {
            player.events.emit('windowTitleUpdate', engineStore.getState().torrents[engineStore.getState().infoHash].torrent.name);
        });
    },
    componentWillUnmount() {
        engineStore.unlisten(this.update);
        _.defer(() => {
            player.events.emit('windowTitleUpdate', '');
        });
    },
    update() {
        if (this.isMounted()) {
            var engineState = engineStore.getState();

            this.setState({
                torrents: engineState.torrents,
                infoHash: engineState.infoHash
            });
        }
    },
    
    updateUI() {
        if (this.isMounted()) {
            this.update();
            _.delay(this.updateUI, 1000);
        }
    },

    generateTorrent(infoHash) {

    },

    generateFile(file) {

    },
    
    openMenu() {
        ModalActions.open({ type: 'dashboardMenu' });
    },
    
    openFileMenu(index) {
        ModalActions.setIndex(index);
        ModalActions.open({ type: 'dashboardFileMenu' });
    },
    
    decideFileAction(index) {
        var torrent = this.state.torrents[this.state.infoHash];
        var progress = torrent.torrent.pieces.downloaded / torrent.torrent.pieces.length;
        var finished = false;
        var file = torrent.files[index];
        var fileProgress = Math.round(torrent.torrent.pieces.bank.filePercent(file.offset, file.length) * 100);
        if (finished || fileProgress >= 100) {
            finished = true;
        }
        
        if (finished) {
            ModalActions.setIndex(index);
            ModalActions.open({ type: 'dashboardFileMenu' });
        } else {
            if (file.selected) {
                torrent.deselectFile(index);
            } else {
                torrent.selectFile(index);
            }
        }
    },
    
    humanReadableTime(secs) {
        var numhours = Math.floor(((secs % 31536000) % 86400) / 3600);
        var numminutes = Math.floor((((secs % 31536000) % 86400) % 3600) / 60);
        var numseconds = (((secs % 31536000) % 86400) % 3600) % 60;
        return (numhours ? (numhours + 'h ') : '') + (numminutes ? (numminutes + 'm ') : '') + (numseconds ? (numseconds + 's') : '');
    },

    render() {
        var torrent = this.state.torrents[this.state.infoHash];

        if (!torrent)
            return (<div />);

        var fileList = [];
        var backColor = '#3e3e3e';
        var progress = torrent.torrent.pieces.downloaded / torrent.torrent.pieces.length;
        var finished = false;
        if (progress == 1) {
            finished = true;
        }
        torrent.files.forEach( (el, ij) => {
            var fileProgress = Math.round(torrent.torrent.pieces.bank.filePercent(el.offset, el.length) * 100);
            if (backColor == '#444') {
                backColor = '#3e3e3e';
            } else {
                backColor = '#444';
            }
            var fileFinished = false;
            if (finished || fileProgress >= 100) {
                fileProgress = 100;
                fileFinished = true;
            }

            var newFile = (
                <div key={ij} className="dashboardFile" style={{backgroundColor: backColor, width: '100%'}}>
                    <div style={{float: 'right', position: 'relative', right: '12px', top: '12px', zIndex: '1'}}>
                        <paper-fab icon={ fileFinished ? 'menu' : el.selected ? 'av:pause' : 'av:play-arrow' } onClick={this.decideFileAction.bind(this, ij)} className="dashboard-buttons" style={{ backgroundColor: fileFinished ? '#11a34e' : el.selected ? '#e38318' : '#e3b618' }} />
                    </div>
                    <div className="torrentFile" style={{cursor: 'pointer', overflow: 'hidden'}} onClick={this.openFileMenu.bind(this, ij)}>
                        <div style={{float: 'left'}}>
                            <progress-bubble value={fileProgress} max="100" stroke-width="5" style={{width: '60px', height: '60px'}}>
                                <strong style={{fontWeight: 'normal', fontSize: '17px', textShadow: '0px 1px 0px rgba(61, 61, 61, 0.5)'}}>{fileProgress}<span style={{fontSize: '13px'}}>%</span></strong>
                            </progress-bubble>
                        </div>
                        <div style={{position: 'relative', top: '22px', fontSize: '14px'}}>
                            <div style={{color: '#e4e4e4', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', paddingRight: '20px'}}>{el.name}</div>
                            <div style={{marginTop: '5px'}}>Downloaded: {fileFinished ? readableSize(el.length) : readableSize(el.length * torrent.torrent.pieces.bank.filePercent(el.offset, el.length))} / {readableSize(el.length)}</div>
                        </div>
                        <div style={{clear: 'both'}} />
                    </div>
                    <div style={{clear: 'both'}} />
                </div>
            );
            fileList.push(newFile);
        });

        return (
            <div className="wrapper" style={{color: '#a3a4a4', backgroundColor: '#444'}}>
                 <div className="torrentHeader" style={{backgroundColor: '#292c31', fontSize: '14px', paddingTop: '10px', paddingBottom: '10px'}}>
                    <div style={{float: 'left', marginLeft: '15px'}}>
                        <div>
                            <iron-icon icon="swap-horiz" style={{color: '#bcbdbe', marginRight: '8px', width: '18px', height: '18px', position: 'relative', top: '-1px'}}  />
                            Peers: {torrent.swarm.wires && torrent.swarm.wires.length ? torrent.swarm.wires.length : 0}
                        </div>
                        <div style={{marginTop: '3px'}}>
                            <iron-icon icon="image:flash-on" style={{color: '#bcbdbe', marginRight: '8px', width: '16px', height: '16px', position: 'relative', top: '-1px'}} />
                            Speed: {(finished ? readableSize(torrent.swarm.uploadSpeed) : readableSize(torrent.swarm.downloadSpeed)) + '/s'}
                        </div>
                        <div style={{marginTop: '3px'}}>
                            <iron-icon icon="cloud-upload" style={{color: '#bcbdbe', marginRight: '8px', width: '16px', height: '16px', position: 'relative', top: '-1px'}} />
                            Uploaded: {readableSize(torrent.swarm.uploaded)}
                        </div>
                        <div style={{marginTop: '3px'}}>
                            <iron-icon icon="cloud-download" style={{color: '#bcbdbe', marginRight: '8px', width: '16px', height: '16px', position: 'relative', top: '-1px'}} />
                            Downloaded: {finished ? readableSize(torrent.total.length) : readableSize(torrent.swarm.downloaded)} / {readableSize(torrent.total.length)}
                        </div>
                    </div>
                    <div className="rightSide" style={{float: 'right', marginRight: '15px', width: '55%'}}>
                        <div style={{float: 'right', marginTop: '-9px', marginRight: '-9px', marginBottom: '10px'}}>
                            <paper-icon-button style={{color: '#cacaca'}} onClick={this.openMenu} icon="settings" />
                        </div>
                        <div style={{clear: 'both'}} /> 
                        <div style={{textAlign: 'left', marginBottom: '5px', width: 'calc(100% - 44px)', float: 'left', overflow: 'hidden'}}><span style={{display: 'inline-block', borderRadius: '3px', whiteSpace: 'nowrap'}}>{finished ? '' : ('ETA: ' + this.humanReadableTime(Math.round((torrent.total.length - torrent.swarm.downloaded) / torrent.swarm.downloadSpeed)))}</span></div>
                        <div style={{textAlign: 'right', marginBottom: '5px', width: '44px', float: 'right'}}><span style={{display: 'inline-block', borderRadius: '3px', backgroundColor: ''}}>{Math.floor(( torrent.torrent.pieces.downloaded / torrent.torrent.pieces.length ) * 100) + '%'}</span></div>
                        <paper-progress className="torrentProgress" value={(( torrent.torrent.pieces.downloaded / torrent.torrent.pieces.length ) * 100)} max="100" style={{width: '100%'}} />
                    </div>
                    <div style={{clear: 'both'}} />
                </div>
                <div className="torrentFileList">
                    {fileList}
                </div>
            </div>
        );
    }
});