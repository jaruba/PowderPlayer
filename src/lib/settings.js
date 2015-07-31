localStorage.powderVersion = "0.75";

if (!localStorage.maxPeers) localStorage.maxPeers = 200;
if (!localStorage.tmpDir) localStorage.tmpDir = 'Temp';
if (!localStorage.libDir) localStorage.libDir = 'Temp';
if (!localStorage.clickPause) localStorage.clickPause = 'both';
if (!localStorage.subEncoding) localStorage.subEncoding = 'auto';
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
	firstSize = 1,
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
	asyncPlaylist = {},
	downloadWorking = false,
	isWin = /^win/.test(process.platform),
	holdTorrent = false,
	autoPlay = false,
	stopPrebuf = false;
	
if (isWin) {
	var pathBreak = "\\",
		appExt = ".exe";
} else {
	var pathBreak = "/",
		appExt = "";
}

asyncPlaylist.noPlaylist = false;

var gui = require('nw.gui'),
	fs = require('fs');

function resetPowGlobals() {
	powGlobals = [];
	powGlobals.videos = [];
	powGlobals.files = [];
	powGlobals.indexes = [];
	torPieces = [];
	altLength = 0;
	powGlobals.currentIndex = -1;
}

// function to check if a string is json
function IsJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}
// end function to check if a string is json