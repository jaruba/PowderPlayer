localStorage.powderVersion = "0.90";

if (!localStorage.maxPeers) localStorage.maxPeers = 200;
if (!localStorage.tmpDir) localStorage.tmpDir = 'Temp';
if (!localStorage.libDir) localStorage.libDir = 'Temp';
if (!localStorage.clickPause) localStorage.clickPause = 'both';
if (!localStorage.subEncoding) localStorage.subEncoding = 'auto';
if (!localStorage.dlnaClients) localStorage.dlnaClients = '{}';
if (!localStorage.pulseRule) localStorage.pulseRule = "disabled";
if (!localStorage.noSubs) localStorage.noSubs = "0";
if (!localStorage.history) {
	dummyObject = {};
	localStorage.history = JSON.stringify(dummyObject);
	delete dummyObject;
}

var powGlobals = {
		current: {},
		torrent: {},
		subtitles: {},
		file: {},
		lists: {}
	},
	isWin = /^win/.test(process.platform),
	player = false;

if (isWin) var pathBreak = "\\";
else var pathBreak = "/";

var gui = require('nw.gui'),
	fs = require('fs');
