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
    notifier: false,
	wcjs: false
};

player.set = newObj =>  _.each(newObj, (el, ij) => player[ij] = el);

player.wcjsInit = wcjs => {
	player.wcjs = wcjs;
}

player.itemDesc = i => {
	if (!player.wcjs) return false;
	if (typeof i === 'undefined') i = player.wcjs.playlist.currentItem;
	if (typeof i === 'number') {
		if (i > -1 && i < player.wcjs.playlist.items.count) {
			var wjsDesc = Object.assign({}, player.wcjs.playlist.items[i]);
			if (!wjsDesc.setting) wjsDesc.setting = "{}";
			wjsDesc.setting = JSON.parse(wjsDesc.setting);
			return wjsDesc;
		}
	}
	return false;
}

module.exports = player;
