import child from 'child_process';
import fs from 'fs';
import {
    shell
}
from 'electron';
import {
    app
} from 'remote';
const dataPath = app.getPath('userData');
import player from '../components/Player/utils/player';
import regFileW32 from './regFileWin';
import path from 'path';
import supported from './isSupported';
import MessageActions from '../components/Message/actions';
import duti from 'duti-prebuilt';

var notify = () => {
    try {
        player.notifier.info('Associated', '', 4000);
    } catch(e) {
        MessageActions.open('Associated');
    }
}

var register = {};

register._writeDesktopFile = cb => {
    var powderPath = process.execPath.substr(0,process.execPath.lastIndexOf("/")+1);
    fs.writeFile(dataPath + '/powder.desktop', '[Desktop Entry]\n'+
        'Version=1.0\n'+
        'Name=Powder Player\n'+
        'Comment=Powder Player is a hybrid between a Torrent Client and a Player (torrent streaming)\n'+
        'Exec=' + process.execPath + ' %U\n'+
        'Path=' + powderPath + '\n'+
        'Icon=' + powderPath + 'icon.png\n'+
        'Terminal=false\n'+
        'Type=Application\n'+
        'MimeType=application/x-bittorrent;x-scheme-handler/magnet;x-scheme-handler/pow;video/avi;video/msvideo;video/x-msvideo;video/mp4;video/x-matroska;video/mpeg;\n'+
        '', cb);
};

register.torrent = () => {
    if (process.platform == 'linux') {
        this._writeDesktopFile(err => {
            if (err) throw err;
            var desktopFile = dataPath+'/powder.desktop';
            var tempMime = 'application/x-bittorrent';
            child.exec('gnome-terminal -x bash -c "echo \'Associating Files or URls with Applications requires Admin Rights\'; echo; sudo echo; sudo echo \'Authentication Successful\'; sudo echo; sudo mv -f '+desktopFile+' /usr/share/applications; sudo xdg-mime default powder.desktop '+tempMime+'; sudo gvfs-mime --set '+tempMime+' powder.desktop; echo; echo \'Association Complete! Press any key to close ...\'; read" & disown');
        });
    } else if (process.platform == 'darwin') {
        var powderPath = process.execPath.substr(0,process.execPath.lastIndexOf("/")+1)+"../../../../Resources/app.nw/";
        duti('media.powder.player', '.torrent', 'viewer');
    } else {
        var iconPath = process.execPath;
        regFileW32('.torrent', 'powder.player.v1', 'BitTorrent Document', iconPath, [ process.execPath ]);
    }
    notify();
};

register.videos = () => {
    if (process.platform == 'linux') {
        this._writeDesktopFile(err => {
            if (err) throw err;
            var desktopFile = dataPath+'/powder.desktop';
            var tempMimes = ['video/avi','video/msvideo','video/x-msvideo','video/mp4','video/x-matroska','video/mpeg'];
            var tempString = '';
            tempMimes.forEach(el => {
                tempString += '; sudo xdg-mime default powder.desktop '+el+'; sudo gvfs-mime --set '+el+' powder.desktop';
            });
            child.exec('gnome-terminal -x bash -c "echo \'Associating Files or URls with Applications requires Admin Rights\'; echo; sudo echo; sudo echo \'Authentication Successful\'; sudo echo; sudo mv -f '+desktopFile+' /usr/share/applications'+tempString+'; echo; echo \'Association Complete! Press any key to close ...\'; read" & disown');
        });
    } else if (process.platform == 'darwin') {
        var powderPath = process.execPath.substr(0,process.execPath.lastIndexOf("/")+1)+"../../../../Resources/app.nw/";
        supported.ext.video.forEach( el => {
            duti('media.powder.player', el, 'viewer');
        });
    } else {
        var iconPath = process.execPath;
        supported.ext.video.forEach( el => {
            regFileW32(el, 'powder.player.v1', el.substr(1).toUpperCase() + ' Document', iconPath, [ process.execPath ]);
        });
    }
    notify();
};

register.magnet = () => {
    if (process.platform == 'linux') {
        this._writeDesktopFile(err => {
            if (err) throw err;
            var desktopFile = dataPath+'/powder.desktop';
            var tempMime = 'x-scheme-handler/magnet';
            child.exec('gnome-terminal -x bash -c "echo \'Associating Files or URls with Applications requires Admin Rights\'; echo; sudo echo; sudo echo \'Authentication Successful\'; sudo echo; sudo mv -f '+desktopFile+' /usr/share/applications; sudo xdg-mime default powder.desktop '+tempMime+'; sudo gvfs-mime --set '+tempMime+' powder.desktop; echo; echo \'Association Complete! Press any key to close ...\'; read" & disown');
        });
    } else if (process.platform == 'darwin') {
        duti('media.powder.player', 'magnet');
    } else {
        app.setAsDefaultProtocolClient('magnet');
    }
    notify();
};

register.powLinks = () => {
    if (process.platform == 'linux') {
        this._writeDesktopFile(err => {
            if (err) throw err;
            var desktopFile = dataPath+'/powder.desktop';
            var tempMime = 'x-scheme-handler/pow';
            child.exec('gnome-terminal -x bash -c "echo \'Associating Files or URls with Applications requires Admin Rights\'; echo; sudo echo; sudo echo \'Authentication Successful\'; sudo echo; sudo mv -f '+desktopFile+' /usr/share/applications; sudo xdg-mime default powder.desktop '+tempMime+'; sudo gvfs-mime --set '+tempMime+' powder.desktop; echo; echo \'Association Complete! Press any key to close ...\'; read" & disown');
        });
    } else if (process.platform == 'darwin') {
        duti('media.powder.player', 'pow');
    } else {
        app.setAsDefaultProtocolClient('pow');
    }
    notify();
};

module.exports = register;