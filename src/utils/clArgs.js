import ModalActions from '../components/Modal/actions';
import PlayerActions from '../components/Player/actions';
import parser from '../components/Player/utils/parser';
import sorter from '../components/Player/utils/sort';
import metaParser from '../components/Player/utils/metaParser';
import TorrentActions from '../actions/torrentActions';
import MessageActions from '../components/Message/actions';
import linkUtil from './linkUtil';
import _ from 'lodash';
import url from 'url';
import path from 'path';

var getParam = (el, arg) => {
    return el.replace(arg + '=', '').split('"').join('');
}

function startWebApi(el) {
    const getPort = require('get-port')
    getPort({ port: (el.includes('=') ? parseInt(el.split('=')[1]) : 5090) }).then(port => {
        const express = require('express')
        const app = express()
        const player = require('../components/Player/utils/player')

        function err(res, msg) {
            res.writeHead(500)
            res.send(msg || 'api error')
        }

        app.get('/play', (req, res) => {
            if (((player || {}).wcjs || {}).play) {
                player.wcjs.play()
                res.send('success')
            } else err(res)
        })

        app.get('/pause', (req, res) => {
            if (((player || {}).wcjs || {}).pause) {
                player.wcjs.pause()
                res.send('success')
            } else err(res)
        })

        app.get('/toggle_pause', (req, res) => {
            if (((player || {}).wcjs || {}).togglePause) {
                player.wcjs.togglePause()
                res.send('success')
            } else err(res)
        })

        app.get('/next', (req, res) => {
            if ((player || {}).next) {
                player.next()
                res.send('success')
            } else err(res)
        })

        app.get('/prev', (req, res) => {
            if ((player || {}).prev) {
                player.prev()
                res.send('success')
            } else err(res)
        })

        app.get('/item_data', (req, res) => {
            if ((player || {}).itemDesc && ((((player || {}).wcjs || {}).playlist || {}).items || [])[0]) {

                res.setHeader('Content-Type', 'application/json; charset=utf-8')

                res.send(JSON.stringify(player.itemDesc()))

            } else err(res)
        })

        app.get('/playlist', (req, res) => {
            if (((((player || {}).wcjs || {}).playlist || {}).items || [])[0]) {
                var items = []

                for (i = 0; i < player.wcjs.playlist.items.count; i++)
                    items.push(player.itemDesc(i))

                res.setHeader('Content-Type', 'application/json; charset=utf-8')

                res.send(JSON.stringify(items))
            } else err(res)
        })

        app.get('/progress', (req, res) => {
            if (((player || {}).wcjs || {}).position) {
                res.setHeader('Content-Type', 'application/json; charset=utf-8')

                res.send(JSON.stringify({ position: player.wcjs.position }))
            } else err(res)
        })

        app.get('/set_progress', (req, res) => {
            if (req.query.value && ((player || {}).wcjs || {}).position) {
                player.wcjs.position = parseFloat(req.query.value)

                res.send('success')
            } else err(res)
        })

        app.get('/time', (req, res) => {
            if (((player || {}).wcjs || {}).time) {
                res.setHeader('Content-Type', 'application/json; charset=utf-8')

                res.send(JSON.stringify({ time: player.wcjs.time }))
            } else err(res)
        })

        app.get('/set_time', (req, res) => {
            if (req.query.value && ((player || {}).wcjs || {}).time) {
                player.wcjs.time = parseInt(req.query.value)

                res.send('success')
            } else err(res)
        })

        app.get('/jump_forward', (req, res) => {
            if (req.query.value && ((player || {}).wcjs || {}).time && player.wcjs.length) {
                const jumpTime = parseInt(req.query.value)

                const newTime = player.wcjs.time + jumpTime

                if (newTime < player.wcjs.length)
                    player.wcjs.time = newTime
                else
                    player.wcjs.time = player.wcjs.length - 1000

                res.send('success')
            } else err(res)
        })

        app.get('/jump_backward', (req, res) => {
            if (req.query.value && ((player || {}).wcjs || {}).time && player.wcjs.length) {
                const jumpTime = parseInt(req.query.value)

                const newTime = player.wcjs.time - jumpTime

                if (newTime > 0)
                    player.wcjs.time = newTime
                else
                    player.wcjs.time = 0

                res.send('success')
            } else err(res)
        })

        app.get('/duration', (req, res) => {
            if (((player || {}).wcjs || {}).length) {
                res.setHeader('Content-Type', 'application/json; charset=utf-8')

                res.send(JSON.stringify({ duration: player.wcjs.length }))
            } else err(res)
        })

        app.get('/volume', (req, res) => {
            if (typeof ((player || {}).wcjs || {}).volume !== 'undefined') {
                res.setHeader('Content-Type', 'application/json; charset=utf-8')

                res.send(JSON.stringify({ volume: player.wcjs.volume }))
            } else err(res)
        })

        app.get('/set_volume', (req, res) => {
            if (req.query.value && typeof ((player || {}).wcjs || {}).volume !== 'undefined') {
                player.wcjs.volume = parseInt(req.query.value)

                res.send('success')
            } else err(res)
        })

        app.get('/muted', (req, res) => {
            if (typeof ((player || {}).wcjs || {}).mute !== 'undefined') {
                res.setHeader('Content-Type', 'application/json; charset=utf-8')

                res.send(JSON.stringify({ muted: player.wcjs.mute }))
            } else err(res)
        })

        app.get('/set_mute', (req, res) => {
            if (req.query.value && typeof ((player || {}).wcjs || {}).mute !== 'undefined') {
                player.wcjs.mute = req.query.value == 'false' ? false : true

                res.send('success')
            } else err(res)
        })

        app.get('/toggle_mute', (req, res) => {
            if (((player || {}).wcjs || {}).toggleMute) {
                player.wcjs.toggleMute()

                res.send('success')
            } else err(res)
        })

        app.get('/state', (req, res) => {
            if (((player || {}).wcjs || {}).state) {
                const states = ['NothingSpecial', 'Opening', 'Buffering', 'Playing', 'Paused', 'Stopped', 'Ended', 'Error']
                res.setHeader('Content-Type', 'application/json; charset=utf-8')

                res.send(JSON.stringify({ state: states[player.wcjs.state] }))
            } else err(res)
        })

        app.get('/add_playlist', (req, res) => {
            const isPlayer = !!(player && player.wcjs && player.wcjs.playlist && player.wcjs.playlist.itemCount)
            if (req.query.url) {

                if (isPlayer)
                    window.playerDrop({ preventDefault: () => {}, dataTransfer: { files: [], getData: function() { return req.query.url } } })
                else
                    window.mainmenuDrop(null, { preventDefault: () => {}, dataTransfer: { files: [], getData: function() { return req.query.url } } })


                res.send('success')

            } else if (req.query.file) {

                var files = []

                files.push({
                    path: req.query.file,
                    name: req.query.file.replace(/^.*[\\\/]/, '')
                })

                if (isPlayer)
                    window.playerDrop({ dataTransfer: { files: files }, preventDefault: () => {} })
                else
                    window.mainmenuDrop(files)

                res.send('success')

            } else err(res)
        })

        app.listen(port, () => console.log(`Web API listening on port ${port}!`))
    }).catch(err => {
        console.log('Error: Could not start Web API')
        console.error(err)
    })
}

module.exports = {
    process: (args) => {
        if (args.length) {
//            console.log(args);
            var files = [];
            args.forEach( el => {
                if (el.startsWith('--')) {
                    // command line args
                    if (el == '--fs') {
                        window.clFullscreen = true;
                    } else if (el.startsWith('--sub-file=')) {
                        window.clSub = getParam(el, '--sub-file');
                    } else if (el.startsWith('--title=')) {
                        window.clTitle = getParam(el, '--title');
                        if (window.getExtendedDetails) {
                            window.extendedTitle = window.clTitle
                        }
                    } else if (el.startsWith('--no-update-check')) {
                        window.noUpdate = true
                    } else if (el == '--get-extended') {
                        if (window.clTitle) {
                            window.extendedTitle = window.clTitle
                        }
                        window.getExtendedDetails = true
                    } else if (el.startsWith('--web-api')) {
                        startWebApi(el)
                    }
                } else {
                    if (path.isAbsolute(el)) {
                        // local file
                        if (el.endsWith('.torrent')) {
                            ModalActions.open({
                                type: 'thinking'
                            });
            
                            TorrentActions.addTorrent(el);
                        } else {
                            files.push({
                                name: parser(el).filename(),
                                path: el
                            });
                        }
                    } else if (url.parse(el).protocol) {
                        // url
                        ModalActions.open({
                            title: 'Thinking',
                            type: 'thinking'
                        });
        
                        linkUtil(el).then(url => {
                            ModalActions.close();
                            if (window.getExtendedDetails) {

                                if (window.extendedTitle) {

                                    var extTitle = window.extendedTitle
                                    _.delay(() => {
                                        metaParser.push({ idx: 0, filename: extTitle + '.mp4' });
                                    },1000);

                                }

                            }
                        }).catch(error => {
                            ModalActions.close();
                            MessageActions.open(error.message);
                        });
                    }
                }
            });
            
            if (files.length) {
                // if local files wore found, load them

                var newFiles = [];
                var queueParser = [];

                var anyShortSz = files.some(function(el) {
                    if (parser(el.name).shortSzEp())
                        return true
                })

                if (anyShortSz)
                    files = sorter.episodes(files, 2);
                else
                    files = sorter.naturalSort(files, 2);

                files.forEach( (file, ij) => {
                    newFiles.push({
                        title: parser(file.name).name(),
                        uri: 'file:///'+file.path,
                        path: file.path
                    });
                    queueParser.push({
                        idx: ij,
                        url: 'file:///'+file.path,
                        filename: file.name
                    });
                });

                PlayerActions.addPlaylist(newFiles);

                // start searching for thumbnails after 1 second
                _.delay(() => {
                    queueParser.forEach( el => {
                        metaParser.push(el);
                    });
                },1000);

            }
        }
    }
}
