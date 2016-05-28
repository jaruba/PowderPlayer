import app from 'app';
import BrowserWindow from 'browser-window';
import rimraf from 'rimraf';
import path from 'path';
import {
    ipcMain, powerSaveBlocker, Menu
}
from 'electron';
import yargs from 'yargs';

const args = yargs(process.argv.slice(1)).wrap(100).argv;
const startupTime = new Date().getTime();
var powerSaveBlockerState = false;

if (/^win/.test(process.platform)) {
    if (args.dev) {
        process.env['VLC_PLUGIN_PATH'] = require('path').join(__dirname, '../bin/plugins');
    } else {
        process.env['VLC_PLUGIN_PATH'] = require('path').join(__dirname, '../../bin/plugins');
    }
}

const parseTime = s => {
    var ms = s % 1000;
    s = (s - ms) / 1000;
    var secs = s % 60;
    s = (s - secs) / 60;
    var mins = s % 60;
    return mins + ' minutes ' + secs + '.' + ms + ' seconds';
}

ipcMain.on('app:startup', (event, time) => {
    console.log('App Startup Time:', parseTime(Math.floor(time - startupTime)));
});

app.commandLine.appendSwitch('v', -1);
app.commandLine.appendSwitch('vmodule', 'console=0');
app.commandLine.appendSwitch('d3d9');
app.commandLine.appendSwitch('disable-d3d11');
app.commandLine.appendSwitch('gpu-no-context-lost');
app.commandLine.appendSwitch('ignore-gpu-blacklist');
app.commandLine.appendSwitch('disable-speech-api');

app.on('ready', () => {

    const mainWindow = new BrowserWindow({
        width: 653,
        height: 522,
        icon: path.join(__dirname, '../images/icons/powder-icon.png'),
        resizable: true,
        title: 'Powder Player',
        center: true,
        frame: false,
        show: false
    });

    if (args.dev) {
        process.env['devMode'] = 1;
        mainWindow.show();
        mainWindow.toggleDevTools();
        mainWindow.focus();
        console.info('Dev Mode Active: Developer Tools Enabled.');
    }

    mainWindow.loadURL('file://' + path.join(__dirname, '../index.html'));


    mainWindow.webContents.on('new-window', (e) => e.preventDefault());

    mainWindow.webContents.on('will-navigate', (e, url) => {
        if (url.indexOf('build/index.html#') < 0) {
            e.preventDefault();
        }
    });

    mainWindow.webContents.on('did-finish-load', () => {
        mainWindow.setTitle('Powder Player');
        mainWindow.show();
        mainWindow.focus();
    });

    mainWindow.on('close', app.quit);

    ipcMain.on('app:contextmenu', (event, template) => {
        var passActions = function(temp) {
            temp.forEach( (el, ij) => {
                if (el.click) {
                    temp[ij].click = function(clicker) {
                        return () => {
                            event.sender.send('context-action', clicker);
                        }
                    }(el.click)
                } else if (el.submenu && el.submenu.length) {
                    temp[ij].submenu = passActions(el.submenu);
                }
            })
            return temp;
        }
        template = passActions(template);
        var contextMenu = Menu.buildFromTemplate(template);
        contextMenu.popup(mainWindow);
    });

    ipcMain.on('app:get:fullscreen', (event) => {
        event.returnValue = mainWindow.isFullScreen();
    });

    ipcMain.on('app:get:maximized', (event) => {
        event.returnValue = mainWindow.isMaximized();
    });

    ipcMain.on('app:fullscreen', (event, state) => mainWindow.setFullScreen(state));

    ipcMain.on('app:maximize', (event, state) => {
        state ? mainWindow.maximize() : mainWindow.unmaximize();
    });

    ipcMain.on('app:alwaysOnTop', (event, state) => mainWindow.setAlwaysOnTop(state));

    ipcMain.on('app:setThumbarButtons', (event, buttons) => mainWindow.setThumbarButtons(buttons));

    ipcMain.on('app:bitchForAttention', (event, state = true) => {
        if (!mainWindow.isFocused())
            mainWindow.flashFrame(state);
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

    ipcMain.on('app:toggleDevTools', () => {
        mainWindow.show();
        mainWindow.toggleDevTools();
        mainWindow.focus();
        console.info('Developer Tools Toggled.');
    });

    ipcMain.on('app:get:powerSaveBlocker', (event) => {
        event.returnValue = powerSaveBlockerState ? powerSaveBlocker.isStarted(powerSaveBlockerState) : false;
    });

    ipcMain.on('app:close', app.quit);

});

app.on('window-all-closed', app.quit);


app.on('will-quit', () => {
    try {
        rimraf.sync(path.join(app.getPath('temp'), 'Powder-Player'));
    } catch (e) {
        console.error(e);
    }
});