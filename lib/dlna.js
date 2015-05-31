var dlnaClients = [],
	dlnaChecks = 0,
	lastDlnaSecond = 0,
	lastDlnaIndex = 0,
	dlnaStarted = false,
	dlnaServer,
	dlnaControls;


function startDlnaServer(httpServer,mimeType) {
	wjs().setOpeningText("Starting DLNA Server ...");

	var MediaRendererClient = require('upnp-mediarenderer-client');
	
	dlnaControls = new MediaRendererClient(dlnaClients[0]);
	dlnaClients = [];
	dlnaChecks = 0;

	var options = { autoplay: true };
	
	dlnaControls.load(httpServer, options, function(err, result) {
	  if(err) throw err;
//	  if (wjs().state() == "playing" || wjs().state() == "paused") lastDlnaSecond = Math.floor(wjs().time()/1000);
//	  console.log("Time: "+lastDlnaSecond);
	  keepAwake();
	  if (lastDlnaSecond > 10) wjs().setOpeningText("Updating playback position ...");
	  else wjs().setOpeningText("Streaming to TV ...");
	  setTimeout(function() { wjs().emitJsMessage("[refresh-playlist]"); },10);
//						  console.log('playing ...');
	});
	
	dlnaControls.on('status', function(status) {
		if (powGlobals.engine && mimeType == "video/x-msvideo" && (!status["TransportState"] || status["TransportState"] == "PLAYING") && status["CurrentMediaDuration"]) {
			dlnaStarted = true;
//			console.log("dlna started 1");
			if (lastDlnaSecond > 0) {
				if (lastDlnaSecond > 10) {
					dlnaControls.seek(lastDlnaSecond);
					wjs().setOpeningText("Streaming to TV ...");
				}
				lastDlnaSecond = 0;
			}
		}
		if (status["TransportState"] == "PLAYING") {
			dlnaStarted = true;
//			console.log("dlna started 2");
			if (lastDlnaSecond > 0) {
				if (lastDlnaSecond > 10) {
					dlnaControls.seek(lastDlnaSecond);
					wjs().setOpeningText("Streaming to TV ...");
				}
				lastDlnaSecond = 0;
			}
		}
		if (dlnaStarted && status["TransportState"] == "STOPPED") {
			dlnaStarted = false;
			if (dlnaServer) dlnaServer.close();
			goBack();
			lastDlnaSecond = 0;
			lastDlnaIndex = 0;
		}
//	  console.log(status);
	});
}

function prepareDlnaServer() {
	
	if (powGlobals.engine) var mimeType = require('mime-types').lookup(powGlobals.engine.files[powGlobals.videos[lastDlnaIndex].index].path);
	else var mimeType = require('mime-types').lookup(powGlobals.videos[lastDlnaIndex].path);

	require('dns').lookup(require('os').hostname(), function (err, add, fam) {
		if (add) {
			if (powGlobals.engine) {
				startDlnaServer(wjs().plugin.playlist.items[lastDlnaIndex].mrl.replace('localhost',add),mimeType);
			} else {
				if (wjs().plugin.playlist.items[lastDlnaIndex].mrl.indexOf("file:///") == 0) {
					var http = require('http'),
						fs = require('fs'),
						util = require('util');
					 
					dlnaServer = http.createServer(function (req, res) {
					  var path = powGlobals.videos[lastDlnaIndex].path;
					  var stat = fs.statSync(path);
					  var total = stat.size;
					  
					  if (req.headers['range']) {
						var range = req.headers.range;
						var parts = range.replace(/bytes=/, "").split("-");
						var partialstart = parts[0];
						var partialend = parts[1];
						var start = parseInt(partialstart, 10);
						var end = partialend ? parseInt(partialend, 10) : total-1;
						var chunksize = (end-start)+1;
					  
						var file = fs.createReadStream(path, {start: start, end: end});
						
						res.writeHead(206, { 'Content-Range': 'bytes ' + start + '-' + end + '/' + total, 'Accept-Ranges': 'bytes', 'Content-Length': chunksize, 'Content-Type': mimeType,'transferMode.dlna.org': 'Streaming','contentFeatures.dlna.org': 'DLNA.ORG_OP=01;DLNA.ORG_CI=0;DLNA.ORG_FLAGS=017000 00000000000000000000000000' });
						file.pipe(res);
					  } else {
						res.writeHead(200, { 'Content-Length': total, 'Content-Type': mimeType,'transferMode.dlna.org': 'Streaming','contentFeatures.dlna.org': 'DLNA.ORG_OP=01;DLNA.ORG_CI=0;DLNA.ORG_FLAGS=017000 00000000000000000000000000' });
						fs.createReadStream(path).pipe(res);
					  }
					}).listen();
					
					dlnaServer.on('listening',function() {
						startDlnaServer('http://'+add+':'+dlnaServer.address().port+'/',mimeType);
					});
				}
			}
		}
	});
}

function findDlnaClient() {
	if (wjs().state() == "playing" || wjs().state() == "paused") lastDlnaSecond = Math.floor(wjs().time()/1000);
	else lastDlnaSecond = 0;
	lastDlnaIndex = parseInt(wjs().currentItem());

	wjs().setOpeningText("Searching for Device ...");
	wjs().stopPlayer();

//	if (wjs().state() == "playing") wjs().togglePause();
    var Client = require('node-ssdp').Client
      , client = new Client();

    client.on('response', function (headers, statusCode, rinfo) {
//		console.log(headers);
		if (headers["LOCATION"]) {
			dlnaClients.push(headers["LOCATION"]);
//			console.log(headers["LOCATION"]);
		}
		if (dlnaClients.length == 1) prepareDlnaServer(); // remove this line for select device menu
	});
	
// uncomment this line for select device menu
//	setTimeout(function() { checkClients(); },1000);

    client.search('urn:schemas-upnp-org:device:MediaRenderer:1');
//	console.log("hello5");
}

function checkClients() {
	if (dlnaClients.length == 1) prepareDlnaServer();
	else {
		if (dlnaClients.length > 1) wjs().emitJsMessage("[select-dlna]"+dlnaClients.join(","));
		// [select-dlna] needs to be implemented in WebChimera Player for select device menu
		if (dlnaChecks < 4) {
			dlnaChecks++;
			setTimeout(function() { checkClients(); },1000);
		} else dlnaChecks = 0;
	}
}