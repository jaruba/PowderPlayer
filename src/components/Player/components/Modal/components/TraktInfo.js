import React from 'react';
import {
    shell
} from 'electron';

import ModalActions from '../actions';

import PlayerStore from '../../../store';

import traktUtil from '../../../utils/trakt';
import player from '../../../utils/player';

import MetaInspector from 'node-metainspector';

import {
    BrowserWindow
} from 'remote';


export
default React.createClass({

    getInitialState() {
        var itemDesc = player.itemDesc();
        return {
            parsedTitle: '',
            parsedRating: '',
            trakt: itemDesc.setting.trakt,
            parsed: itemDesc.setting.parsed,
            image: itemDesc.setting.image
        }
    },
    
    componentDidMount() {
        this.refs.dialog.open();
    },
    
    componentDidUpdate() {
        this.refs.dialog.open();
    },
    
    update() {
        var setting = player.itemDesc().setting;
        this.setState({
            parsedTitle: setting.parsed.name.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()})+(setting.trakt.season ? "\u00a0\u00a0-\u00a0\u00a0S"+('0' + setting.trakt.season).slice(-2) + ' E' + ('0' + setting.trakt.number).slice(-2) : setting.trakt.year ? '\u00a0\u00a0-\u00a0\u00a0'+setting.trakt.year : ''),
            parsedRating: (Math.round(setting.trakt.rating * 100) / 100)+' / 10 (' + setting.trakt.votes + ')',
            trakt: setting.trakt,
            parsed: setting.parsed,
            image: setting.image
        });
    },
    
    componentWillMount() {
        this.update();
    },

    handleCodeAdd() {
        var inputvalue = this.refs.codeInput.value;
        if (inputvalue.length) {
            ModalActions.close();
            try {
                traktUtil.exchangePin(inputvalue);
                player.notifier.info('Login Successful');
            } catch(e) {
                player.notifier.info('Error: '+e.message);
            }
        } else {
            this.refs['codeInput'].focus();
            player.notifier.info('Error: Trakt Code is Required');
        }
    },
    getCode(event) {
        traktUtil.openTraktAuth();
    },
    openImdb(event) {
        shell.openExternal('http://www.imdb.com/title/'+this.state.parsed.imdb+'/');
        ModalActions.close();
    },
    openTrailer(event) {
//        ModalActions.close();

        var client = new MetaInspector('http://m.imdb.com/title/'+this.state.parsed.imdb, { timeout: 5000 });

        var parsed = this.state.parsed;

        client.on("fetch", function(){

//            console.log(client);

            var trailer_url = ('http://m.imdb.com'+client.iframes[0]).replace(/m\.imdb/i, 'www.imdb').replace(/mobile/i, 'embed').replace('autoplay=false','autoplay=true');

//            console.log(trailer_url);
            if (trailer_url == 'http://www.imdb.comundefined') {

                player.notifier.info('Trailer Not Found', '', 4000);

            } else {

                var win = new BrowserWindow({ width: 854, height: 510, show: false, 'standard-window': true, 'auto-hide-menu-bar': true, resizable: false, title: parsed.name.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()})+' Trailer - IMDB', center: true });

                win.on('closed', function() {
                  win = null;
                });

                win.loadUrl(trailer_url);

                win.webContents.on('did-finish-load', () => {
                    win.show();
                    win.focus();
                    if (player.wcjs.playing)
                        player.wcjs.togglePause();
                });
                
            }
            
        });

        client.on("error", function(err){
            player.notifier.info('Trailer Error: '+err, '', 4000);
//            console.log(err);
        });

        client.fetch();
        
    },
    openSearch(event) {
        ModalActions.open({
            title: 'Trakt Search',
            type: 'TraktSearch',
            theme: 'DarkRawTheme'
        });
    },
    render() {
        return (
            <paper-dialog
                ref="dialog"
                style={{width: '900px', textAlign: 'left', borderRadius: '3px', maxWidth: '90%', backgroundColor: '#303030', padding: '20px', overflowX: 'auto'}}
                entry-animation="slide-from-top-animation"
                opened={false}
                className="trakt-info-dialog"
                with-backdrop >
                
                <img className="trakt-info-img" src={this.state.image} style={{float: 'left', maxWidth: '52%', padding: '0', margin: '0'}} />

                <div className={'trakt-info-desc' + (!this.state.image ? ' trakt-long-desc' : '')} style={{ fontSize: '15px', color: 'white', float: 'left', display: 'inline-block', padding: '0', margin: '0', marginLeft: '3%', maxWidth: '45%' }}>
                  <div style={{ marginBottom: '7px' }}>{this.state.parsedTitle}</div>
                  <div style={{ marginBottom: '7px' }}>{this.state.parsedRating}</div>
                  <div style={{ marginBottom: '7px', display: this.state.trakt.season ? 'block' : 'none' }}>{this.state.trakt.title}</div>
                  <div style={{ marginBottom: '7px', textAlign: 'justify', display: this.state.trakt.overview ? 'block' : 'none' }}>{this.state.trakt.overview}</div>
                  <div style={{ display: true ? 'none' : this.state.parsed.tag.length ? 'block' : 'none' }}>{this.state.parsed.tag.join(', ')}</div>
                </div>

                <div style={{clear:'both', height: '10px'}} />
                
                <paper-button
                    raised
                    onClick={this.openImdb}
                    style={{ marginBottom: '0', display: this.state.parsed.imdb ? 'block' : 'none' }}
                    className='playerButtons' >
                IMDB
                </paper-button>
                
                <paper-button
                    raised
                    onClick={this.openTrailer}
                    style={{ marginBottom: '0', display: this.state.parsed.imdb ? 'block' : 'none' }}
                    className='playerButtons' >
                Trailer
                </paper-button>
                
                <paper-button
                    raised
                    onClick={ModalActions.close}
                    style={{ marginBottom: '0', marginRight: '0', float: 'right' }}
                    className='playerButtons-primary' >
                Back
                </paper-button>
                
                <paper-button
                    raised
                    onClick={this.openSearch}
                    style={{ marginBottom: '0', float: 'right' }}
                    className='playerButtons trakt-not-correct' >
                Not Correct?
                </paper-button>
                
            </paper-dialog>
        );
    }
});