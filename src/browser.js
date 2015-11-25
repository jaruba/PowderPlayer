import app from 'app';
import BrowserWindow from 'browser-window';
import path from 'path';
import {
    ipcMain, powerSaveBlocker
}
from 'electron';
import yargs from 'yargs';

var args = yargs(process.argv.slice(1)).wrap(100).argv;
var powerSaveBlockerState = false;
var startupTime = new Date().getTime();

var parseTime = (s) => {
    var ms = s % 1000;
    s = (s - ms) / 1000;
    var secs = s % 60;
    s = (s - secs) / 60;
    var mins = s % 60;
    return mins + ' minutes ' + secs + '.' + ms + ' seconds';
}

ipcMain.on('app:startup', function(event, time) {
    console.log('App Startup Time:', parseTime(Math.floor(time - startupTime)));
});

app.commandLine.appendSwitch('v', -1);
app.commandLine.appendSwitch('vmodule', 'console=0');
app.commandLine.appendSwitch('d3d9');
app.commandLine.appendSwitch('disable-d3d11');
app.commandLine.appendSwitch('gpu-no-context-lost');
app.commandLine.appendSwitch('ignore-gpu-blacklist');

app.on('ready', function() {
    var screenSize = require('screen').getPrimaryDisplay().workAreaSize;

    var mainWindow = new BrowserWindow({
        width: 637,
        height: 514,
        'standard-window': true,
        'auto-hide-menu-bar': true,
        resizable: true,
        title: 'Powder Player',
        center: true,
        frame: false,
        show: false
    });

    if (args.dev) {
        mainWindow.show();
        mainWindow.toggleDevTools();
        mainWindow.focus();
        console.info('Dev Mode Active: Developer Tools Enabled.');
    }

    mainWindow.loadURL(path.normalize('file://' + path.join(__dirname, '../index.html')));


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

    mainWindow.on('close', app.quit);

    ipcMain.on('app:get:fullscreen', (event) => {
        event.returnValue = mainWindow.isFullScreen();
    });

    ipcMain.on('app:get:maximized', (event) => {
        event.returnValue = mainWindow.isMaximized();
    });

    ipcMain.on('app:fullscreen', (event, state) => {
        mainWindow.setFullScreen(state)
    });

    ipcMain.on('app:maximize', (event, state) => {
        state ? mainWindow.maximize() : mainWindow.unmaximize();
    });

    ipcMain.on('app:minimize', () => {
        mainWindow.minimize();
    });

    ipcMain.on('app:powerSaveBlocker', (event, state) => {
        let enablePowerBlock = () => {
            powerSaveBlockerState = powerSaveBlocker.start('prevent-display-sleep');
        };
        let disablePowerBlock = () => {
            if (powerSaveBlockerState)
                powerSaveBlocker.stop(powerSaveBlockerState);
        };

        state ? enablePowerBlock() : disablePowerBlock();
    });

    ipcMain.on('app:get:powerSaveBlocker', (event) => {
        event.returnValue = powerSaveBlockerState ? powerSaveBlocker.isStarted(powerSaveBlockerState) : false;
    });

    ipcMain.on('app:close', () => {
        mainWindow.close();
    });

});

app.on('window-all-closed', function() {
    app.quit();
});