var validURL = [];
var tests = [];
var errors = 0;
var notFound = 0;
var async = require('async');
var specifics = {
    'twitch.py': 'https?://(?:www\.)?twitch\.tv',
    'dailymotion.py': 'http://api\.dmcloud\.net/(?:player/)?embed/',
    'viewlift.py': '(?:snagfilms|snagxtreme|funnyforfree|kiddovid|winnersview|monumentalsportsnetwork|vayafilm)\.com|kesari\.tv',
    'viki.py': 'https?://(?:www\.)?viki\.(?:com|net|mx|jp|fr)/',
    'wdr.py': '-(?:video|audio)player(?:_size-[LMS])?',
    'xuite.py': '(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?',
    'novamov.py': 'novamov\.com'
};

var ytdlSupport = [];

var checkFile = async.queue(function(obj, next) {
    
    conf = obj.path;
    
    validURL = [];
    tests = [];
    startRecording = false;
    bigPyRegex = '';
    
//    console.log(conf);
    
    var lineReader = require('readline').createInterface({
      input: require('fs').createReadStream(conf)
    });
    
    lineReader.on('line', function (line) {
        if (startRecording) {
            var matches = line.match(/([^"]+""")/g);
            if (!(matches && matches.length))
                matches = line.match(/([^']+''')/g);

            if (matches && matches.length) {
                line = matches[0].replace('"""','').replace("'''","");
                bigPyRegex += line.trim();
                pythonRegex = bigPyRegex;
                startRecording = false;
            } else {
                if (line.includes('# '))
                    line = line.substr(0, line.indexOf('# ')).trim();
                bigPyRegex += line.trim();
            }
        }
        if (line.includes('_VALID_URL = ') || line.includes('_VALID_URL_TEMPLATE = ')) {
            var count = (line.match(/'/g) || []).length;
            if (!count)
                count = (line.match(/"/g) || []).length;
    
            if (count) {
                if (count == 2) {
                    var matches = line.match(/'([^\']+)'/g);
                    if (!(matches && matches.length))
                        var matches = line.match(/"([^\"]+)"/g);

                    if (matches.length == 1)
                        var pythonRegex = matches[0];

                } else if (count == 3) {
                    var matches = line.match(/"""([^]+)/g);
                    if (!(matches && matches.length))
                        var matches = line.match(/'''([^]+)/g);

                    if (matches && matches.length) {

                        matches[0] = matches[0].replace('"""','').replace("'''","");

                        startRecording = true;

                        bigPyRegex = matches[0];
                        if (bigPyRegex.includes('# '))
                            bigPyRegex = bigPyRegex.substr(0, bigPyRegex.indexOf('# ')).trim();

                    }
                }
            }
        } else if (line.includes("'url':") || line.includes('"url":')) {
            var matches = line.match(/'([^\']+)'/g);
            if (!(matches && matches.length))
                matches = line.match(/"([^\"]+)"/g);
                
            if (matches.length == 2 && matches[1] != 'url') {
                tests.push(matches[1].split("'").join("").split('"').join(''));
            }
        }
        if (pythonRegex) {
            pythonRegex = pythonRegex.replace(/\(\?P<[^>]+>/g,'(?:');
            pythonRegex = pythonRegex.split('/').join('\\/');
            pythonRegex = pythonRegex.split("'").join("").split('"').join('');
            if (pythonRegex.startsWith('(?x)') || pythonRegex.startsWith('(?i)')) {
                pythonRegex = pythonRegex.substr(4);
            }
            if (pythonRegex.includes('{,'))
                pythonRegex = pythonRegex.split('{,').join('{0,');

            if (pythonRegex.includes('(?('))
                pythonRegex = pythonRegex.split('(?(').join('(?:(');
                
            if (pythonRegex.includes('(?<!'))
                pythonRegex = pythonRegex.split('(?<!').join('(?!');
                
            if (pythonRegex.includes('%s') || pythonRegex.includes('%(host)s')) {
                var filename = conf.replace(/^.*[\\\/]/, '');
                if (specifics[filename.replace(/^.*[\\\/]/, '')]) {
                    pythonRegex = pythonRegex.split('%s').join(specifics[filename]).split('%(host)s').join(specifics[filename]);
                } else {
                    console.log('Missing Specifics for ' + filename);
                }
            }

            if (['url','.*','https?:'].indexOf(pythonRegex) == -1) {
                try {
                    var newValue = new RegExp(pythonRegex, "g");
                    if (ytdlSupport.indexOf(newValue) == -1) {
//                        ytdlSupport.push(new RegExp(pythonRegex, "g"));
                        ytdlSupport.push(pythonRegex);
                    }
                    validURL.push(pythonRegex);
                } catch (e) {
                    console.log('Regex Error at:');
                    console.log(pythonRegex);
                }
            }
        }
    });
    
    lineReader.on('close', function() {
        if (validURL.length) {
            var passed = 0;
            tests.forEach(function(el) {
                validURL.forEach(function(eli) {
                    if (new RegExp(eli, "g").test(el))
                        passed++;
                })
            });
        } else {
            notFound++;
            console.log('RegEx Not Found for: ' + conf.replace(/^.*[\\\/]/, '') + ' (' + notFound + ')');
        }
        next();
    });
},1);

var confFolder = function(path) {
    var fs = require('fs'),
        pathMerge = require('path');

    fs.stat(path, function(err, stats) {
        if (err) {
//            console.log('error 1');
        } else if (!stats.isDirectory()) {
//            console.log('error 2');
        } else {
            fs.readdir(path, function(err, files) {
                files.forEach(function(el) {
                    if (['.', '..'].indexOf(el) == -1) {
                        fs.stat(pathMerge.join(path, el), function(err, stats) {
                            if (!err && !stats.isDirectory() && el.endsWith('.py') && !el.startsWith('common') && ['testurl.py', '__init__.py', 'extractors.py'].indexOf(el) == -1) {
                                var newPath = pathMerge.join(path, el);
                                checkFile.push({ path: newPath });
//                                checkFile(newPath);
                            }
                        });
                    }
                });
            });
        }
    });
}

require('fs').stat(require('path').join(__dirname, 'ytdl-definitions.js'), function(err, stats) {
    if (!err) {
        ytdlSupport = require(require('path').join(__dirname, 'ytdl-definitions'));
        ytdlSupport.map(function (el) {
            return new RegExp(el);
        });
    } else {
        confFolder(require('path').join(__dirname, 'extractor'));
    }
});

module.exports = function(link) {

//  This comment holds the regex extractor that
//  saves all matched 'youtube-dl' regex cases to ytdl-definitions.js

//    console.log('Saving ' + ytdlSupport.length + ' Extractors to File');
//    var fs = require('fs');
//    fs.writeFile(require('path').join(__dirname, 'ytdl-definitions.js'), "module.exports = " + JSON.stringify(ytdlSupport), function(err) {
//        if(err) {
//            return console.log(err);
//        }
    
//        console.log("The file was saved!");
//    });

    return ytdlSupport.some(function(el) {
        return !!link.match(el);
    })
};
