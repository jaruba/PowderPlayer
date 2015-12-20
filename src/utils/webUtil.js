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
};