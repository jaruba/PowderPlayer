import alt from '../../../../alt'
import PlayerStore from '../../store';
import PlayerActions from '../../actions';
import ControlActions from '../Controls/actions';
import subUtil from '../../utils/subtitles';
import ls from 'local-storage';
import _ from 'lodash';
import player from '../../utils/player';

class SubtitleActions {

    constructor() {
        this.generateActions(
            'settingChange'
        );
    }


    time(time) {
        // print subtitle text if a subtitle is selected
        var subtitleState = this.alt.stores.SubtitleStore.state;
        if (subtitleState.subtitle.length > 0)
            subUtil.findLine(subtitleState.subtitle, subtitleState.trackSub, player.subDelay, time).then(result => {
                if (result && result.text != subtitleState.text)
                    this.actions.settingChange(result);
            });

    }

    findSubs(itemDesc, cb, idx) {

        var subQuery = {}

        if (player.wcjs.input.fps)
            subQuery.fps = player.wcjs.input.fps

        if (itemDesc.path)
            subQuery.filepath = itemDesc.path

        if (window.getExtendedDetails) {
            if (itemDesc.parsed) {

                if (itemDesc.parsed.imdb)
                    subQuery.imdbid = itemDesc.parsed.imdb

                if (itemDesc.parsed.name)
                    subQuery.query = itemDesc.parsed.name

                if (itemDesc.parsed.season)
                    subQuery.season = itemDesc.parsed.season + ''

                if (itemDesc.parsed.episode && itemDesc.parsed.episode[0])
                    subQuery.episode = itemDesc.parsed.episode[0] + ''

            } else if (window.extendedTitle) {
                subQuery.query = window.extendedTitle
            }
            window.getExtendedDetails = null
        }

        if (itemDesc.byteSize)
            subQuery.byteLength = itemDesc.byteSize;

        if (itemDesc.torrentHash) {
            subQuery.torrentHash = itemDesc.torrentHash;
            subQuery.isFinished = false;
        }

        subQuery.cb = subs => {
            if (!subs) {
                if (!ls.isSet('playerNotifs') || ls('playerNotifs'))
                    player.notifier.info('Subtitles Not Found', '', 6000);
                cb && cb(false);
            } else {
                this.actions.foundSubs(subs, true, idx, cb);
            }
        }

        subUtil.fetchSubs(subQuery);

    }
    
    foundSubs(subs, announce, idx, cb) {

        if (!idx) idx = player.wcjs.playlist.currentItem;
        var playerState = PlayerStore.getState();

        ControlActions.settingChange({
            foundSubs: true
        });
        
        var prevSubs = {};

        if (player && player.itemDesc) {
            var itemDesc = player.itemDesc(idx)
            if (itemDesc.setting && itemDesc.setting.subtitles)
                prevSubs = itemDesc.setting.subtitles
        }

        subs = _.extend({}, prevSubs, subs);
        PlayerActions.setDesc({
            idx: idx,
            subtitles: subs
        });
        if ((!ls.isSet('playerNotifs') || ls('playerNotifs')) && announce)
            player.notifier.info('Found Subtitles', '', 6000);

        cb && cb(true);
    }

    loadSub(subLink) {
        subUtil.loadSubtitle(subLink, parsedSub => {
            if (!parsedSub) {
                PlayerActions.announcement('Subtitle Loading Failed');
            } else {
                this.actions.settingChange({
                    subtitle: parsedSub,
                    delay: 0,
                    trackSub: -1,
                    text: ''
                });
                player.fields.subDelay.value = '0 ms';
                player.wcjs.subtitles.delay = 0;
            }
        });
    }

}


export
default alt.createActions(SubtitleActions);
