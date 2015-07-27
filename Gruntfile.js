var getHost = function () {
    return {
        get linux() {
            return process.platform === 'linux';
        },
        get windows() {
            return process.platform === 'win32';
        },
        get mac() {
            return process.platform === 'darwin';
        },
    };
};
var parseBuildPlatforms = function (argumentPlatform) {
    // this will make it build no platform when the platform option is specified
    // without a value which makes argumentPlatform into a boolean
    var inputPlatforms = argumentPlatform || process.platform + ";" + process.arch;

    // Do some scrubbing to make it easier to match in the regexes bellow
    inputPlatforms = inputPlatforms.replace("darwin", "mac");
    inputPlatforms = inputPlatforms.replace(/;ia|;x|;arm/, "");

    var buildAll = /^all$/.test(inputPlatforms);

    var buildPlatforms = {
        mac: /mac/.test(inputPlatforms) || buildAll,
        win: /win/.test(inputPlatforms) || buildAll,
        linux32: /linux32/.test(inputPlatforms) || buildAll,
        linux64: /linux64/.test(inputPlatforms) || buildAll
    };

    return buildPlatforms;
};

module.exports = function (grunt) {
    "use strict";


    require('load-grunt-tasks')(grunt);
    grunt.loadNpmTasks('grunt-nw-builder');
    grunt.loadNpmTasks('grunt-zip');
    grunt.loadNpmTasks('grunt-download');

    // Called from the npm hook
    grunt.registerTask('setup', [
        'nwjs',
        'vlc:download',
        'vlc:copy'
    ]);

    grunt.registerTask('build', [
        'nwjs'
    ]);

    grunt.registerTask('start', function () {
        var start = parseBuildPlatforms();
        if (start.win) {
            grunt.task.run('exec:win');
        } else if (start.mac) {
            grunt.task.run('exec:mac');
        } else if (start.linux32) {
            grunt.task.run('exec:linux32');
        } else if (start.linux64) {
            grunt.task.run('exec:linux64');
        } else {
            grunt.log.writeln('OS not supported.');
        }
    });


    grunt.registerTask('vlc:download', function () {
        var start = parseBuildPlatforms();
        if (start.win) {
            grunt.task.run('download:win');
        } else if (start.mac) {
            grunt.task.run('download:mac');
        } else if (start.linux32) {
            grunt.task.run('download:linux32');
        } else if (start.linux64) {
            grunt.task.run('download:linux64');
        } else {
            grunt.log.writeln('OS not supported.');
        }
    });
    grunt.registerTask('vlc:copy', function () {
        var start = parseBuildPlatforms();
        if (start.win) {
            grunt.task.run('unzip:win');
        } else if (start.mac) {
            grunt.task.run('unzip:mac');
        } else if (start.linux32) {
            grunt.task.run('unzip:linux32');
        } else if (start.linux64) {
            grunt.task.run('unzip:linux64');
        } else {
            grunt.log.writeln('OS not supported.');
        }
    });

    grunt.initConfig({
        nwjs: {
            options: {
                version: '0.12.2',
                build_dir: './build', // Where the build version of my node-webkit app is saved
                keep_nw: true,
                embed_nw: false
            },
            src: ['./src/**/*']
        },

        exec: {
            win: {
                cmd: '"cache/<%= nwjs.options.version %>/win32/nw.exe" .'
            },
            mac: {
                cmd: 'cache/<%= nwjs.options.version %>/osx32/nwjs.app/Contents/MacOS/nwjs .'
            }
        },
        unzip: {
            win: {
                src: 'cache/vlc_2.2.1_win_ia32_with_avi_fix.zip',
                dest: 'node_modules/pw-wcjs-player/node_modules/wcjs-renderer/node_modules/webchimera.js/build/Release'
            }
        },
        download: {
            win: {
                url: 'http://powder.media/vlc_2.2.1_win_ia32_with_avi_fix.zip',
                manifest: false,
                filename: 'cache/'
            }
        },
        shell: {
            vlc: {
                command: [
                    'git submodule init',
                    'cd src/app/styl/third_party/',
                    'git submodule update --init',
                    'git pull origin master --force'
                ].join('&&')
            }
        }
    });
};