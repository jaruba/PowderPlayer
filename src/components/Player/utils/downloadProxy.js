import GrowingFile from 'growing-file';
import http from 'http';
import _ from 'lodash';

var rangeParser = require('range-parser');
var pump = require('pump');
var os = require('os');
var TMP = os.tmpDir();
var path = require('path');
var location = false;
var stream = false;
var folder = false;
var file = false;

var server = false;

module.exports = {
    proxy: (remoteFile, isLocal, type, length, cb, port) => {

        if (!isLocal) {
            var timestamp = new Date().getTime();
            var ytdlFolder = 'ytdl-' + timestamp;
            folder = path.join(TMP, ytdlFolder);
            location = path.join(folder, 'out.temp'); 
            require('fs').mkdirSync(path.join(TMP, ytdlFolder));
            file = require('fs').createWriteStream(location);
            stream = require('request').get(remoteFile);
            stream.pipe(file);
            file.on('finish', function() {
              file.close();
              file = false;
            });
        } else {
            folder = path.resolve(remoteFile.replace(path.basename(remoteFile),''));
            location = remoteFile;
        }

        console.log('proxy location changed to: ' + location);

        server = http.createServer();
        server.on('request', function (request, response) {
        var u = require('url').parse(request.url)
        var host = request.headers.host || 'localhost'

        // Allow CORS requests to specify arbitrary headers, e.g. 'Range',
        // by responding to the OPTIONS preflight request with the specified
        // origin and requested headers.
        if (request.method === 'OPTIONS' && request.headers['access-control-request-headers']) {
          response.setHeader('Access-Control-Allow-Origin', request.headers.origin)
          response.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
          response.setHeader(
              'Access-Control-Allow-Headers',
              request.headers['access-control-request-headers'])
          response.setHeader('Access-Control-Max-Age', '1728000')
    
          response.end()
          return
        }
    
        if (request.headers.origin) response.setHeader('Access-Control-Allow-Origin', request.headers.origin)
    
        var range = request.headers.range
        if (length > -1) range = range && rangeParser(length, range)[0]
        response.setHeader('Accept-Ranges', 'bytes')
        response.setHeader('Content-Type', type || 'video/mp4')
        response.setHeader('transferMode.dlna.org', 'Streaming')
        response.setHeader('contentFeatures.dlna.org', 'DLNA.ORG_OP=01;DLNA.ORG_CI=0;DLNA.ORG_FLAGS=017000 00000000000000000000000000')

        if (!range) {
          response.setHeader('Content-Length', length == -1 ? '*' : length)
          if (request.method === 'HEAD') return response.end()
    
          pump(GrowingFile.open(location, { timeout: 10000 }), response)
          return
        } else {
    
            response.statusCode = 206
            response.setHeader('Content-Length', range && range.end ? range.end - range.start + 1 : length == -1 ? '*' : length)
            response.setHeader('Content-Range', 'bytes ' + range.start + '-' + range.end + '/' + (length == -1 ? '*' : length))
            if (request.method === 'HEAD') return response.end()
    
        }
    
        pump(GrowingFile.open(location, { timeout: 10000 }), response)

      })
    
      server.on('connection', function (socket) {
        socket.setTimeout(36000000)
      })

      server.on('listening', function () {
          _.delay(() => {
            cb('http://127.0.0.1:' + server.address().port + '/');
          }, 2000);
      });
      
      server.listen(port || null);

    },
    destroy: () => {
        if (stream) {
            var removeFile = function(theStream, theFolder) {
                return function() {
                    theStream.removeAllListeners();
                    require('rimraf')(theFolder, { maxBusyTries: 100 }, (err, data) => {
                        console.log('rimraf proxy server'); console.log(err); console.log(data);
                    });
                }
            }(stream, folder);
            var remover = _.once(removeFile);
            if (server) {
                server.close(remover);
                server = false;
            }
            stream.on('close', remover);
            stream.destroy();
            if (file) file.close();
            _.delay(remover, 3000);
            stream = false;
            folder = false;
        } else if (server) {
            var removeFile = function(theFolder) {
                return function() {
                    require('rimraf')(theFolder, { maxBusyTries: 100 }, (err, data) => {
                        console.log('rimraf proxy server');
                    });
                }
            }(folder);
            var remover = _.once(removeFile);
            if (file) file.close();
            server.close(remover);
            _.delay(remover, 3000);
            server = false;
            folder = false;
        } else if (folder) {
            require('rimraf')(folder, { maxBusyTries: 100 }, (err, data) => {
                console.log('rimraf proxy server');
            });
            folder = false;
        }
    }
    
}
