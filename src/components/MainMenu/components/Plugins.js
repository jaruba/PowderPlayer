import React from 'react';
import _ from 'lodash';
import plugins from '../../../utils/plugins';
import async from 'async';
import MetaInspector from 'node-metainspector';
import ls from 'local-storage';
import ModalActions from '../../Modal/actions';

var skipScroll;

var titleCase = str => {
   var splitStr = str.toLowerCase().split(' ');
   for (var i = 0; i < splitStr.length; i++) {
       splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);     
   }
   return splitStr.join(' '); 
}

var normalizeUrl = (image, url) => {
    var protocol = url.substr(0, url.indexOf(':'));
    if (image.startsWith('//')) image = protocol + ':' + image;
    if (image.startsWith('/')) image = url + image.substr(1);
    return image;
}

var scanHtml = (html, url, target, attr, searcher) => {
    var image = false;
    var imgs = html(target);
    if (imgs && imgs.length) {
        _.some( imgs, el => {
            var imageUrl = html(el).attr(attr);
            if (imageUrl && imageUrl.includes(searcher)) {
                image = imageUrl;
                return true;
            } else return false;
        });
        if (image)
            image = normalizeUrl(image, url);
    }
    
    return image;
}

var getOgImage = (html, url) => {
    var image = html('meta[property="og:image"]');
    return image ? image.attr('content') : false;
}

var getIcon = (html, url) => {
    var image = html('link[rel="shortcut icon"]').attr('href');
    if (!image) image = url + 'favicon.ico';
}

var updateImage = (key, image) => {
    var logoElem = window.document.querySelector('#feed-logo-' + key);
    if (logoElem) {
        logoElem.style.background = 'url(' + image + ') no-repeat center';
    }
}

var getLogo = async.queue( (el, next) => {

    if (el.feed) var url = el.feed;
    else if (el.search && el.search.searcher) var url = el.search.searcher;
    else if (el.match) var url = el.match.split('\\/').join('/').split('\\.').join('.').split('s?:').join(':');
    
    if (url) {
        
        if (ls('pluginLogos')[url]) {
            updateImage(el.key, ls('pluginLogos')[url]);
            next();
        } else {
            
            var origUrl = url;

            if (!el.isSubPage) url = url.substr(0, url.split('/', 3).join('/').length + 1);
            
            if (el.categories) {
                for (var firstCat in el.categories) break;
                url = url.replace('%c', el.categories[firstCat]);
            }

            var client = new MetaInspector(url, {
                timeout: 10000
            });
    
            client.on("fetch", function() {
                var image = false;
                if (el.useBackupImage) {
                    image = el.backupImage;
                } else if (el.imageType) {
                    if (el.imageType == 'ogImage') {
                        image = getOgImage(client.parsedDocument, url);
                        if (image && url.includes('youtube.com')) image = image.replace('s900', 's100');
                        if (!image && el.backupImage) image = el.backupImage;
                    } else if (el.imageType == 'firstImage') {
                        image = scanHtml(client.parsedDocument, url, 'img', 'src', '');
                            
                        if (image && url.includes('reddit.com') && image.includes('https://www.redditstatic.com/'))
                            image = false;

                        if (!image && el.backupImage) image = el.backupImage;
                    }
                }

                if (!image && client.image) image = client.image;
                if (!image) {
                    // search for logo
                    image = scanHtml(client.parsedDocument, url, 'img', 'src', 'logo');
                    if (!image)
                        image = scanHtml(client.parsedDocument, url, 'meta', 'content', '.png');
                }
                if (!image) image = getIcon(client.parsedDocument, url);
                if (image) {
                    image = normalizeUrl(image, url);
                    var pluginLogos = ls('pluginLogos');
                    pluginLogos[origUrl] = image;
                    ls('pluginLogos', pluginLogos);
                    updateImage(el.key, image);
                }
    
                next();
            });
    
            client.on("error", () => {
                next();
            });
    
            client.fetch();
        }
    } else next();

}, 1);

export
default React.createClass({

    getInitialState() {
        return {
            open: true,
            selected: false
        }
    },
    
    decideUpdate(results) {
        if (results) {
            this.setSearch(results);
        } else if (this.state.selected && this.state.selected.label == 'Installed') {
            skipScroll = true;
            this.setSelected(this.state.selected);
        }
    },
    
    componentWillMount() {
        plugins.events.on('pluginListUpdate', this.decideUpdate);
    },

    componentWillUnmount() {
        plugins.events.removeListener('pluginListUpdate', this.decideUpdate);
    },
    componentDidUpdate() {
        if (!skipScroll)
            document.querySelector('.plugin-list').scrollTop = 0;
        else skipScroll = false;
    },
    
    setSearch(el) {
        this.setState({
            search: el
        });
    },
    setSelected(el) {
        if (el) {
            if (el.label == 'Search') {
                ModalActions.searchPlugins();
            } else {
                if (el.matchWith)
                    this.setState({
                        matchWith: el
                    });
                else
                    this.setState({
                        selected: el
                    });
            }
        } else {
            if (this.state.matchWith)
                this.setState({
                    matchWith: null
                });
            else {
                if (this.state.search)
                    this.setState({
                        search: null
                    });
                else
                    this.setState({
                        selected: null
                    });
            }
        }
    },
    
    openPluginModal(feed, ij) {
        var targetPlugin = feed[ij];
        var logoElem = window.document.querySelector('#feed-logo-' + ij);
        if (logoElem && logoElem.style.background) {
            targetPlugin.image = logoElem.style.background.substr(4);
            targetPlugin.image = targetPlugin.image.substr(0,targetPlugin.image.indexOf(')'));
            targetPlugin.image = targetPlugin.image.split('"').join('').split("'").join('');
        }
        if (targetPlugin.tags.indexOf('installed') > -1)
            ModalActions.installedPlugin(targetPlugin);
        else
            ModalActions.plugin(targetPlugin);
    },

    render() {
        if (!this.state.selected && !this.state.search) {
            var title = 'Select Interest';
            var feed = [
                {
                    label: 'Search',
                    icon: 'search'
                },
                {
                    label: 'Installed',
                    icon: 'installed',
                    tag: ['installed']
                },
                {
                    label: 'All',
                    icon: 'all'
                },
                {
                    label: 'Trending',
                    icon: 'hot',
                    tag: ['hot']
                },
                {
                    label: 'Interesting',
                    icon: 'idea',
                    tag: ['interesting']
                },
                {
                    label: 'Information',
                    icon: 'educational',
                    tag: ['educational']
                },
                {
                    label: 'Comedy',
                    icon: 'funny',
                    tag: ['funny']
                },
                {
                    label: 'News',
                    icon: 'news',
                    tag: ['news']
                },
                {
                    label: 'Movies',
                    icon: 'movies',
                    tag: ['movies']
                },
                {
                    label: 'TV Shows',
                    icon: 'tv-shows',
                    tag: ['tv shows']
                },
                {
                    label: 'Music',
                    icon: 'music',
                    tag: ['music']
                },
                {
                    label: 'Torrents',
                    icon: 'torrent',
                    tag: ['torrents']
                },
                {
                    label: 'Science',
                    icon: 'science',
                    tag: ['science']
                },
                {
                    label: 'Games',
                    icon: 'games',
                    tag: ['games']
                },
                {
                    label: 'Sports',
                    icon: 'sports',
                    tag: ['sports']
                },
                {
                    label: 'Hardware / Tech',
                    icon: 'tech',
                    tag: ['hardware', 'tech']
                },
                {
                    label: 'Food',
                    icon: 'food',
                    tag: ['food']
                },
                {
                    label: 'Adventure / Travel',
                    icon: 'travel',
                    tag: ['adventure', 'travel']
                },
                {
                    label: 'Beauty',
                    icon: 'beauty',
                    tag: ['beauty', 'makeup', 'fashion']
                },
                {
                    label: 'People',
                    icon: 'people',
                    tag: ['people', 'celebrities']
                },
                {
                    label: 'Children',
                    icon: 'children',
                    tag: ['children', 'cartoons']
                },
                {
                    label: 'Miscellaneous',
                    icon: 'misc',
                    tag: ['various']
                }
                
            ];

            if (!ls('torrentContent'))
                feed = _.filter(feed, el => { return el.icon != 'torrent' })

            if (ls('adultContent'))
                feed.push({
                    label: 'Porn',
                    icon: 'porn',
                    tag: ['porn']
                });

            var generated = _.map(feed, (el, ij) => {
                return (
                    <div key={ij} className="feed-element" onClick={this.setSelected.bind(this, el)}>
                          <paper-icon-button className={'feed-interest'} src={'images/icons/discover-icons/' + el.icon + '.png'} noink={true} style={{width: '60px', height: '60px', padding: '0', marginBottom: '7px' }} />
                        <br />
                        {el.label}
                    </div>
                );
            });
            
            var tagTemplate = '';

            var backButton = '';

        } else {
            var title = this.state.search ? this.state.search.terms : this.state.matchWith ? this.state.selected.label +'  -  '+ this.state.matchWith.label : this.state.selected.label;
            var feed = this.state.search ? this.state.search.results : plugins.matchTags(this.state.selected.tag);

            if (!ls('torrentContent'))
                feed = _.filter(feed, el => { return !el.torrent })

            var tagMap =[];
            var tags = [];

            if (this.state.matchWith) {
                var noTags = true;
                feed.forEach( el => {
                    el.tags.forEach( elm => {
                        var index = tagMap.indexOf(elm);
                        if (index > -1) tags[index].votes++;
                        else {
                            tags.push({ tag: elm, votes: 1 });
                            tagMap.push(elm);
                        }
                    });
                });
                feed = plugins.matchWith(feed, this.state.matchWith.tag);
            }

            getLogo.tasks = [];

            // order by installed first, then by priority
            feed.sort(function(a,b) { return (a.tags.indexOf('installed') > -1 && b.tags.indexOf('installed') == -1) ? -1 : ((a.tags.indexOf('installed') == -1 && b.tags.indexOf('installed') > -1) ? 1 : ((a.priority > b.priority) ? -1 : ((b.priority > a.priority) ? 1 : 0))); });

            var generated = _.map(feed, (el, ij) => {
                el.key = ij;
                if (el.defaultImage) {
                    var logoStyle = {
                        background: 'url("' + el.defaultImage + '") no-repeat center'
                    };
                } else {
                    getLogo.push(el);
                    var logoStyle = {};
                }
                if (!noTags)
                    el.tags.forEach( elm => {
                        var index = tagMap.indexOf(elm);
                        if (index > -1) tags[index].votes++;
                        else {
                            tags.push({ tag: elm, votes: 1 });
                            tagMap.push(elm);
                        }
                    });

                return (
                    <div key={ij} className="feed-element" onClick={this.openPluginModal.bind(this, feed, ij)} style={{lineHeight: '13px'}}>
                        <div id={'feed-logo-' + ij} className="feed-logos" style={logoStyle} />
                        <br />
                        <div style={{overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', display: 'block', lineHeight: '18px', marginTop: '-3px'}}>{el.name}</div>
                    </div>
                );
            });

            tags.sort(function(a,b) { return (a.votes > b.votes) ? -1 : ((b.votes > a.votes) ? 1 : 0); });
            
            tags = tags.slice(0, 12);
            
            var tagTemplate = _.map(tags, (el, ij) => {
                return (
                    <span
                        key={ij}
                        className={'tag' + (this.state.matchWith && this.state.matchWith.tag == el.tag ? ' tag-selected' : '')}
                        onClick={this.setSelected.bind(this, { matchWith: true, label: titleCase(el.tag), tag: el.tag })}>
                            {el.tag} ({el.votes})
                    </span>
                );
            });

            var backButton = (
                <paper-icon-button onClick={this.setSelected.bind(this, null)} className="player-close" icon={'arrow-back'} noink={true} style={{color: '#767A7B', position: 'relative', top: '-2px', marginRight: '1px', marginLeft: '-20px'}} />
            );
        }
        return (
            <div className="plugin-container" style={{textAlign: 'center'}}>
                {backButton}
                <span style={{paddingTop: '64px', display: 'inline-block', fontSize: '21px', color: '#f1664f' , marginBottom: this.state.selected ? '20px' : '0'}}>{title}</span>
                <br />
                {tagTemplate}
                <br />
                <div className="plugin-list" style={{marginTop: this.state.selected ? '1%' : '5%'}}>
                    {generated}
                </div>
            </div>
        );
    }
});

