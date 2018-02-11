// !!! TODO:
// - handle negatives (social networks)
// - google drive folders that include other folders

import {
    app
} from 'remote';
import fs from 'fs';
import mkdirp from 'mkdirp';
import path from 'path';
import ls from 'local-storage';
import request from 'request';
import events from 'events';

var negatives, templates, subPages, siteSupport, pornSupport;

function generateExtractor(elem, temp) {
    temp = JSON.parse(JSON.stringify(temp));

    temp.name = elem.name;
    temp.tags = elem.tags;

    temp.checkFor = elem.checkFor ? elem.checkFor : temp.checkFor;

    temp.match = elem.match ? elem.match : temp.match;
    temp.search = elem.search ? elem.search : temp.search;
    temp.feed = elem.feed ? elem.feed : temp.feed;
    
    temp.priority = elem.priority ? elem.priority : temp.priority ? temp.priority : 0;

    temp.match = temp.match.replace('%r', elem.replacer);

    if (temp.search && temp.search.searcher)
        temp.search.searcher = temp.search.searcher.replace('%r', elem.replacer);

    if (temp.feed)
        temp.feed = temp.feed.replace('%r', elem.replacer);
        
    if (elem.useBackupImage) temp.useBackupImage = true;
    
    if (elem.shortcut && temp.search) temp.search.shortcut = elem.shortcut;
        
    return temp;
}

var plugins = {
    events: new events.EventEmitter(),
    load: () => {
        if (ls('pluginsUpdate')) {
            const pluginPath = path.join(app.getPath('userData'), 'plugins');
            negatives = require(path.join(pluginPath, 'negatives'));
            templates = require(path.join(pluginPath, 'plugin-templates'));
            subPages = require(path.join(pluginPath, 'sub-plugins'));
            siteSupport = require(path.join(pluginPath, 'all-plugins'));
            pornSupport = require(path.join(pluginPath, 'adult-plugins'));
            
            var myPlugins = ls('myPlugins');
            if (myPlugins.length) {
                // tag installed plugins
                siteSupport.forEach( (el, ij) => {
                    if (myPlugins.indexOf(el.name) > -1)
                        siteSupport[ij].tags.push('installed');

                    if (el.templetor)
                        subPages[el.templetor].forEach( (elm, ijk) => {
                            if (myPlugins.indexOf(elm.name) > -1)
                                subPages[el.templetor][ijk].tags.push('installed');
                        });
                });
                
                if (ls('adultContent'))
                    pornSupport.forEach( (el, ij) => {
                        if (myPlugins.indexOf(el.name) > -1)
                            pornSupport[ij].tags.push('installed');
                    });

            }
            console.log('Plugins Loaded');
        } else {
            console.log('Plugins Not Available');
        }
    },
    install: name => {

        var myPlugins = ls('myPlugins');
        myPlugins.push(name);
        ls('myPlugins', myPlugins);

        var installed = siteSupport.some( (el, ij) => {
            if (name == el.name) {
                siteSupport[ij].tags.push('installed');
                return true;
            }

            if (el.templetor) {
                return subPages[el.templetor].some( (elm, ijk) => {
                    if (name == elm.name) {
                        subPages[el.templetor][ijk].tags.push('installed');
                        return true;
                    } else return false;
                });
            }
                
            return false;
        });
        
        if (!installed && ls('adultContent'))
            pornSupport.some( (el, ij) => {
                if (name == el.name) {
                    pornSupport[ij].tags.push('installed');
                    return true;
                } else return false;
            });
    },
    uninstall: name => {
        var myPlugins = [];
        var myOldPlugins = ls('myPlugins');
        myOldPlugins.forEach( el => {
            if (el != name) myPlugins.push(el);
        });
        ls('myPlugins', myPlugins);
        
        var removed = siteSupport.some( (el, ij) => {
            if (name == el.name) {
                var newTags = [];

                siteSupport[ij].tags.forEach( tag => {
                    if (tag != 'installed')
                        newTags.push(tag);
                });
                
                siteSupport[ij].tags = newTags;
                return true;
            }

            if (el.templetor) {
                return subPages[el.templetor].some( (elm, ijk) => {
                    if (name == elm.name) {
                        var newTags = [];
                        subPages[el.templetor][ijk].tags.forEach( tag => {
                            if (tag != 'installed')
                                newTags.push(tag);
                        });
                        subPages[el.templetor][ijk].tags = newTags;
                        return true;
                    } else return false;
                });
            }
                
            return false;
        });
        
        if (!removed && ls('adultContent'))
            pornSupport.some( (el, ij) => {
                if (name == el.name) {
                    var newTags = [];
                    pornSupport[ij].tags.forEach( tag => {
                        if (tag != 'installed')
                            newTags.push(tag);
                    });
                    pornSupport[ij].tags = newTags;
                    return true;
                } else return false;
            });
    },
    update: () => {
        if (!ls.isSet('pluginLogos')) ls('pluginLogos', {});
        if (!ls.isSet('myPlugins')) ls('myPlugins', []);
        if (!ls.isSet('pluginsUpdate')) ls('pluginsUpdate', 0);
        if (ls('pluginsUpdate') < (Date.now() / 1000) - 1209600) {
            // re-download every 2 weeks
            var userData = app.getPath('userData');
            var pluginsUpdate = () => {
                var pluginPaths = ['all-plugins', 'sub-plugins', 'plugin-templates', 'negatives', 'adult-plugins'];
                var updated = 0;
                pluginPaths.forEach( el => {
                    request('http://powder.media/plugins/' + el + '.js', function (error, response, body) {
                        if (!error && response.statusCode == 200 && body && body.startsWith('module.exports'))
                            fs.writeFile(path.join(userData, 'plugins', el + '.js'), body, function (err) {
                                if (!err) updated++;
                                if (updated == pluginPaths.length) {
                                    // all plugins updated successfully
                                    ls('pluginsUpdate', Math.floor(Date.now() / 1000));
                                    plugins.load();
                                }
                            });
                    })
                });
            };
            fs.access(path.join(userData, 'plugins'), fs.F_OK, function(err) {
                if (err)
                    mkdirp(path.join(userData, 'plugins'), function(err) { 
                        if (!err) pluginsUpdate();
                        else plugins.load();
                    });
                else pluginsUpdate();
            });
        } else plugins.load();
    },
    matchWith: (feed, tag) => {
        var results = [];
        feed.forEach( el => {
            if (el.tags.indexOf(tag) > -1)
                results.push(el);
        });
        return results;
    },

    fetchByName: terms => {

        var results = [];

        if (!ls('pluginsUpdate')) return false;

        if (ls('adultContent'))
            var allPlugins = siteSupport.concat(pornSupport);
        else
            var allPlugins = siteSupport;

        if (terms) {

            var matched = false;
            allPlugins.forEach( el => {
                if (el.name.toLowerCase().indexOf(terms.toLowerCase()) > -1) {
                    results.push(el);
                } else if (el.templetor) {
                    subPages[el.templetor].forEach(function(elm) {
                        if (elm.name.toLowerCase().indexOf(terms.toLowerCase()) > -1) {
                            var newExtractor = generateExtractor(elm, templates[el.templetor]);
                            newExtractor.priority = newExtractor.priority ? newExtractor.priority : 0;
                            results.push(newExtractor);
                        }
                    });
                }
            });
            
        }
        return results;
    },

    matchTags: tags => {

        var results = [];

        if (!ls('pluginsUpdate')) return false;

        if (ls('adultContent'))
            var allPlugins = siteSupport.concat(pornSupport);
        else
            var allPlugins = siteSupport;

        if (tags) {

            var matched = false;
            allPlugins.forEach( el => {
                matched = tags.some( matcher => {
                    return (el.tags.indexOf(matcher) > -1);
                });
                if (matched) {
                    el.priority = el.priority ? el.priority : 0;
                    results.push(el);
                }
                if (el.templetor) {
                    subPages[el.templetor].forEach(function(elm) {
                        matched = tags.some( matcher => {
                            return (elm.tags.indexOf(matcher) > -1);
                        });
                        if (matched) {
                            var newExtractor = generateExtractor(elm, templates[el.templetor]);
                            newExtractor.priority = newExtractor.priority ? newExtractor.priority : 0;
                            results.push(newExtractor);
                        }
                    });
                }
            });
            
        } else {
            allPlugins.forEach( el => {
                results.push(el);
                if (el.templetor) {
                    subPages[el.templetor].forEach( elm => {
                        results.push(generateExtractor(elm, templates[el.templetor]));
                    });
                }
            });
        }
        
        return results;
    },
    getByShortcut: (feed, shortcut) => {
        var found = false;
        feed.some( el => {
            if (el.search && el.search.shortcut && el.search.shortcut == shortcut) {
                found = el;
                return true;
            } else {
                if (el.shortcut && el.shortcut == shortcut) {
                    found = el;
                    return true;
                } else return false;
            }
        });
        
        return found;
    },
    getExtractor: link => {
        if (!ls('pluginsUpdate')) return false;
        var found = false;
        if (ls('adultContent'))
            var allPlugins = siteSupport.concat(pornSupport);
        else
            var allPlugins = siteSupport;

        allPlugins.some( el => {
            if (!el.torrent && link.match(new RegExp(el.match))) {
                var newTemplate = false;
                if (el.templetor) {
                    // this plugin has sub plugins
                    // select template
                    var template = templates[el.templetor];
                    var matcher = new RegExp(template.match.replace('%r', '[^\\/]+'), 'g');
                    if (link.match(matcher)) {
                        // link is a valid match for the sub plugins
                        subPages[el.templetor].some(function(elm) {
                            // it's a sub plugin for our found plugin
                            var regex = new RegExp(template.match.replace('%r', elm.replacer), 'g');
                            if (link.match(regex)) {
                                newTemplate = generateExtractor(elm, template);
                                return true;
                            }
                            return false;
                        });
                    }
                }
                found = newTemplate ? newTemplate : el;
                return true;
            } else return false;
        });
        console.log('extractor found');
        console.log(found);
        return found;
    },
    perfectMatch: (link, extractor) => {
        extractor = extractor ? extractor : plugins.getExtractor(link);
        if (extractor && extractor.checkFor) {
            return extractor.checkFor.some( el => {
                return link.match(new RegExp(el,'g'));
            })
        } else return false;
    }
};

module.exports = plugins;