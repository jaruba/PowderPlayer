import React from 'react';
import {
    AutoComplete, RaisedButton
}
from 'material-ui';
import {
    clipboard
}
from 'electron';

import ModalActions from '../actions';

import MessageActions from '../../Message/actions';
import PlayerActions from '../../Player/actions';
import PlayerStore from '../../Player/store';

import linkUtil from '../../../utils/linkUtil';
import traktUtil from '../../Player/utils/trakt';

import _ from 'lodash';

export
default React.createClass({

    getInitialState() {
        return {
            results: {}
        }
    },

    componentDidMount() {
//        this.refs['searchInput'].focus();
    },

    pasteClipboard() {
        this.refs['searchInput'].setValue(clipboard.readText('text/plain'));
    },
    searchTrakt(t) {
        if (!t) {
            this.setState({
                results: {}
            });
        } else {
            traktUtil.search({ query: t }).then( res => {
                var resObj = {};
    
                res.some( (el, ij) => {
                    if (['movie', 'show'].indexOf(el.type) > -1) {
                        var newTitle = el[el.type].title;
                        if (el[el.type].year) newTitle += ' ('+el[el.type].year+')';
                        resObj[t+' []'+el[el.type].ids.trakt] = (<AutoComplete.Item primaryText={newTitle} onClick={this.selected.bind(this,null,' []'+el[el.type].ids.trakt)} />);
                        if (Object.keys(resObj).length == 5) return true;
                    }
                    return false;
                });
    
                if (Object.keys(resObj).length) {
                    this.setState({
                        results: resObj,
                        traktResult: res
                    });
                }
            }).catch( err => { });
        }
    },
    selected(e,t) {
        var traktID = parseInt(t.substr(t.indexOf(' []')+3));
        
        this.state.traktResult.some( el => {
            if (el[el.type].ids.trakt == traktID) {
                var desc = PlayerStore.getState().itemDesc();
                var parsed = desc.setting.parsed;
                var prevTrakt = '';
                if (desc.setting.trakt) {
                    var prevTrakt = desc.setting.trakt;
                }

                parsed.name = el[el.type].title;
                if (el[el.type].ids.imdb) {
                    parsed.imdb = el[el.type].ids.imdb;
                } else {
                    parsed.imdb = '';
                }

                if (parsed.season && parsed.episode && parsed.episode.length) {
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
                            season: parsed.season,
                            episode: parsed.episode[0],
                            extended: parsed.extended
                        };
                        var summary = traktUtil.episodeInfo;
                    }
                    
                    summary(buildQuery).then( results => {

                        var idx = PlayerStore.getState().wcjs.playlist.currentItem;

                        if (idx > -1 && results && results.title) {
                                        
                            var newObj = {
                                idx: idx
                            };
                            
                            // this is the episode title for series
                            newObj.title = parsed.name.split(' ').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
                            
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
                                }
                            }
                            
                            newObj.parsed = parsed;
                            newObj.trakt = results;
                            
                            PlayerActions.setDesc(newObj);
                            
                            ModalActions.close();
                            
                            ModalActions.open({
                                title: 'Trakt Info',
                                type: 'TraktInfo',
                                theme: 'DarkRawTheme'
                            });
                            if (traktUtil.loggedIn) {
                                var shouldScrobble = localStorage.traktScrobble ? (localStorage.traktScrobble == 'true') : true;
                                if (shouldScrobble) {
                                    var newType = '';
                                    if (prevTrakt)
                                        traktUtil.scrobble('stop', PlayerStore.getState().wcjs.position, prevTrakt);

                                    if (results)
                                        traktUtil.scrobble('start', PlayerStore.getState().wcjs.position, results);
                                }
                            }
                        }
                    }).catch( err => {
                        console.log('Error: '+ err.message);
                    });
                }
                return true;
            }
            return false;
        });
    },
    render() {
        return (
            <div>
                <AutoComplete
                  fullWidth={true}
                  showAllItems={true}
                  animated={false}
                  dataSource={this.state.results}
                  onUpdateInput={_.throttle(this.searchTrakt, 500)}
                  onNewRequest={this.selected}
                  hintText="Search Trakt" />
                <RaisedButton onClick={ModalActions.close} style={{float: 'right'}} label="Cancel" />
                <div style={{clear:'both'}} />
            </div>
        );
    }
});