import notifier from 'node-notifier';
import path from 'path';
import _ from 'lodash';

module.exports = {
    notify: function(notifyparams, clickFunction) {
        notifyparams = _.defaults(notifyparams, {
            icon: path.join(__dirname, '../../', 'images/icons/logo.png'),
            message: '',
            sound: false,
            wait: false
        });
        notifier.notify(notifyparams);
        if (clickFunction)
            notifier.on('click', clickFunction);
    }

};