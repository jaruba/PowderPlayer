var WebUtil = {
    addLiveReload: function() {
        var head = document.getElementsByTagName('head')[0];
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = 'http://localhost:35729/livereload.js';
        head.appendChild(script);
    },
    disableGlobalBackspace: function() {
        document.onkeydown = function(e) {
            e = e || window.event;
            var doPrevent;
            if (e.keyCode === 8) {
                var d = e.srcElement || e.target;
                if (d.tagName.toUpperCase() === 'INPUT' || d.tagName.toUpperCase() === 'TEXTAREA') {
                    doPrevent = d.readOnly || d.disabled;
                } else {
                    doPrevent = true;
                }
            } else {
                doPrevent = false;
            }
            if (doPrevent) {
                e.preventDefault();
            }
        };
    },
};

module.exports = WebUtil;