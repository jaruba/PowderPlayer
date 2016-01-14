import _ from 'lodash';

var config = {
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
    foundTrakt: false
};

config.set = newObj =>  _.each(newObj, (el, ij) => config[ij] = el);

module.exports = config;
