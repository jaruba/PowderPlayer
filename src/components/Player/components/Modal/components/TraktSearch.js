import React from 'react';
import {
    clipboard
} from 'clipboard'

import ModalActions from '../actions';

import PlayerActions from '../../../actions';

import traktUtil from '../../../utils/trakt';
import player from '../../../utils/player';

import _ from 'lodash';
import ls from 'local-storage';

var results = [],
    optsResult = {},
    traktResult = {};

export
default React.createClass({

    getInitialState() {
        return {
            results: JSON.stringify([])
        }
    },

    componentDidMount() {
//        this.refs['searchInput'].$.input.focus()
        this.refs.dialog.open();
//        var that = this;
        _.delay(() => {
                document.querySelector('#input-remote').$.input.focus();
                document.addEventListener('autocomplete.selected',this.selector);
//                document.querySelector('#input-remote').addEventListener('selected',that.selectedF);
        },500);
    },
    arraysEqual(arr1, arr2) {
        if(arr1.length !== arr2.length)
            return false;
        for(var i = arr1.length; i--;) {
            if(arr1[i] !== arr2[i])
                return false;
        }
    
        return true;
    },
    pasteClipboard() {
        this.refs['searchInput'].value = clipboard.readText('text/plain');
    },
    searchTrakt() {
        var t = this.refs['searchInput'].$.input.value;
        var isSuggestion = false;
        var setting = player.itemDesc().setting;
        var type
        if (setting) {
            if (setting.parsed && setting.parsed.type)
                type = setting.parsed.type
            else if (setting.trakt && (setting.trakt.season || setting.trakt.number))
                type = 'series'
            else if (setting.trakt)
                type = 'movie'
            
            if (type == 'series') type = 'show'
        }
        results.forEach( el => {
            if (el == t) isSuggestion = true;
        });
        if (isSuggestion) return;
        if (!t) {
            results = [];
            document.querySelector('#input-remote').suggestions([]);
        } else {
            var that = this;
            traktUtil.search({ query: t, type: type }).then( res => {
                var resObj = [];
                var optsObj = {};
    
                res.some( (el, ij) => {
                    if (['movie', 'show'].indexOf(el.type) > -1) {
                        var newTitle = el[el.type].title;
                        if (el[el.type].year) newTitle += ' ('+el[el.type].year+')';

                        resObj.push(newTitle);
                        optsObj[newTitle] = el[el.type].ids.trakt;

                        if (Object.keys(resObj).length == 4) return true;
                    }
                    return false;
                });
    
                if (Object.keys(resObj).length && !this.arraysEqual(resObj, results)) {
                    results = resObj;
                    optsResult = optsObj;
                    traktResult = res;
                    var resObj = resObj.map(function(el) {
                        return {text: el, value: el};
                    });
                    document.querySelector('#input-remote').suggestions(resObj); 
                }
            }).catch( err => { });
        }
    },
    selected(e) {
        var traktID = optsResult[e];

        traktResult.some( el => {
            if (el[el.type].ids.trakt == traktID) {

                var desc = player.itemDesc();
                var parsed = desc.setting.parsed;
                var prevTrakt = '';
                if (desc.setting.trakt) {
                    var prevTrakt = desc.setting.trakt;
                }

                if (!parsed) parsed = {};

                parsed.name = el[el.type].title;
                if (el[el.type].ids.imdb) {
                    parsed.imdb = el[el.type].ids.imdb;
                } else {
                    parsed.imdb = '';
                }

                parsed.extended = 'full,images';
                if (el.type == 'movie') {
                    var buildQuery = {
                        id: el[el.type].ids.trakt,
                        id_type: 'trakt',
                        extended: parsed.extended
                    };
                    var summary = traktUtil.movieInfo;
                } else if (el.type == 'show') {
                    var buildQuery = {
                        id: el[el.type].ids.trakt,
                        id_type: 'trakt',
                        extended: parsed.extended
                    };
                    var summary = traktUtil.showInfo;
                    if (parsed.season && parsed.episode && parsed.episode.length) {
                        buildQuery.season = parsed.season;
                        buildQuery.episode = parsed.episode[0];
                        summary = traktUtil.episodeInfo;
                    }
                }
                    
                summary(buildQuery).then( results => {

                    function moveMeta(results) {
                        var idx = player.wcjs.playlist.currentItem;
    
                        if (idx > -1 && results && results.title) {
                                        
                            var newObj = {
                                idx: idx
                            };
                            try {
                                // this is the episode title for series
                                newObj.title = parsed.name.split(' ').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
                            } catch(e) {
                                newObj.title = results.title;
                            }
                            
                            if (results.season && results.number) {
                                newObj.title += ' S' + ('0' + results.season).slice(-2) + 'E' + ('0' + results.number).slice(-2);
                            } else if (results.year) {
                                newObj.title += ' ' + results.year;
                            }
                            
                            if (results.images) {
                                if (results.images.screenshot && results.images.screenshot.thumb) {
                                    newObj.image = results.images.screenshot.thumb;
                                } else if (results.images.fanart && results.images.fanart.thumb) {
                                    newObj.image = results.images.fanart.thumb;
                                } else {
                                    newObj.image = '';
                                }
                            } else {
                                newObj.image = '';
                            }
    
                            newObj.parsed = parsed;
                            newObj.trakt = results;
    
                            PlayerActions.setDesc(newObj);
    
                            player.events.emit('setTitle', newObj.title);
    
                            ModalActions.close();
                            ModalActions.open({
                                title: 'Trakt Info',
                                type: 'TraktInfo',
                                theme: 'DarkRawTheme'
                            });
                            if (traktUtil.loggedIn) {
                                var shouldScrobble = ls.isSet('traktScrobble') ? ls('traktScrobble') : true;
                                if (shouldScrobble) {
                                    var newType = '';
                                    if (prevTrakt)
                                        traktUtil.scrobble('stop', player.wcjs.position, prevTrakt);
    
                                    if (results)
                                        traktUtil.scrobble('start', player.wcjs.position, results);
                                }
                            }
                            player.events.emit('foundTrakt', true);
                        }
                    }
                                        // try to fetch background (as trakt doesn't allow image hotlinking anymore)
                    traktUtil.getImages(results).then(imgRes => {
                        if (imgRes && (imgRes.background || imgRes.episode)) {
                            if (!results.images) results.images = {}
                            if (!results.images.fanart) results.images.fanart = {}
                            if (!results.images.fanart.thumb) results.images.fanart.thumb = imgRes.episode || imgRes.background
                        }
                        moveMeta(results)
                    }).catch(err => {
                        moveMeta(results)
                    })
                }).catch( err => {
                    console.log('Error: '+ err.message);
                });
                return true;
            }
            return false;
        });
    },
    selector(a) {
        this.selected(a.detail.value);
    },
    render() {
        return (
            <paper-dialog
                ref="dialog"
                style={{width: '440px', textAlign: 'left', borderRadius: '3px', maxWidth: '90%', backgroundColor: '#303030', padding: '20px'}}
                entry-animation="slide-from-top-animation"
                opened={false}
                with-backdrop >

                <paper-autocomplete
                    id="input-remote"
                    ref="searchInput"
                    onKeyDown={_.throttle(this.searchTrakt, 500)}
                    onContextMenu={this.pasteClipboard}
                    remote-source="true"
                    min-length="2"
                    fullWidth={true}
                    style={{width: '100%', padding: '0', margin: '0', height: '40px'}}
                    showClear={false}
                    no-label-float
                    className="dark-input dark-input-large" />
                    
                <paper-button
                    raised
                    onClick={ModalActions.close}
                    style={{ marginBottom: '0', marginRight: '0', float: 'right', marginTop: '7px' }}
                    className='playerButtons-primary' >
                Cancel
                </paper-button>
                
                <div style={{clear:'both'}} />
            </paper-dialog>
        );
    }
});