import request from 'request';
import fs from 'fs';
import path from 'path';
import externalActions from '../actions/externalActions';


module.exports = {
    getVersion: function() {
        var appVersion = 'Powder Player v' + require('../../package.json').version;
        externalActions.gotVersion(appVersion);
        return appVersion;
    },

    getLicense: function() {
        request('https://raw.githubusercontent.com/jaruba/PowderPlayer/master/LICENSE', function(error, response, body) {
            if (!error && response.statusCode == 200)
                externalActions.gotLicense(body);
            else
                fs.readFile(path.normalize(path.join(__dirname, '../../', 'LICENSE')), function(err, data) {
                    if (err) return console.log(err);
                    externalActions.gotLicense(data);
                })
        });
    }
};