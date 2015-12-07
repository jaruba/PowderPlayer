import MetaInspector from 'node-metainspector';

var linker = {};

linker.isSupportedLink = link => {

    if (link.indexOf('youtube.com/watch?v=') > -1) {
        return true;
    }

    if (link.indexOf('vimeo.com/') > -1) {

        var simpler = link.substr(link.indexOf('vimeo.com/')+10);

        if (simpler.indexOf('?') > -1) {
            simpler = simpler.substr(0, simpler.indexOf('?'));
        }

        if (simpler.indexOf('#') > -1) {
            simpler = simpler.substr(0, simpler.indexOf('#'));
        }

        if (!isNaN(simpler)) return true;

    }

    if (link.indexOf('soundcloud.com') > -1) {

        if (link.indexOf('?q=') > -1) return false;

        if (link.indexOf('/search/') > -1) return false;

        if (link.indexOf('/groups/') > -1) return false;

        if (link.indexOf('/popular/') > -1) return false;

        if ((link.match(/\//g) || []).length == 4) return true;

        if ((link.match(/\//g) || []).length == 5 && link.indexOf('/sets/')) return true;

    }

    return false;
};

linker.iframeToLink = el => {

    if (el.indexOf('youtube.com/embed/') > -1) {
        el = el.substr(el.indexOf('youtube.com/embed/')+18);
        if (el.indexOf('?') > -1) {
            el = el.substr(0,el.indexOf('?'));
        }
        el = 'https://www.youtube.com/watch?v='+el;
    }

    if (el.indexOf('player.vimeo.com/video/') > -1) {
        el = el.substr(el.indexOf('player.vimeo.com/video')+23);
        if (el.indexOf('?') > -1) {
            el = el.substr(0,el.indexOf('?'));
        }
        el = 'https://vimeo.com/'+el;
    }

    return el;

};

linker.handleURL = (parsed, cb) => {
//    console.log(parsed.url);
    if (!linker.isSupportedLink(parsed.url)) {

        var client = new MetaInspector(parsed.url, { timeout: 5000 });

        client.on("fetch", function(){

//            console.log(client);

            var newFiles = [];
            var noDupes = [];
            var links = [];

            if (client.links.absolute) {
                if (client.links.absolute.http && client.links.absolute.https) {
                    links = client.links.absolute.http.concat(client.links.absolute.https);
                } else if (client.links.absolute.http) {
                    links = client.links.absolute.http;
                } else if (client.links.absolute.https) {
                    links = client.links.absolute.https;
                }
            }

            var iframes = client.iframes;

            var queueParser = [];

            links.forEach( (el, ij) => {
                if (noDupes.indexOf(el) == -1 && linker.isSupportedLink(el)) {
                    queueParser.push({
                        idx: ij,
                        url: el
                    });
                    newFiles.push({
                        uri: el
                    });
                }
                noDupes.push(el);
            });

            client.host = client.host.replace('www.','');

            if (['soundcloud.com', 'youtube.com', 'vimeo.com'].indexOf(client.host) > -1) {
                var relatives = client.links.relative;
                relatives.forEach( (el, ij) => {
                    el = 'https://'+client.host+el;
//                    console.log(el);
                    if (noDupes.indexOf(el) == -1 && linker.isSupportedLink(el)) {
//                        console.log("ADDING: "+el);
                        queueParser.push({
                            idx: ij,
                            url: el
                        });
                        newFiles.push({
                            uri: el
                        });
                    }
                    noDupes.push(el);
                });
            }

            iframes.forEach( (el, ij) => {

                el = linker.iframeToLink(el);

                if (noDupes.indexOf(el) == -1 && linker.isSupportedLink(el)) {
                    queueParser.push({
                        idx: ij,
                        url: el
                    });
                    newFiles.push({
                        uri: el
                    });
                }
                noDupes.push(el);
            });

            cb(newFiles, queueParser);

        });

        client.on("error", function(err){
            cb([], []);
        });

        client.fetch();

    } else {
        PlayerActions.addPlaylist([{
            uri: parsed.url,
            title: parsed.title
        }]);
    }
};

module.exports = linker;
