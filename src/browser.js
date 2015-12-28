import app from 'app';
import BrowserWindow from 'browser-window';
import rimraf from 'rimraf';
import path from 'path';
import powerSaveBlocker from 'power-save-blocker';
import ipc from 'ipc';
import yargs from 'yargs';

const args = yargs(process.argv.slice(1)).wrap(100).argv;
const startupTime = new Date().getTime();
var powerSaveBlockerState = false;

const parseTime = s => {
    var ms = s % 1000;
    s = (s - ms) / 1000;
    var secs = s % 60;
    s = (s - secs) / 60;
    var mins = s % 60;
    return mins + ' minutes ' + secs + '.' + ms + ' seconds';
}

ipc.on('app:startup', (event, time) => {
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
        mainWindow.show();
        mainWindow.toggleDevTools();
        mainWindow.focus();
        console.info('Dev Mode Active: Developer Tools Enabled.');
    }

    mainWindow.loadUrl('file://' + path.join(__dirname, '../index.html'));


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

    ipc.on('app:get:fullscreen', (event) => {
        event.returnValue = mainWindow.isFullScreen();
    });

    ipc.on('app:get:maximized', (event) => {
        event.returnValue = mainWindow.isMaximized();
    });

    ipc.on('app:fullscreen', (event, state) => mainWindow.setFullScreen(state));

    ipc.on('app:maximize', (event, state) => {
        state ? mainWindow.maximize() : mainWindow.unmaximize();
    });

    ipc.on('app:alwaysOnTop', (event, state) => mainWindow.setAlwaysOnTop(state));

    ipc.on('app:setThumbarButtons', (event, buttons) => mainWindow.setThumbarButtons(buttons));

    ipc.on('app:bitchForAttention', (event, state = true) => {
        if (!mainWindow.isFocused())
            mainWindow.flashFrame(state);
    });

    ipc.on('app:powerSaveBlocker', (event, state) => {
        let enablePowerBlock = () => {
            powerSaveBlockerState = powerSaveBlocker.start('prevent-display-sleep');
        };
        let disablePowerBlock = () => {
            if (powerSaveBlockerState)
                powerSaveBlocker.stop(powerSaveBlockerState);
        };

        state ? enablePowerBlock() : disablePowerBlock();
    });

    ipc.on('app:toggleDevTools', () => {
        mainWindow.show();
        mainWindow.toggleDevTools();
        mainWindow.focus();
        console.info('Developer Tools Toggled.');
    });

    ipc.on('app:get:powerSaveBlocker', (event) => {
        event.returnValue = powerSaveBlockerState ? powerSaveBlocker.isStarted(powerSaveBlockerState) : false;
    });

    ipc.on('app:close', app.quit);

});

app.on('window-all-closed', app.quit);


app.on('will-quit', () => {
    try {
        rimraf.sync(path.join(app.getPath('temp'), 'Powder-Player'));
    } catch (e) {
        console.error(e);
    }
});