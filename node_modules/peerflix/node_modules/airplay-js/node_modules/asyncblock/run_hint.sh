#!/usr/bin/env node

var JSHINT = require('jshint').JSHINT;
var fs = require('fs');
var path = require('path');
var asyncblock = require('asyncblock');

var codeDir = path.join(__dirname, 'lib');

var showErrors = function(filePath, result){
    var len = result.errors.length;
    for (var i = 0; i < len; i++) {
        var pad = '' + (i + 1);
        while (pad.length < 3) {
            pad = ' ' + pad;
        }

        var e = result.errors[i];
        if (e) {
            console.error('at (' + filePath + ":" + e.line + ":" + e.character + ')');
            console.error('    ' + e.reason);
            console.error( '    ' + (e.evidence || '').replace(/^\s+|\s+$/, ""));
            console.error('');
        }
    }
};

fs.readdir(codeDir, function(err, list){
    if(err) {
        throw err;
    }

    var options = {
       node: true,
       devel: true,
       eqnull: true,
       es5: true,
       curly: true,
       newcap: true,
       undef: true,
       onecase: true,
       scripturl: true,
       latedef: false,
       loopfunc: true,
       proto: true
   };

    asyncblock(function(flow){
        list.forEach(function(file){
            var fullPath = path.join(codeDir, file);

            var fileContents = flow.sync( fs.readFile(fullPath, 'utf8', flow.callback()) );

            var result = JSHINT(fileContents, options);

            if(!result){
                showErrors(fullPath, JSHINT.data());
            }
        });
    });
});