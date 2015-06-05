localStorage.powderVersion = "0.65";

if (!localStorage.maxPeers) localStorage.maxPeers = 200;
if (!localStorage.tmpDir) localStorage.tmpDir = 'Temp';
if (!localStorage.libDir) localStorage.libDir = 'Temp';
if (!localStorage.clickPause) localStorage.clickPause = 'both';
if (!localStorage.history) {
	dummyObject = {};
	localStorage.history = JSON.stringify(dummyObject);
	delete dummyObject;
}

var supportedVideo = ["mkv", "avi", "mp4", "mpg", "mpeg", "webm", "flv", "ogg", "ogv", "mov", "wmv", "3gp", "3g2"],
	powGlobals = [],
	torPieces = [],
	firstTimeEver = 1,
	firstTime = 0,
	setOnlyFirst = 0,
	altLength = 0,
	prebuf = 0,
	doSubsLocal = 0,
	savedHistory = 0,
	isReady = 0,
	subVoteSent = 0,
	lastItem = 0,
	lastState = "",
	onTop = false,
	playerLoaded = false,
	focused = true,
	downSpeed,
	sleepTimer,
	findHashTime,
	peerInterval,
	asyncPlaylist = {};

asyncPlaylist.noPlaylist = false;

var gui = require('nw.gui'),
	fs = require('fs');

function resetPowGlobals() {
	if (playerLoaded) wjs().emitJsMessage("[refresh-playlist]");
	powGlobals = [];
	powGlobals.videos = [];
	powGlobals.files = [];
	powGlobals.indexes = [];
	torPieces = [];
	altLength = 0;
	powGlobals.currentIndex = -1;
}