import app from 'app';
import BrowserWindow from 'browser-window';
import path from 'path';
import util from './utils/util';
import yargs from 'yargs';

var args = yargs(process.argv.slice(1)).wrap(100).argv;

app.on('ready', function() {
    var screenSize = require('screen').getPrimaryDisplay().workAreaSize;

    var mainWindow = new BrowserWindow({
        width: screenSize.width * 0.7,
        height: screenSize.height * 0.7,
        'standard-window': true,
        'auto-hide-menu-bar': true,
        resizable: true,
        title: 'Powder Player',
        center: true,
        frame: true,
        show: false
    });

    if (args.dev) {
        mainWindow.show();
        mainWindow.toggleDevTools();
        mainWindow.focus();
        console.info('Dev Mode Active: Developer Tools Enabled.')
    }

    mainWindow.setMenu(null);

    mainWindow.loadUrl(path.normalize('file://' + path.join(__dirname, '../index.html')));


    mainWindow.webContents.on('new-window', function(e) {
        e.preventDefault();
    });

    mainWindow.webContents.on('will-navigate', function(e, url) {
        if (url.indexOf('build/index.html#') < 0) {
            e.preventDefault();
        }
    });

    mainWindow.webContents.on('did-finish-load', function() {
        mainWindow.setTitle('Powder Player');
        mainWindow.show();
        mainWindow.focus();
    });

    mainWindow.on('close', function() {
        app.quit();
    });
});

app.on('window-all-closed', function() {
    app.quit();
});