import _ from 'lodash';

var player = {
    aspect: 'Default',
    crop: 'Default',
    zoom: 1,
    speed: 1,
    audioChannel: 1,
    audioTrack: 1,
    audioDelay: 0,
    subDelay: 0,
    alwaysOnTop: false,
    fields: {},
    foundTrakt: false,
    notifier: false
};

player.set = newObj =>  _.each(newObj, (el, ij) => player[ij] = el);

module.exports = player;
