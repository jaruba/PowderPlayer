import MetaInspector from 'node-metainspector';
import PlayerActions from '../actions';
import PlayerStore from '../store';
import needle from 'needle';
import _ from 'lodash';



class supportedLinks {
    isSupportedLink(link) {

        if (link.includes('youtube.com/watch?v=')) {
            return true;
        }

        if (link.includes('vimeo.com/')) {

            var simpler = link.substr(link.indexOf('vimeo.com/') + 10);

            if (simpler.includes('?'))
                simpler = simpler.substr(0, simpler.indexOf('?'));

            if (simpler.includes('#'))
                simpler = simpler.substr(0, simpler.indexOf('#'));

            if (!isNaN(simpler)) return true;

        }

        if (link.includes('soundcloud.com')) {

            if (link.includes('?q=')) return false;

            if (link.includes('/search/')) return false;

            if (link.includes('/groups/')) return false;

            if (link.includes('/popular/')) return false;

            if ((link.match(/\//g) || []).length == 4) return true;

            if ((link.match(/\//g) || []).length == 5 && link.includes('/sets/')) return true;

        }

        return false;
    }


    iframeToLink(el) {

        if (el.includes('youtube.com/embed/')) {
            el = el.substr(el.indexOf('youtube.com/embed/') + 18);
            if (el.includes('?'))
                el = el.substr(0, el.indexOf('?'));

            el = 'https://www.youtube.com/watch?v=' + el;
        }

        if (el.includes('player.vimeo.com/video/')) {
            el = el.substr(el.indexOf('player.vimeo.com/video') + 23);
            if (el.includes('?'))
                el = el.substr(0, el.indexOf('?'));

            el = 'https://vimeo.com/' + el;
        }

        return el;
    }


    handleURL(parsed) {
        return new Promise((resolve, reject) => {
            if (!this.isSupportedLink(parsed.url)) {

                var client = new MetaInspector(parsed.url, {
                    timeout: 5000
                });

                client.on("fetch", () => {
                    var newFiles = [];
                    var noDupes = [];
                    var links = [];

                    if (client.links.absolute) {
                        if (client.links.absolute.http && client.links.absolute.https)
                            links = client.links.absolute.http.concat(client.links.absolute.https);
                        else if (client.links.absolute.http)
                            links = client.links.absolute.http;
                        else if (client.links.absolute.https)
                            links = client.links.absolute.https;
                    }

                    var iframes = client.iframes;

                    var queueParser = [];

                    links.forEach((el, ij) => {
                        if (noDupes.indexOf(el) == -1 && this.isSupportedLink(el)) {
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

                    client.host = client.host.replace('www.', '');

                    if (['soundcloud.com', 'youtube.com', 'vimeo.com'].indexOf(client.host) > -1) {
                        var relatives = client.links.relative;
                        relatives.forEach((el, ij) => {
                            el = 'https://' + client.host + el;

                            if (noDupes.indexOf(el) == -1 && this.isSupportedLink(el)) {

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

                    iframes.forEach((el, ij) => {

                        el = this.iframeToLink(el);

                        if (noDupes.indexOf(el) == -1 && this.isSupportedLink(el)) {
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
                    resolve([newFiles, queueParser]);

                });

                client.on("error", reject);

                client.fetch();

            } else {
                PlayerActions.addPlaylist([{
                    uri: parsed.url,
                    title: parsed.title
                }]);
            }
        });
    }

    fixVimeo(wcjs, lastItem, itemDesc) {

        var url = itemDesc.mrl;

        wcjs.stop();

        needle.get(url, function(error, response) {
            if (!error && response.statusCode == 200) {
                var bestMRL;

                // this can also be used to make a quality selector
                // currently selecting 720p or best
                response.body.request.files.progressive.some(el => {
                    if (el.quality == '720p') {
                        bestMRL = el.url;
                        return true;
                    } else {
                        bestMRL = el.url;
                        return false;
                    }
                });

                var image;

                if (response.body.video.thumbs && response.body.video.thumbs.base)
                    image = response.body.video.thumbs.base + '_320.jpg';

                // player.playlist.clear();

                PlayerActions.replaceMRL({
                    x: lastItem,
                    mrl: {
                        title: response.body.video.title,
                        uri: bestMRL
                    }
                });

                wcjs.playlist.playItem(lastItem);

                if (document.getElementById('item' + lastItem)) {
                    document.getElementById('item' + lastItem).style.background = "url('" + image + "')";
                    document.getElementById('itemTitle' + lastItem).innerHTML = response.body.video.title;
                }
                if (image)
                    _.delay(() => {
                        PlayerActions.setDesc({
                            idx: lastItem,
                            image: image
                        });
                    }, 500);
            }
        });

    }
}

export
default supportedLinks;