import React from 'react';
import {
    clipboard
} from 'electron';

import ModalActions from '../actions';

import MessageActions from '../../Message/actions';
import PlayerActions from '../../Player/actions';
import plugins from '../../../utils/plugins';

import linkUtil from '../../../utils/linkUtil';
import _ from 'lodash';

import filmonUtil from '../../Player/utils/filmon';
import ls from 'local-storage';


export
default React.createClass({

    componentDidMount() {
        this.refs['dialog'].open();
        _.delay(() => {
            this.refs.urlInput.$.input.focus()
        });
    },

    handleURLAdd() {
        ModalActions.thinking(true);
        var inputvalue = this.refs.urlInput.value;
        this.refs.urlInput.value = '';
        var plugin = false;
        if (inputvalue.startsWith('.')) {
            if (inputvalue.includes(' ')) {
                var shortcut = inputvalue.substr(0, inputvalue.indexOf(' '));
                var searchTerm = inputvalue.replace(shortcut + ' ', '');
            } else {
                var shortcut = inputvalue;
            }
            if (shortcut) {
                var feed = plugins.matchTags();
                var plugin = plugins.getByShortcut(feed, shortcut);
                if (!plugin) {
                    filmonUtil.groups().some( el => {
                        return el.real_channels.some( elm => {
                            if (shortcut == '.' + elm.alias) {
                                elm.filmon = true;
                                plugin = elm;
                            }
                        });
                    });
                }
            }

            if (plugin) {
                if (plugin.filmon) {
                    if (ls('myFilmonPlugins').indexOf(plugin.name) == -1) {
                        plugin.image = plugin.extra_big_logo ? plugin.extra_big_logo : plugin.big_logo;
                        plugin.name = plugin.title;
                        plugin.filmon = true;
                        ModalActions.plugin(plugin);
                        return;
                    }
                } else if (plugin.tags.indexOf('installed') == -1) {
                    ModalActions.plugin(plugin);
                    return;
                }

                if (!plugin.search && searchTerm)
                    searchTerm = false;

                if (!searchTerm) {
                    if (plugin.feed) {
                        inputvalue = plugin.feed.replace('%p', plugin.search && typeof plugin.search.start != 'undefined' ? plugin.search.start : 1);
                        if (plugin.categories) {
                            for (var firstCat in plugin.categories) break;
                            if (plugin.categories[firstCat] instanceof Array) {
                                inputvalue = inputvalue.replace('%c', plugin.categories[firstCat][0]);
                            } else {
                                inputvalue = inputvalue.replace('%c', plugin.categories[firstCat]);
                            }
                        }
                    } else if (plugin.filmon) {
                        filmonUtil.getMrl(plugin, (err, mrlObj) => {
                            ModalActions.close(true);
                            if (err) {
                                ModalActions.installedPlugin(plugin);
                                MessageActions.open(err);
                            } else {
                                mrlObj.filmon = true;
                                mrlObj.filmonObj = plugin;
                                PlayerActions.addPlaylist([mrlObj]);
                            }
                        });
                        return;
                    }
                } else {
                    var forceCategory;
                    if (plugin.categories) {
                        _.some( plugin.categories, (el, ij) => {
                            if (ij.toLowerCase() == searchTerm.toLowerCase().trim()) {
                                forceCategory = ij;
                                return true;
                            }
                        });
                    }
                    if (forceCategory) {
                        var inputvalue = plugin.feed.replace('%p', plugin.search && typeof plugin.search.start != 'undefined' ? plugin.search.start : 1);
                        if (plugin.categories[forceCategory] instanceof Array) {
                            inputvalue = inputvalue.replace('%c', plugin.categories[forceCategory][0]);
                        } else {
                            inputvalue = inputvalue.replace('%c', plugin.categories[forceCategory]);
                        }
                    } else {
                        if (plugin.search && plugin.search.searcher) {
                            inputvalue = plugin.search.searcher.replace('%p', plugin.search && typeof plugin.search.start != 'undefined' ? plugin.search.start : 1);
                            if (plugin.categories) {
                                for (var firstCat in plugin.categories) break;
                                if (plugin.categories[firstCat] instanceof Array) {
                                    inputvalue = inputvalue.replace('%c', plugin.categories[firstCat][1]);
                                } else {
                                    inputvalue = inputvalue.replace('%c', plugin.categories[firstCat]);
                                }
                            }
                            inputvalue = inputvalue.replace('%s', encodeURIComponent(searchTerm).split('%20').join(plugin.search.separate));
    
                        }
                    }
                }
            }
        }

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
    pasteClipboard() {
        this.refs['urlInput'].value = clipboard.readText('text/plain');
    },
    clearValue() {
        var that = this;
        _.delay(() => {
            that.refs.urlInput.value = '';
        },500);
    },
    componentDidUpdate() {
        this.refs['dialog'].open();
        _.delay(() => {
            this.refs['urlInput'].$.input.focus()
        });
    },
    render() {
        return (
            <paper-dialog
                ref="dialog"
                style={{width: '440px', textAlign: 'left', borderRadius: '3px'}}
                entry-animation="slide-from-top-animation"
                opened={false}
                with-backdrop >

                <paper-input
                    ref="urlInput"
                    style={{marginBottom: '15px', marginTop: '20px'}}
                    fullWidth={true}
                    onKeyDown={event => event.keyCode === 13 ? this.handleURLAdd() : void 0}
                    onContextMenu={this.pasteClipboard}
                    label="Torrent/Video URL, Magnet or Plugin Shortcut"
                    no-label-float />
                    
                <paper-button
                    raised
                    onClick={this.handleURLAdd}
                    style={{float: 'right', background: '#00bcd4', color: 'white', padding: '8px 15px', fontWeight: 'bold', marginRight: '22px', marginTop: '0px', textTransform: 'none'}}>
                Stream
                </paper-button>
                
                <paper-button
                    raised
                    onClick={this.clearValue}
                    style={{float: 'right', marginRight: '10px', padding: '8px 15px', fontWeight: 'bold', marginTop: '0px', textTransform: 'none'}}
                  dialog-dismiss>
              Cancel
              </paper-button>
                
            </paper-dialog>
        );
    }
});