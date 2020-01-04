import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import ModalActions from '../actions';
import ModalStore from '../store';
import _ from 'lodash';
import plugins from '../../../utils/plugins';
import MessageActions from '../../Message/actions';
import linkUtil from '../../../utils/linkUtil';
import PlayerActions from '../../Player/actions';
import ls from 'local-storage';

export
default React.createClass({
    
    mixins: [PureRenderMixin],

    getInitialState() {
        return {
            selected: ModalStore.getState().installedPlugin
        };
    },
    
    updateFeedUrl() {
        if (this.state.selected.feed && this.state.selected.categories)
            _.defer(() => {
                var url = this.state.selected.feed.replace('%p', this.state.selected.search && typeof this.state.selected.search.start != 'undefined' ? this.state.selected.search.start : 1);
                var selectedCat = Polymer.dom().querySelector('.install-plugin-cat').selectedItemLabel;
                if (this.state.selected.categories[selectedCat] instanceof Array) {
                    url = url.replace('%c', this.state.selected.categories[selectedCat][0]);
                } else {
                    url = url.replace('%c', this.state.selected.categories[selectedCat]);
                }
                var pluginUrl = window.document.querySelector('.plugin-url');
                pluginUrl.innerHTML = url;
            });
    },

    openURL() {
        require('electron').shell.openExternal(window.document.querySelector('.plugin-url').innerHTML);
    },

    pluginShortcut() {
        require('electron').shell.openExternal('https://github.com/jaruba/PowderPlayer/wiki/Plugin-Shortcuts');
    },

    componentDidMount() {
        if (this.refs['dialog'])
            this.refs['dialog'].open();

        if (this.state.selected.categories)
            Polymer.dom().querySelector('.dropdown-content').addEventListener('iron-select', this.updateFeedUrl);
    },
    
    componentDidUpdate() {
        if (this.refs['dialog'])
            this.refs['dialog'].open();
    },

    componentWillMount() {
        ModalStore.listen(this.update);
    },

    componentWillUnmount() {
        ModalStore.unlisten(this.update);
        if (this.state.selected && this.state.selected.categories)
            Polymer.dom().querySelector('.dropdown-content').removeEventListener('iron-select', this.updateFeedUrl);
    },

    handelCancel() {

    },

    update() {
        if (this.isMounted()) {
            this.setState({
                selected: ModalStore.getState().installedPlugin
            });
        }
    },
    
    handleClose() {
        this.setState({
            selected: null
        })
    },
    
    uninstallPlugin(el) {
        plugins.uninstall(el.name);

        ModalActions.close();
        plugins.events.emit('pluginListUpdate');
    },
    
    playPlugin(el) {
        ModalActions.close(true);
        ModalActions.thinking(true);

        var url = el.feed.replace('%p', el.search && typeof el.search.start != 'undefined' ? el.search.start : 1);
        
        if (el.categories) {
            var selectedCat = Polymer.dom().querySelector('.install-plugin-cat').selectedItemLabel;
            if (el.categories[selectedCat] instanceof Array) {
                url = url.replace('%c', el.categories[selectedCat][0]);
            } else {
                url = url.replace('%c', el.categories[selectedCat]);
            }
        }
        
        if (el.torrent) {
            setTimeout(() => {
                ModalActions.close(true)
                MessageActions.open('Parsing torrent pages no longer supported')
            })
//            ModalActions.torrentSelector(url);
        } else {

            linkUtil(url).then(url => {
                ModalActions.thinking(false);
            }).catch(error => {
                ModalActions.thinking(false);
                ModalActions.installedPlugin(el);
                MessageActions.open(error.message);
            });
        }
    },
    
    searchPlugin(el) {
        if (el.categories) {
            var selectedCat = Polymer.dom().querySelector('.install-plugin-cat').selectedItemLabel;
            if (el.categories[selectedCat] instanceof Array) {
                el.search.searcher = el.search.searcher.replace('%c', el.categories[selectedCat][1]);
            } else {
                el.search.searcher = el.search.searcher.replace('%c', el.categories[selectedCat]);
            }
        }
        ModalActions.close(true);
        ModalActions.searchPlugin(el);
    },

    render() {
        if (!this.state.selected) return (<div style={{display: 'none'}} />);
        if (this.state.selected.desc) {
            var descTemplate = (
                <div style={{margin: '0'}}>
                    <span style={{textDecoration: 'underline'}}>Description</span><br />
                    {this.state.selected.desc}
                    <br /><br />
                </div>
            );
        } else var descTemplate = (<div style={{display:'none'}} />);
        if (this.state.selected.feed) {
            var url = this.state.selected.feed.replace('%p', this.state.selected.search && typeof this.state.selected.search.start != 'undefined' ? this.state.selected.search.start : 1);
            if (this.state.selected.categories) {
                for (var firstCat in this.state.selected.categories) break;
                if (this.state.selected.categories[firstCat] instanceof Array)
                    url = url.replace('%c', this.state.selected.categories[firstCat][0]);
                else
                    url = url.replace('%c', this.state.selected.categories[firstCat]);
            }
            var feedTemplate = (
                <div style={{margin: '0'}}>
                    <span style={{textDecoration: 'underline'}}>Feed Page</span><br />
                    <span onClick={this.openURL} className="plugin-url">{url}</span>
                    <br /><br />
                </div>    
            );
            
            var playFeed = (
                <paper-button raised onClick={this.playPlugin.bind(this, this.state.selected)} style={{float: 'right', marginRight: '10px', padding: '8px 15px', fontWeight: 'bold', marginTop: '0px', textTransform: 'none', background: '#00bcd4', color: 'white'}} dialog-dismiss>
                Play Feed
                </paper-button>
            );

        } else {
            var feedTemplate = (<div style={{display:'none'}} />);
            var playFeed = (<div style={{display:'none'}} />);
        }

        if (this.state.selected.search) {
            var searcher = (
                <paper-button raised onClick={this.searchPlugin.bind(this, this.state.selected)} style={{float: 'right', marginRight: '10px', padding: '8px 15px', fontWeight: 'bold', marginTop: '0px', textTransform: 'none', background: '#00bcd4', color: 'white'}} dialog-dismiss>
                Search
                </paper-button>
            );
        } else {
            var searcher = (<div style={{display:'none'}} />);
        }
        
        if (this.state.selected.categories) {
            var catTemplate = (
                <div style={{margin: '0'}}>
                    <paper-dropdown-menu class="install-plugin-cat" vertical-align="bottom" noink no-animations style={{marginTop: '-31px'}}>
                      <paper-listbox class="dropdown-content" selected="0">
                        {
                            _.map( this.state.selected.categories, (el, ij) => {
                                return (<paper-item>{ij}</paper-item>)
                            })
                        }
                      </paper-listbox>
                    </paper-dropdown-menu>
                    <br /><br />
                </div>
            );
        } else {
            var catTemplate = (<div style={{display:'none'}} />);
        }

        if (!this.state.selected.image) {
            if (this.state.selected.feed) var iUrl = this.state.selected.feed;
            else if (this.state.selected.search && this.state.selected.search.searcher) var iUrl = this.state.selected.search.searcher;
            else if (this.state.selected.match) var iUrl = this.state.selected.match.split('\\/').join('/').split('\\.').join('.').split('s?:').join(':');
            
            if (iUrl && ls('pluginLogos')[iUrl])
                var image = ls('pluginLogos')[iUrl];
        }

        return (
            <paper-dialog ref="dialog" className="pluginModal" style={{width: '440px', textAlign: 'left', borderRadius: '3px'}} opened={false} with-backdrop>
                <div style={{width: '100%', position: 'relative', marginBottom: '15px', textAlign: 'center', padding: '0', marginBottom: '0'}}>
                    <img src={this.state.selected.image || image || "images/plugin-placeholder.png"} style={{maxHeight: '120px', maxWidth: '90%'}} onError={(e)=>{e.target.onerror = null; e.target.src="images/plugin-placeholder.png"}} />
                </div>
                <br />
                <div style={{margin: '0'}}>
                    <span style={{textDecoration: 'underline'}}>Title</span><br />
                    {this.state.selected.name}
                    <span onClick={this.pluginShortcut} className="tag" style={{marginTop: '-6px', marginLeft: '7px', display: (this.state.selected.search && this.state.selected.search.shortcut) || this.state.selected.shortcut ? 'inline-block' : 'none'}}>{ this.state.selected.search && this.state.selected.search.shortcut ? this.state.selected.search.shortcut : this.state.selected.shortcut ? this.state.selected.shortcut : '' }</span>
                    <br /><br />
                </div>
                {descTemplate}
                {feedTemplate}
                {catTemplate}
                        
              <paper-button
                    raised
                    onClick={this.handleClose}
                    style={{float: 'right', marginRight: '20px', padding: '8px 15px', fontWeight: 'bold', marginTop: '0px', textTransform: 'none'}}
                    dialog-dismiss>
              Cancel
              </paper-button>
                        
              <paper-button
                    raised
                    onClick={this.uninstallPlugin.bind(this, this.state.selected)}
                    style={{float: 'right', marginRight: '12px', padding: '8px 15px', fontWeight: 'bold', marginTop: '0px', textTransform: 'none', marginBottom: '20px'}}
                    dialog-dismiss>
              Uninstall
              </paper-button>
              {searcher}
              {playFeed}
            </paper-dialog>
        );
    }
});