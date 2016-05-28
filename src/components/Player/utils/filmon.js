import needle from 'needle';
import _ from 'lodash';

var timeout = 0;
var key = false;
var groups = [];
var channels = [];

var getUri = (channel, cb) => {
    getKey( () => {
        needle.post('http://www.filmon.com/tv/api/channel/' + channel.id, { 'session_key': key }, (err, res) => {
            if (err) {
                cb(err.message);
            } else {
                var mrlObj = {
                    title: res.body.title,
                    image: res.body.extra_big_logo ? res.body.extra_big_logo : res.body.big_logo,
                    uri: false
                };
                var bestTimeout = 0;
                console.log(res.body.streams);
                if (res.body.streams && res.body.streams.length) {
                    res.body.streams.forEach( el => {
                        if (el.watch_timeout) {
                            if (parseInt(el.watch_timeout) > bestTimeout) {
                                bestTimeout = parseInt(el.watch_timeout);
                                mrlObj.uri = el.url;
                            }
                        } else if (!mrlObj.mrl) {
                            mrlObj.uri = el.url;
                        }
                    });
                }
                if (mrlObj.uri) {
                    // add to playlist
                    cb(null, mrlObj);
                } else {
                    // handle error
                    cb('Could Not Fetch Media URL');
                }
            }
        });
    });
}

var getKey = cb => {
    var current = new Date().getTime() / 1000;
    if (timeout < current - 3600)
        key = false;

    if (!key)
        needle.post('http://www.filmon.com/tv/api/init', { 'app_id': 'foo', 'app_secret': 'bar' }, (err, res) => {
            key = res.body['session_key'];
            timeout = new Date().getTime() / 1000;
            cb();
        });
    else
        cb();
}

var fetchFilmon = () => {

    var getGroups = () => {
        needle.post('http://www.filmon.com/tv/api/groups', { 'session_key': key }, (err, res) => {
            if (err) _.delay(fetchFilmon, 600000);
            else {
                var countAdult = 0;
                res.body.forEach( (el, ij) => {
                    if (el.channels && el.channels.length) {
                        res.body[ij].real_channels = [];
                        el.channels.forEach( elm => {
                            if (channels[elm])
                                res.body[ij].real_channels.push(channels[elm]);
                        });
                    }
                });
                groups = res.body;
//                console.log('groups');
//                console.log(groups);
            }
        });
    }
    
    var getChannels = () => {
        needle.post('http://www.filmon.com/tv/api/channels', { 'session_key': key }, (err, res) => {
            if (err) _.delay(fetchFilmon, 600000);
            else {
                res.body.forEach( el => {
                    channels[el.id] = el;
                });
                if (!groups.length) getGroups();
            }
        });
    }
    
    var startGrab = () => {
        if (!channels.length) getChannels();
    }
    
    getKey(startGrab);
}

module.exports = {
    init: fetchFilmon,
    getMrl: getUri,
    groups: () => { return groups }
}
