node-opensubtitles-api
======================

Node.js API library to query opensubtitles.org

![build status](https://travis-ci.org/ka2er/node-opensubtitles-api.svg?branch=master)

Usage
-----

The lib get hashing function :

	var OS = require("opensubtitles");
	var os = new OS();
	os.computeHash('./test/breakdance.avi', function(err, size){
		if (err) return;

		os.checkMovieHash([size], function(err, res) {
			if(err) return;

			console.log(res);
		})
	});

And it also bind all XML-RPC methods :

	os.api.LogIn(function(err, res){
		console.log(res);
	},user, pass, lang, ua);

Tests
-----

simply run :

	$ mocha

About
-----

<a href='http://www.opensubtitles.org/'>Subtitles service powered by www.OpenSubtitles.org <img src='http://static.opensubtitles.org/gfx/logo-transparent.png' /></a>
