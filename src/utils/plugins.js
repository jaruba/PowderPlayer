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

var negatives, templates, subPages, siteSupport, pornSupport;

function generateExtractor(elem, template) {
    template.name = elem.name;
    template.tags = elem.tags;

    template.checkFor = elem.checkFor ? elem.checkFor : template.checkFor;

    template.match = template.match.replace('%r', elem.replacer);

    if (template.search && template.search.searcher)
        template.search.searcher = template.search.searcher.replace('%r', elem.replacer);

    if (template.feed)
        template.feed = template.feed.replace('%r', elem.replacer);
        
    return template;
}

var plugins = {
    load: () => {
        if (ls('pluginsUpdate')) {
            const pluginPath = path.join(app.getPath('userData'), 'plugins');
            negatives = require(path.join(pluginPath, 'negatives'));
            templates = require(path.join(pluginPath, 'plugin-templates'));
            subPages = require(path.join(pluginPath, 'sub-plugins'));
            siteSupport = require(path.join(pluginPath, 'all-plugins'));
            pornSupport = require(path.join(pluginPath, 'adult-plugins'));
            console.log('Plugins Loaded');
        } else {
            console.log('Plugins Not Available');
        }
    },
    update: () => {
        if (!ls.isSet('pluginsUpdate')) ls('pluginsUpdate', 0);
        if (ls('pluginsUpdate') < (Date.now() / 1000) - 1209600) {
            // re-download every 2 weeks
            var userData = app.getPath('userData');
            var pluginsUpdate = () => {
                var pluginPaths = ['all-plugins', 'sub-plugins', 'plugin-templates', 'negatives', 'adult-plugins'];
                var updated = 0;
                pluginPaths.forEach( el => {
                    request('http://powder.media/plugins/' + el + '.js', function (error, response, body) {
                        if (!error && response.statusCode == 200)
                            fs.writeFile(path.join(userData, 'plugins', el + '.js'), body, function (err) {
                                if (!err) updated++;
                                if (updated == plugins.length) {
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
    getExtractor: link => {
        if (!ls('pluginsUpdate')) return false;
        var found = false;
        if (ls('adultContent'))
            var allPlugins = siteSupport.concat(pornSupport);
        else
            var allPlugins = siteSupport;

        allPlugins.some(function(el) {
            if (link.match(new RegExp(el.match))) {
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