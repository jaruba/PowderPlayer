var path = require('path');
var execFile = require('child_process').execFile;
var packagejson = require('./package.json');
var electron = require('electron-prebuilt');

module.exports = function(grunt) {
    require('load-grunt-tasks')(grunt);
    var target = grunt.option('target') || 'development';

    var env = process.env;
    env.NODE_ENV = 'development';

    var os;
    switch (process.platform) {
        case 'win32':
            os = 'win';
            break;
        case 'linux':
            os = 'linux';
            break;
        case 'darwin':
            os = 'osx';
            break;
        default:
            os = process.platform;
    }


    var arch = grunt.option('arch') ? grunt.option('arch') : process.arch;

    console.log(' ');
    console.log('Compiling For:', (os === 'win') ? 'Windows' : 'Mac', arch);
    console.log(' ');


    var BASENAME = 'Powder Player';
    var APPNAME = BASENAME;

    var OSX_OUT = './dist';
    var OSX_OUT_X64 = OSX_OUT + '/' + APPNAME + '-darwin-x64';
    var OSX_FILENAME = OSX_OUT_X64 + '/' + APPNAME + '.app';

    var OSX_DIST_X64 = OSX_OUT + '/' + APPNAME + '-' + packagejson.version + '.pkg';

    grunt.initConfig({
        APPNAME: APPNAME,
        APPNAME_ESCAPED: APPNAME.replace(/ /g, '\\ ').replace(/\(/g, '\\(').replace(/\)/g, '\\)'),
        OSX_OUT: OSX_OUT,
        OSX_OUT_ESCAPED: OSX_OUT.replace(/ /g, '\\ ').replace(/\(/g, '\\(').replace(/\)/g, '\\)'),
        OSX_OUT_X64: OSX_OUT_X64,
        OSX_FILENAME: OSX_FILENAME,
        OSX_FILENAME_ESCAPED: OSX_FILENAME.replace(/ /g, '\\ ').replace(/\(/g, '\\(').replace(/\)/g, '\\)'),
        OSX_DIST_X64: OSX_DIST_X64,
        OSX_DIST_X64_ESCAPED: OSX_DIST_X64.replace(/ /g, '\\ ').replace(/\(/g, '\\(').replace(/\)/g, '\\)'),
        // electron
        electron: {
            windows: {
                options: {
                    name: BASENAME,
                    dir: 'build/',
                    out: 'dist',
                    version: packagejson.optionalDependencies['electron-prebuilt'],
                    platform: 'win32',
                    arch: arch,
                    asar: true
                }
            },
            linux: {
                options: {
                    name: BASENAME,
                    dir: 'build/',
                    out: 'dist',
                    version: packagejson.optionalDependencies['electron-prebuilt'],
                    platform: 'linux',
                    arch: arch,
                    asar: true
                }
            },
            osx: {
                options: {
                    name: APPNAME,
                    dir: 'build/',
                    out: 'dist',
                    version: packagejson.optionalDependencies['electron-prebuilt'],
                    platform: 'darwin',
                    arch: arch,
                    asar: true,
                    'app-bundle-id': 'media.PowderPlayer',
                    'app-version': packagejson.version
                }
            }
        },
        copy: {
            dev: {
                files: [{
                    expand: true,
                    cwd: '.',
                    src: ['*.md', 'package.json', 'index.html'],
                    dest: 'build/'
                }, {
                    expand: true,
                    cwd: 'images/',
                    src: ['**/*'],
                    dest: 'build/images/'
                }, {
                    expand: true,
                    cwd: 'fonts/',
                    src: ['**/*'],
                    dest: 'build/fonts/'
                }, {
                    expand: true,
                    cwd: 'bower_components/',
                    src: ['**/*'],
                    dest: 'build/bower_components/'
                }]
            },
            videoDev: {
                files: [{
                    expand: true,
                    cwd: 'bin/vlc',
                    src: ['**/*'],
                    dest: 'build/bin/'
                }, {
                    expand: true,
                    cwd: 'bin/wcjs',
                    src: ['**/*'],
                    dest: 'build/bin/'
                }]
            },
            videoWin: {
                files: [{
                    expand: true,
                    cwd: 'bin/vlc',
                    src: ['**/*'],
                    dest: 'dist/' + BASENAME + '-win32-' + arch + '/resources/bin'
                }, {
                    expand: true,
                    cwd: 'bin/wcjs',
                    src: ['**/*'],
                    dest: 'dist/' + BASENAME + '-win32-' + arch + '/resources/bin'
                }]
            },
            releaseOSX: {
                files: [{
                    src: 'util/images/icon.icns',
                    dest: '<%= OSX_FILENAME %>/Contents/Resources/atom.icns'
                }],
                options: {
                    mode: true
                }
            },
        },
        less: {
            options: {
                compress: true,
                sourceMapFileInline: true
            },
            dist: {
                files: {
                    'build/css/main.css': 'styles/src/**/*.less',
                    'build/css/fonts.css': 'styles/fonts/**/*.css',
                    'build/css/vender.css': ['styles/vender/**/*.less', 'styles/vender/**/*.css']
                }
            }
        },
        babel: {
            options: {
                sourceMap: 'inline',
                plugins: ['transform-minify-booleans', 'transform-property-literals', 'transform-simplify-comparison-operators', 'transform-merge-sibling-variables'],
                presets: ['es2015', 'react'],
                compact: true,
                comments: false
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: 'src/',
                    src: ['**/*.js'],
                    dest: 'build/js'
                }]
            }
        },
        shell: {
            electron: {
                command: electron + ' . ' + (grunt.option('dev') ? '--dev' : ''),
                options: {
                    async: true,
                    execOptions: {
                        cwd: 'build',
                        env: env
                    }
                }
            }
        },
        vlc_libs: {
            options: {
                dir: 'bin/vlc',
                force: true,
                arch: arch,
                platform: os
            }
        },
        wcjs: {
            options: {
                version: 'latest',
                dir: 'bin/wcjs',
                force: true,
                runtime: {
                    type: 'electron',
                    version: packagejson.optionalDependencies['electron-prebuilt'].replace(/[^0-9\.]/g, ''),
                    arch: arch,
                    platform: os
                }
            }
        },
        clean: {
            build: ['build/'],
            dist: ['dist/'],
            release: ['release/']
        },
        'npm-command': {
            release: {
                options: {
                    cwd: 'build/',
                    args: ['--production', '--no-optional']
                }
            }
        },
        compress: {
            windows: {
                options: {
                    archive: './release/' + BASENAME + '-' + packagejson.version + '-' + arch + '-Windows.zip',
                    mode: 'zip'
                },
                files: [{
                    expand: true,
                    dot: true,
                    cwd: './dist/' + BASENAME + '-win32-' + arch,
                    src: '**/*'
                }]
            },
            linux: {
                options: {
                    archive: './release/' + BASENAME + '-' + packagejson.version + '-Linux-' + arch + '-Alpha.zip',
                    mode: 'zip'
                },
                files: [{
                    expand: true,
                    dot: true,
                    cwd: './dist/' + BASENAME + '-linux-' + arch,
                    src: '**/*'
                }]
            },
        },
        watchChokidar: {
            options: {
                spawn: true
            },
            livereload: {
                options: {
                    livereload: true
                },
                files: ['build/**/*', '!build/bin/plugins/**/*']
            },
            js: {
                files: ['src/**/*.js'],
                tasks: ['newer:babel']
            },
            less: {
                files: ['styles/**/*.less'],
                tasks: ['less']
            },
            copy: {
                files: ['images/*', 'index.html', 'fonts/*'],
                tasks: ['newer:copy:dev']
            }
        }
    });

    grunt.registerTask('default', ['newer:babel', 'less', 'newer:copy:dev', 'newer:copy:videoDev', 'shell:electron', 'watchChokidar']);

    grunt.registerTask('run', ['shell:electron', 'watchChokidar']);

    grunt.registerTask('deps', ['wcjs', 'vlc_libs']);

    if (process.platform === 'win32') {
        grunt.registerTask('release', ['clean:build', 'clean:dist', 'babel', 'less', 'copy:dev', 'npm-command:release', 'electron:windows', 'copy:videoWin', 'compress:windows']);
    }
    if (process.platform === 'darwin') {
        grunt.registerTask('release', ['clean:build', 'clean:dist', 'babel', 'less', 'copy:dev', 'npm-command:release', 'electron:osx', 'copy:releaseOSX', 'shell:zip']);
    }
    if (process.platform === 'linux') {
        grunt.registerTask('release', ['clean:build', 'clean:dist', 'babel', 'less', 'copy:dev', 'npm-command:release', 'electron:linux', 'compress:linux']);
    }

    process.on('SIGINT', function() {
        grunt.task.run(['shell:electron:kill']);
        process.exit(1);
    });
};