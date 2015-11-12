import child_process from 'child_process';
import Promise from 'bluebird';
import fs from 'fs';
import path from 'path';
import _ from 'lodash';
import shell from 'shell';


export
default {
    parseURL: function(url) {
        if (url.substring(0, 8) === 'magnet:?' || this.endsWith(url, '.torrent'))
            return 'torrent';
        if (url.substring(0, 7) === ('http://' || 'https://'))
            return 'http link';
        return 'unknown';
    },
    endsWith: function(string, suffix) {
        return string.indexOf(suffix, string.length - suffix.length) !== -1;
    },
    openUrl: function(url) {
        return shell.openExternal(url);
    },
    exists: function(file) {
        return new Promise((resolve) => {
            fs.stat(file, function(err, status) {
                if (err)
                    return resolve(false);
                resolve(status);
            });
        });
    },
    getOS: function() {
        switch (process.platform) {
            case 'win64':
            case 'win32':
                return 'win';
                break;
            case 'linux':
                return 'linux';
                break;
            case 'darwin':
                return 'osx';
                break;
            default:
                return process.platform;
        }
    },
    exec: function(args, options) {
        options = options || {};

        // Add resources dir to exec path for Windows
        if (this.isWindows()) {
            options.env = options.env || {};
            if (!options.env.PATH) {
                options.env.PATH = process.env.BIN_PATH + ';' + process.env.PATH;
            }
        }

        return new Promise((resolve, reject) => {
            child_process.exec(args, options, (stderr, stdout, code) => {
                if (code) {
                    var cmd = Array.isArray(args) ? args.join(' ') : args;
                    log.error(stderr);
                    new Error(cmd + ' returned non zero exit code. Stderr: ' + stderr)
                    reject(stderr);
                } else {
                    log.info(stdout);
                    resolve(stdout);
                }
            });
        });
    },
    isWindows: function() {
        return process.platform === ('win32' || 'win64');
    }
};