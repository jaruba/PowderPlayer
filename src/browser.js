import app from 'app';
import BrowserWindow from 'browser-window';
import ipc from 'ipc';
import path from 'path';


app.on('ready', function() {

    var size = require('screen').getPrimaryDisplay().workAreaSize;

    var windowSize = {
        width: 800,
        height: 600
    }

    var mainWindow = new BrowserWindow({
        width: windowSize.width,
        height: windowSize.height,
        'standard-window': true,
        'auto-hide-menu-bar': true,
        resizable: true,
        title: 'Slackie Desktop',
        center: true,
        frame: true,
        show: true
    });
    mainWindow.toggleDevTools()

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
        mainWindow.setTitle('Slackie');
    });

    mainWindow.on('close', function(event) {
        app.quit();
    });

    ipc.on('application:show', () => {
        mainWindow.show();
        mainWindow.focus();
    });

});


app.on('window-all-closed', function() {
    app.quit();
});