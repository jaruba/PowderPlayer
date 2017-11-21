import React from 'react';
import _ from 'lodash';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import ls from 'local-storage';

import PlayerActions from '../actions';
import SubtitleStore from './SubtitleText/store';
import SubtitleActions from './SubtitleText/actions';
import VisibilityStore from './Visibility/store';
import VisibilityActions from './Visibility/actions';
import player from '../utils/player';
import path from 'path';
import {
    dialog
} from 'remote';

const lang2country = {
    en: 'us',
    cs: 'cz',
    pb: 'br',
    he: 'il',
    el: 'gr',
    uk: 'ua',
    fa: 'ir',
    vi: 'vn'
}

export
default React.createClass({

    mixins: [PureRenderMixin],

    getInitialState() {
        return {
            open: false,
            playlist: player.wcjs.playlist || false,
            playlistSelected: SubtitleStore.getState().selectedSub
        }
    },
    componentWillMount() {
        VisibilityStore.listen(this.update);
    },

    componentWillUnmount() {
        VisibilityStore.unlisten(this.update);
    },
    update() {
        if (this.isMounted()) {
            this.setState({
                open: VisibilityStore.getState().subtitles,
                playlist: player.wcjs.playlist || false,
                playlistSelected: SubtitleStore.getState().selectedSub
            });
        }
    },

    close() {
        PlayerActions.openPlaylist(false);
    },

    getItems() {
        var itemDesc = player.itemDesc();
        if (itemDesc && itemDesc.setting && itemDesc.setting.subtitles) {
            return itemDesc.setting.subtitles;
        } else return [];
    },
    
    select(idx, item, itemId) {
        if (itemId == 2) {
            dialog.showOpenDialog({
                title: 'Select Subtitle',
                properties: ['openFile'],
                filters: [ {name: 'Subtitles', extensions: ['srt', 'vtt', 'sub']} ]
            }, (file) => {
                if (file && file.length) {
                    var subs = player.itemDesc().setting.subtitles || {};
                    subs[path.basename(file[0])] = file[0];
                    PlayerActions.setDesc({
                        subtitles: subs
                    });
                    player.wcjs.subtitles.track = 0;
                    SubtitleActions.loadSub(file[0]);
                    SubtitleActions.settingChange({
                        selectedSub: _.size(subs) + (player.wcjs.subtitles.count || 1) +1,
                    });
                    player.notifier.info('Subtitle Loaded', '', 3000);
                    VisibilityActions.settingChange({
                        subtitles: false
                    });
                }
            });
            return
        }
        ls('lastLanguage', idx);
        player.wcjs.subtitles.track = 0;
        if (item) {
            SubtitleActions.loadSub(item);
            SubtitleActions.settingChange({
                selectedSub: itemId,
            });
        } else {
            SubtitleActions.settingChange({
                selectedSub: itemId,
                subtitle: [],
                trackSub: -1,
                text: ''
            });
        }
        VisibilityActions.settingChange({
            subtitles: false
        });
    },

    selectInternal(idx, item, itemId) {
        var wcjs = player.wcjs;
        if (item && (itemId - 2) < wcjs.subtitles.count) {
            wcjs.subtitles.track = idx;
            SubtitleActions.settingChange({
                selectedSub: itemId,
                subtitle: [],
                text: ''
            });
            VisibilityActions.settingChange({
                subtitles: false
            });
        }
    },

    getInternalSubs() {
        var wcjs = player.wcjs;
        var internalSubs = [];
        if (wcjs.subtitles && wcjs.subtitles.count > 0) {
            for (var i = 1; i < wcjs.subtitles.count; i++)
                internalSubs.push(wcjs.subtitles[i]);
            return internalSubs;
        } else return [];
    },

    render() {
        var itemId = 1;
        if (!ls.isSet('menuFlags') || ls('menuFlags')) {
            var none = (
                <paper-item key={itemId} style={{backgroundColor: '#303030', color: 'white', padding: '4px 12px'}} onClick={this.select.bind(this, 'none', '', 1)} className={'sub-menu-item' + (this.state.playlistSelected == itemId ? ' iron-selected' : '')}>
                      <span style={{width: '38px', height: '38px', borderRadius: '25px', backgroundColor: '#242424', margin: '4px', marginLeft: '0', marginRight: '15px'}} />
                    <paper-item-body>
                    None
                    </paper-item-body>
                </paper-item>
            );
            itemId++
            var browseForSub = (
                <paper-item key={itemId} style={{backgroundColor: '#303030', color: 'white', padding: '4px 12px'}} onClick={this.select.bind(this, 'browse', '', 2)} className={'sub-menu-item' + (this.state.playlistSelected == itemId ? ' iron-selected' : '')}>
                    <span style={{width: '38px', height: '38px', borderRadius: '25px', backgroundImage: 'url(./images/icons/browse-subtitle-icon.png)', margin: '4px', marginLeft: '0', marginRight: '15px', backgroundSize: 'cover', backgroundPosition: 'center'}} />
                    <paper-item-body>
                    Browse for File
                    </paper-item-body>
                </paper-item>
            );
        } else {
            var none = (
                <paper-item key={itemId} style={{backgroundColor: '#303030', color: 'white', padding: '4px 22px'}} onClick={this.select.bind(this, 'none', '', 1)} className={'sub-menu-item' + (this.state.playlistSelected == itemId ? ' iron-selected' : '')}>
                <paper-item-body>
                    None
                </paper-item-body>
                </paper-item>
            );
            itemId++
            var browseForSub = (
                <paper-item key={itemId} style={{backgroundColor: '#303030', color: 'white', padding: '4px 22px'}} onClick={this.select.bind(this, 'browse', '', 2)} className={'sub-menu-item' + (this.state.playlistSelected == itemId ? ' iron-selected' : '')}>
                <paper-item-body>
                    Browse
                </paper-item-body>
                </paper-item>
            );
        }
        return (
            <div className={this.state.open ? 'subtitle-list show' : 'subtitle-list'}>
            <div style={{backgroundColor: '#303030', padding: '0'}}>
                {none}
                {browseForSub}
                {
                        _.map(this.getInternalSubs(), (item, idx) => {
                            itemId++;
                            if (!ls.isSet('menuFlags') || ls('menuFlags')) {
                                return (
                                  <paper-item key={itemId} style={{backgroundColor: '#303030', color: 'white', padding: '4px 12px'}} onClick={this.selectInternal.bind(this, (idx + 1), item, itemId)} className={'sub-menu-item' + (this.state.playlistSelected == itemId ? ' iron-selected' : '')}>
                                  <span style={{width: '38px', height: '38px', borderRadius: '25px', backgroundImage: 'url(./images/icons/internal-subtitle-icon.png)', margin: '4px', marginLeft: '0', marginRight: '15px', backgroundSize: 'cover', backgroundPosition: 'center'}} />
                    <paper-item-body>
                                    {item}
                                    </paper-item-body>
                                  </paper-item>
                                );
                            } else {
                                return (
                                  <paper-item key={itemId} style={{backgroundColor: '#303030', color: 'white', padding: '4px 22px'}} onClick={this.selectInternal.bind(this, (idx + 1), item, itemId)} className={'sub-menu-item' + (this.state.playlistSelected == itemId ? ' iron-selected' : '')}>
                                    <paper-item-body>
                                    {item}
                                    </paper-item-body>
                                  </paper-item>
                                );
                            }
                        })
                    }
                    {
                        _.map(this.getItems(), (item, idx) => {
                            itemId++;
                            var lang = idx.split('[lg]');
                            if (lang2country[lang[1]]) lang[1] = lang2country[lang[1]];
                            if (!ls.isSet('menuFlags') || ls('menuFlags')) {
                                return (
                                  <paper-item key={itemId} style={{backgroundColor: '#303030', color: 'white', padding: '4px 12px'}} onClick={this.select.bind(this, idx, item, itemId)} className={'sub-menu-item' + (this.state.playlistSelected == itemId ? ' iron-selected' : '')}>
                                      <span key={itemId} style={{width: '38px', height: '38px', borderRadius: '25px', backgroundImage: 'url(' + (lang[1] ? 'http://flagpedia.net/data/flags/small/' + lang[1] : 'images/icons/external-subtitle-icon') + '.png)', margin: '4px', marginLeft: '0', marginRight: '15px', backgroundSize: 'cover', backgroundPosition: 'center'}} />
                                    <paper-item-body style={{ overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: '1', WebkitBoxOrient: 'vertical', maxWidth: '192px' }}>
                                    {lang[0]}
                                    </paper-item-body>
                                  </paper-item>
                                );
                            } else {
                                return (
                                  <paper-item key={itemId} style={{backgroundColor: '#303030', color: 'white', padding: '4px 22px' }} onClick={this.select.bind(this, idx, item, itemId)} className={'sub-menu-item' + (this.state.playlistSelected == itemId ? ' iron-selected' : '')}>
                                    <paper-item-body style={{ overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: '1', WebkitBoxOrient: 'vertical', maxWidth: '192px' }}>
                                    {lang[0]}
                                    </paper-item-body>
                                  </paper-item>
                                );
                            }
                        })
                    }
            </div>
            </div>
        );
    }

    
});