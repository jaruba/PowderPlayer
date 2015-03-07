module.exports = function () {
    var path      = require('path'),
        fs        = require('fs'),
        regex   = /^--(\s*[^=\s]+)(?:\s*=(.*))?$/;

    /**
     * Return the type of a value, that make more sense than the builtin "typeOf()".
     *
     * @param value: a value (or undefined value) to get the type of.
     *
     * @returns: undefined, number, boolean, string, object, array, regexp, function.
     *
     */
    function isType(value) {
        return ({}).toString.call(value).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
    }

    /**
     * read the package.json configuration and extract the "configuration" key
     *
     * @param package: path and file name of the package json file.
     *
     * @returns the configuration
     */
    function readPackageConfig(package) {
        var rootPath = path.dirname(fs.realpathSync(package)),
            config   = {};

        try {
            var buffer   = fs.readFileSync(package),
                pkg      = JSON.parse(buffer),
                config   = pkg.configuration || {};
            config.version  = pkg.version;
        } catch (e) {
            console.log('node-options::readPackageconfig(' + package + ')|exception=', e);
        }
        config.rootPath = rootPath;
        return config;
    }

    /**
     * Overwrite the default configuration with the Environment variable
     *
     * @param options: an object containing all the valid "options" that can be
     *                 passed on the command line.
     *
     * @returns the modified options object
     *
     */
    function mergeEnvironment(options) {
        options = options || {};
        for (var i in options) {
            var name = i.toUpperCase();
            if (isType(process.env[name]) !== 'undefined') {
                options[i] = process.env[name];
            }
        }
        return options;
    }

    /**
     * Overwrite the configuration with a JSON configuration file
     *
     * @param fileName: The JSON Configuration file to load.
     *
     * @returns the modified options object
     *
     */
    function overlayConfig(fileName, pkgConfig, dotPathPrefix) {
        var config,
            absFileName = findFilename(fileName, dotPathPrefix);

        // Try first the the CWD
        if (absFileName && fs.existsSync(absFileName)) {
            config = JSON.parse(fs.readFileSync(absFileName));
            pkgConfig = merge(config, pkgConfig);
        } else {
            // No, try the Tomahawk package
            fileName = pkgConfig.rootPath + "/" + fileName;
            if (fileName && fs.existsSync(fileName)) {
                config = JSON.parse(fs.readFileSync(fileName));
                pkgConfig = merge(config, pkgConfig);
            }
        }
        return pkgConfig;
    }

    /**
     * Overwrite the configuration with a JSON configuration file
     *
     * @param fileName: The JSON Configuration file to load.
     *
     * @returns the modified options object
     *
     */
    function findFilename(filename, dotPathPrefix) {
        if (!filename || filename.charAt(0) === '/') return filename;
        var pathAndFilename = path.join(process.cwd(), filename);
        if (fs.existsSync(pathAndFilename)) return pathAndFilename;
        pathAndFilename = path.join(process.env['HOME'], (dotPathPrefix ? dotPathPrefix : ''), filename);
        if (fs.existsSync(pathAndFilename)) return pathAndFilename;
        return filename;
    }


    /**
     * Merge two object together
     *
     * @param src: The source object to be copied over the dst (destination) object
     *
     * @param dst: The destination object.
     *
     * @returns:   Return the dst object, once overwritten by the src object
     *
     */
    function merge(src, dst) {
        for (var i in src) {
            if (src.hasOwnProperty(i))
                dst[i] = src[i];
        }
        return dst;
    }

    /**
     * Return a USAGE message on how to use this program
     *
     * @param options: an object containing all the valid "options" that can be
     *                 passed on the command line.
     *
     * @returns a message to be printed
     */
    function usage(options) {
        options = merge(options, {name:process.argv[1]});
        var message = 'USAGE: ' + options.name;
        for (var i  in options) {
            message += ' --' + i;
            if (isType(options[i]) === 'object' || isType(options[i]) === 'array') {
                message += '=' + JSON.stringify(options[i]);
            } else if (isType(options[i]) === 'string' || isType(options[i]) === 'number') {
                message += '=' + options[i];
            }
        }
        return message;
    }

    /**
     * Return a message of the unknow options
     *
     * @params "errors" : an Array with all the arguments found after the "remains"
     *                    (e.g -op1 -opt2 file.ext -opt3 -> errors = ['-opt3'])
     *
     * @returns an error message to be printed
     */
    function error(errors) {
        var message = '       UNKNOWN ARGUMENTS: "' + (errors ? errors.join('", "'): "") + '"';
        return message;
    }

    /**
     * Process the arguments received on the command line.
     *
     * @param args: an array of arguments to be process. Use
     *              process.argv.slice(2) to remove the process "node" and the
     *              name of the script "tagger.js" from the arguments before
     *              calling parse().
     * @param options: an object containing all the valid "options" that can be
     *                 passed on the command line.
     *
     * @returns an object with the following properties:
     *      "args" : an Array with all the arguments remaining after the last
     *                  options (e.g --option) parsed
     *      "errors" : an Array with all the arguments found after the "remains"
     *                 (e.g -op1 -opt2 file.ext -opt3 -> errors = ['-opt3'])
     *      "end" : all the arguments found after "--"
     */
    function parse(args, options) {
        var errors  = null,
            remains = [],
            passThrough = null;


        args.forEach(function (val, index, array) {
            if (errors) {
                errors.push(val);
            } else if (passThrough) {
                passThrough.push(val);
            } else if (val === '--') {
                passThrough = [];
            } else {
                var capture = val.match(regex);
                // Make sure we capture an 'option' and that it is part of the 'options' object (valid)
                if (capture !== null && capture.length === 3 && capture[1] !== undefined && options.hasOwnProperty(capture[1])) {
                    if (remains.length > 0) {
                        errors = remains;
                        remains = [];
                    } else {
                        if (capture[2] !== undefined) { // we have an ='something'
                            var optType = isType(options[capture[1]]);
                            if (optType === 'object' || optType === 'array') {
                                try {
                                    options[capture[1]] = JSON.parse(capture[2]);
                                } catch (e) {
                                    errors = [val + '* parse error'];
                                }
                            } else {
                                options[capture[1]] = capture[2];
                            }
                        } else { // Assume it is a boolean toggle
                            options[capture[1]] = !options[capture[1]];
                        }
                    }
                } else {
                    remains.push(val);
                }
            }
        });

        return {
            "errors" : errors,
            "args"   : remains,
            "end"    : passThrough
        };
    }

    return {
        "parse"             : parse,
        "mergeEnvironment"  : mergeEnvironment,
        "overlayConfig"     : overlayConfig,
        "readPackageConfig" : readPackageConfig,
        "usage"             : usage,
        "error"             : error,
        "merge"             : merge,
        "isType"            : isType
    };
}();
