import React from 'react';
import {
    TextField, RaisedButton, List, ListItem
}
from 'material-ui';
import shell from 'shell';
import clipboard from 'clipboard';

import ModalActions from '../actions';

import MessageActions from '../../Message/actions';
import PlayerActions from '../../Player/actions';
import PlayerStore from '../../Player/store';

import linkUtil from '../../../utils/linkUtil';
import traktUtil from '../../Player/utils/trakt';

import MetaInspector from 'node-metainspector';

const BrowserWindow = require('remote').require('browser-window');


export
default React.createClass({

    getInitialState() {
        return {
            parsedTitle: '',
            parsedRating: '',
            trakt: PlayerStore.getState().itemDesc().setting.trakt,
            parsed: PlayerStore.getState().itemDesc().setting.parsed,
            image: PlayerStore.getState().itemDesc().setting.image
        }
    },
    
    update() {
        var setting = PlayerStore.getState().itemDesc().setting;
        this.setState({
            parsedTitle: setting.parsed.name.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()})+(setting.trakt.season ? "\u00a0\u00a0-\u00a0\u00a0S"+('0' + setting.trakt.season).slice(-2) + ' E' + ('0' + setting.trakt.number).slice(-2) : setting.trakt.year ? '\u00a0\u00a0-\u00a0\u00a0'+setting.trakt.year : ''),
            parsedRating: (Math.round(setting.trakt.rating * 100) / 100)+' / 10 ('+setting.trakt.votes+')',
            trakt: setting.trakt,
            parsed: setting.parsed,
            image: setting.image
        });
    },
    
    componentWillMount() {
        this.update();
    },

    handleCodeAdd() {
        var inputvalue = this.refs.codeInput.getValue();
        if (inputvalue.length) {
            ModalActions.close();
            try {
                traktUtil.exchangePin(inputvalue);
                MessageActions.open('Login Successful');
            } catch(e) {
                MessageActions.open('Error: '+e.message);
            }
        } else {
            this.refs['codeInput'].focus();
            MessageActions.open('Error: Trakt Code is Required');
        }
    },
    pasteClipboard() {
        this.refs['codeInput'].setValue(clipboard.readText('text/plain'));
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

                PlayerStore.getState().notifier.info('Trailer Not Found', '', 4000);

            } else {

                var win = new BrowserWindow({ width: 854, height: 510, show: false, 'standard-window': true, 'auto-hide-menu-bar': true, resizable: false, title: parsed.name.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()})+' Trailer - IMDB', center: true });

                win.on('closed', function() {
                  win = null;
                });

                win.loadUrl(trailer_url);

                win.webContents.on('did-finish-load', () => {
                    win.show();
                    win.focus();
                    PlayerActions.pause();
                });
                
            }
            
        });

        client.on("error", function(err){
            PlayerStore.getState().notifier.info('Trailer Error: '+err, '', 4000);
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
            <div>
                <img src={this.state.image} style={{float: 'left', maxWidth: '52%'}} />
                <List style={{float: 'left', paddingTop: '0', marginLeft: '3%', maxWidth: '45%'}}>
                  <ListItem className="inf" primaryText={this.state.parsedTitle}/>
                  <ListItem className="inf" primaryText={this.state.parsedRating}/>
                  <ListItem className="inf" primaryText={this.state.trakt.title} style={{ display: this.state.trakt.season ? 'block' : 'none' }} />
                  <ListItem className="inf" primaryText={this.state.trakt.overview} style={{ display: this.state.trakt.overview ? 'block' : 'none' }} />
                  <ListItem className="inf" primaryText={this.state.parsed.tag.join(', ')} style={{ display: true ? 'none' : this.state.parsed.tag.length ? 'block' : 'none' }} />
                </List>
                <div style={{clear:'both', height: '10px'}} />
                <RaisedButton onClick={this.openImdb} style={{float: 'left', 'marginRight': '10px', display: this.state.parsed.imdb ? 'block' : 'none' }} label="IMDB" />
                <RaisedButton onClick={this.openTrailer} style={{float: 'left', display: this.state.parsed.imdb ? 'block' : 'none'}} label="Trailer" />
                <RaisedButton secondary={true} onClick={ModalActions.close} style={{float: 'right'}} label="Back" />
                <RaisedButton onClick={this.openSearch} style={{float: 'right', 'marginRight': '10px'}} label="Not Correct?" />
            </div>
        );
    }
});