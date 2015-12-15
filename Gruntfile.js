var path = require('path');
var execFile = require('child_process').execFile;
var packagejson = require('./package.json');
var electron = require('electron-prebuilt');

module.exports = function(grunt) {
    require('load-grunt-tasks')(grunt);
    var target = grunt.option('target') || 'development';


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


    var arch = process.arch;

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
                    prune: true,
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
                    asar: true,
                    prune: true
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
                    prune: true,
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
                    cwd: 'bin/vlc',
                    src: ['**/*'],
                    dest: 'build/resources/bin/'
                }, {
                    expand: true,
                    cwd: 'bin/wcjs',
                    src: ['**/*'],
                    dest: 'build/resources/bin/'
                }, {
                    expand: true,
                    cwd: 'fonts/',
                    src: ['**/*'],
                    dest: 'build/fonts/'
                }, {
                    cwd: 'node_modules/',
                    src: Object.keys(packagejson.dependencies).map(function(dep) {
                        return dep + '/**/*';
                    }),
                    dest: 'build/node_modules/',
                    expand: true
                }]
            },
            release: {
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
                    cwd: 'node_modules/',
                    src: Object.keys(packagejson.dependencies).map(function(dep) {
                        return dep + '/**/*';
                    }),
                    dest: 'build/node_modules/',
                    expand: true
                }]
            },
            releaseWin: {
                files: [{
                    expand: true,
                    cwd: 'util/images/',
                    src: ['icon.ico', 'icon.png'],
                    dest: 'dist/<%= BASENAME %>-win32-ia32/resources/'
                }]
            },
            releaseOSX: {
                files: [{
                    expand: true,
                    cwd: 'util/images/',
                    src: ['icon.png'],
                    dest: 'dist/<%= OSX_FILENAME %>-win32-ia32/resources/'
                }, {
                    src: 'util/images/icon.icns',
                    dest: '<%= OSX_FILENAME %>/Contents/Resources/atom.icns'
                }],
                options: {
                    mode: true
                }
            },
        },
        // styles
        less: {
            options: {
                compress: true,
                sourceMapFileInline: true
            },
            dist: {
                files: {
                    'build/css/main.css': 'styles/src/**/*.less',
                    'build/css/vender.css': ['styles/vender/**/*.less', 'styles/vender/**/*.css']
                }
            }
        },
        // javascript
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
                        cwd: 'build'
                    }
                }
            },
            zip: {
                command: 'ditto -c -k --sequesterRsrc --keepParent <%= OSX_FILENAME_ESCAPED %> dist/' + BASENAME + '-' + packagejson.version + '-Mac.zip',
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
                    version: 'latest',
                    arch: arch,
                    platform: os
                }
            }
        },

        clean: {
            unusedWin: ['dist/<%= BASENAME %>-win32-ia32/resources/default_app'],
            release: ['build/', 'dist/'],
        },
        compress: {
            windows: {
                options: {
                    archive: './dist/' + BASENAME + '-' + packagejson.version + '-Windows-Alpha.zip',
                    mode: 'zip'
                },
                files: [{
                    expand: true,
                    dot: true,
                    cwd: './dist/<%= BASENAME %>-win32-ia32',
                    src: '**/*'
                }]
            },
            linux: {
                options: {
                    archive: './dist/<%= BASENAME %>-' + packagejson.version + '-Linux-' + arch + '-Alpha.zip',
                    mode: 'zip'
                },
                files: [{
                    expand: true,
                    dot: true,
                    cwd: './dist/<%= BASENAME %>-linux-' + arch,
                    src: '**/*'
                }]
            },
        },
        // livereload
        watchChokidar: {
            options: {
                spawn: true
            },
            livereload: {
                options: {
                    livereload: true
                },
                files: ['build/**/*', '!build/resources/bin/plugins/**/*']
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

    grunt.registerTask('default', ['newer:babel', 'less', 'newer:copy:dev', 'shell:electron', 'watchChokidar']);

    grunt.registerTask('run', ['shell:electron', 'watchChokidar']);

    grunt.registerTask('deps', ['wcjs', 'vlc_libs']);

    if (process.platform === 'win32') {
        grunt.registerTask('release', ['clean:release', 'babel', 'less', 'copy:release', 'electron:windows', 'clean:unusedWin', 'copy:releaseWin', 'compress:windows']);
    }
    if (process.platform === 'darwin') {
        grunt.registerTask('release', ['clean:release', 'babel', 'less', 'copy:release', 'electron:osx', 'copy:releaseOSX', 'shell:zip']);
    }
    if (process.platform === 'linux') {
        grunt.registerTask('release', ['clean:release', 'babel', 'less', 'copy:release', 'electron:linux', 'compress:linux']);
    }

    process.on('SIGINT', function() {
        grunt.task.run(['shell:electron:kill']);
        process.exit(1);
    });
};