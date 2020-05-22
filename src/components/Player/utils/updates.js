import notifier from 'node-notifier';
import needle from 'needle';
import path from 'path';
import ls from 'local-storage';
import fs from 'fs';
import {
    shell
} from 'electron';

module.exports = {
    checkUpdates: () => {
        setTimeout(function() {
            ls('version', '1.60');
            if (!ls.isSet('updateCheck')) ls('updateCheck', 0);
            
            // announce update every 3 days
            if (ls('updateCheck') < Math.floor(Date.now() / 1000) - 259200 && !window.noUpdate) {
                needle.get('https://powder.media/version', (err, res) => {
                    if (!err && res.body && res.body.length < 100 && res.body.includes && res.body.includes('|')) {
                        var vers = new TextDecoder("utf-8").decode(res.body).split('|');
                        if (vers[0] == ls('version')) {
                            ls('updateCheck', Math.floor(Date.now() / 1000));
                        } else {
    //                        var iconPath = path.join(__dirname, '../../../../images/icons/powder-icon-padding.png');
    //                        if (!fs.accessSync(iconPath, fs.F_OK))
    //                            iconPath = path.join(__dirname, '../../../../../images/icons/powder-icon-padding.png');

                            notifier.notify({
                                title: 'Powder v' + vers[0] + ' Available',
                                message: 'Includes awesome new features!',
    //                            icon: iconPath,
                                sound: true,
                                wait: true
                            }, (err, response) => {
                                if (!err) {
                                    ls('updateCheck', Math.floor(Date.now() / 1000));
                                    if (response == 'activate')
                                        shell.openExternal(vers[1]);
                                }
                            });
                        }
                    }
                });
            }
        }, 3000)
    }
}
