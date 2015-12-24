export
default {
    disableGlobalBackspace() {
        document.onkeydown = (e = window.event) => {
            var doPrevent;
            if (e.keyCode === 8) {
                var d = e.srcElement || e.target;
                if (d.tagName.toUpperCase() === 'INPUT' || d.tagName.toUpperCase() === 'TEXTAREA')
                    doPrevent = d.readOnly || d.disabled;
                else
                    doPrevent = true;
            } else
                doPrevent = false;
            if (doPrevent)
                e.preventDefault();
        };
    },
    checkInternet: function(cb) {
        require('dns').lookup('google.com',function(err) {
            if (err && err.code == "ENOTFOUND")
                cb(false);
            else
                cb(true);
        })
    },
};