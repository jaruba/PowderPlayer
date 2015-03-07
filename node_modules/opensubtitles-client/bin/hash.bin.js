#!/usr/bin/env node

var _ = require('lodash'),
    opensubtitles = require("../Index.js");

var filename = process.argv[2];

opensubtitles.hash.getHash(filename)
    .done(function(hash){
        console.log(hash);
    })

