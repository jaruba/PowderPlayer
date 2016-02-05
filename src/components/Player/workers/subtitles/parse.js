function toSeconds(t){
    var s = 0.0;
    if (t) {
        var p = t.split(':');
        t.split(':').forEach( el => {
            s = s * 60 + parseFloat( el.replace(',', '.') );
        });
    }
    return s;
}

var processSub = (srt, extension, cb) => {
    
    var parsedSub = [];
    
    if (extension.toLowerCase() == "srt" || extension.toLowerCase() == "vtt") {

        srt = srt.replace(/\r\n|\r|\n/g, '\n').trim();

        var srty = srt.split('\n\n'),
            si = 0;
        
        if (srty[0].substr(0,6).toLowerCase() == "webvtt") si = 1;

        for (var s = si; s < srty.length; s++) {
            var st = srty[s].split('\n');
            if (st.length >=2) {
                var n = -1;
                if (st[0].indexOf(' --> ') > -1) var n = 0;
                else if (st[1].indexOf(' --> ') > -1) var n = 1;
                else if (st[2].indexOf(' --> ') > -1)  var n = 2;
                else if (st[3].indexOf(' --> ') > -1)  var n = 3;
                if (n > -1) {
                    var stOrigin = st[n]
                    var is = Math.round(toSeconds(stOrigin.split(' --> ')[0].trim()));
                    var os = Math.round(toSeconds(stOrigin.split(' --> ')[1].trim()));
                    var t = st[n+1];
                    if (st.length > n+2) for (var j=n+2; j<st.length; j++) t = t + '\n'+st[j];
                    parsedSub[is] = {i:is, o: os, t: t};
                }
            }
        }
    } else if (extension.toLowerCase() == "sub") {
        srt = srt.replace(/\r\n|\r|\n/g, '\n');
        
        srt = srt.trim();
        var srty = srt.split('\n');

        var s = 0;
        for (s = 0; s < srty.length; s++) {
            var st = srty[s].split('}{');
            if (st.length >=2) {
              var is = Math.round(st[0].substr(1) /10);
              var os = Math.round(st[1].split('}')[0] /10);
              var t = st[1].split('}')[1].replace('|', '\n');
              if (is != 1 && os != 1) parsedSub[is] = {i:is, o: os, t: t};
            }
        }
    }

    if (parsedSub)
        cb(parsedSub);
    else
        cb(null);
}

self.onmessage = msg => {
    var cb = subs => {
        postMessage(subs);
    };
    processSub(msg.data.srt, msg.data.extension, cb);
}
