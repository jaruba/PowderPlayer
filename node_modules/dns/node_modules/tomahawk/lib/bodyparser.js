module.exports = function () {
    var bodyparser = require('body-parser'),
        defaultBodyParser = null,
        logger  = {log:function(){}},
        meta    = "requestBodyParser";

    ////////////////////////////////////////////////////////////////////////////

    function readRawBody(req, res, next) {
        var data  = '',
            regex = /^\s*([a-zA-Z0-9\-]+\/[a-zA-Z0-9\-]+)(?:\s*;\s*(\w+)\s*=\s*["']?([^'"]*)["']?)?/i,
            regexIndex = {match:0,contentType:1,charsetLabel:2,charsetValue:3,size:4},
            rawContentType = req.get('Content-Type'),
            match = regex.exec(rawContentType),
            contentType = 'text/plain',
            encoding    = 'utf8';

        if (match && match.length >= regexIndex.size) {
            contentType = match[regexIndex.contentType] || contentType;
            encoding = match[regexIndex.charsetValue] || encoding;
            contentType = contentType.toLocaleLowerCase();
        }
        req.xContentType = contentType;
        req.xEncoding    = encoding;
        
        logger.log('debug', 'RawBodyParser Content-Type: %s === %s, encoding=%s [match=%j]', rawContentType, contentType, encoding, match, meta);
        req.setEncoding(encoding);

        if (!isHandled(contentType)) {
            logger.log('debug', 'Using express bodyparse', meta);
            return defaultBodyParser(req, res, next);
        }

        req.on('data', function(chunk) {
            data += chunk;
        });

        req.on('end', function() {
            if (contentType === 'application/json') {
                try {
                    req.body = JSON.parse(data);
                    logger.log('debug', 'Content-type=JSON', meta);
                } catch (e) {
                    logger.log('debug', 'Body Parser exception : %j', {
                        "Content-type" : contentType,
                        "data" : data,
                        "body" : req.body,
                        "exception" : e}, meta);
                    req.body = data;
                }
            } else if (/^text\//.exec(contentType)) {  // text/plain, text/html, text/css, text/...
                logger.log('debug', 'Content-type=TEXT', meta);
                req.body = data;
            } else {
                logger.log('debug', 'Content-type=UNKNOWN', meta);
                req.body = data;
            }
            return next();
        });
    }

    function isHandled(contentType) {
        if ('application/json' === contentType || // application/json
            /^text\//.exec(contentType)) {        // text/plain, text/html, text/css, text/...
            return true;
        }
        return false;
    }


    function requestBodyParser(app, config) {
        app.use(readRawBody);
        defaultBodyParser = bodyparser.urlencoded({ extended: true });
        logger = config.logger || logger;
        meta   = config.meta   || meta;
    }

    return requestBodyParser;
}();
