import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import ModalActions from '../actions';
import ModalStore from '../store';
import _ from 'lodash';
import plugins from '../../../utils/plugins';
import ls from 'local-storage';

export
default React.createClass({
    
    mixins: [PureRenderMixin],

    getInitialState() {
        return {
            selected: ModalStore.getState().selectedPlugin
        };
    },

    componentDidMount() {
        if (this.refs['dialog']) {
            this.refs['dialog'].open();
            _.delay(() => {
                this.refs['dialog'].center();
            }, 500);
        }
    },
    
    componentDidUpdate() {
        if (this.refs['dialog']) {
            this.refs['dialog'].open();
            _.delay(() => {
                this.refs['dialog'].center();
            }, 500);
        }
    },

    componentWillMount() {
        ModalStore.listen(this.update);
    },

    componentWillUnmount() {
        ModalStore.unlisten(this.update);
    },

    handelCancel() {

    },

    update() {
        if (this.isMounted()) {
            this.setState({
                selected: ModalStore.getState().selectedPlugin
            });
        }
    },
    
    handleClose() {
        this.setState({
            selected: null
        })
    },
    
    openURL(url) {
        require('electron').shell.openExternal(url);
    },
    
    installPlugin(el) {
        if (el.torrent && ls('torrentWarning') == 1) {
            ModalActions.close(true);
            ModalActions.torrentWarning();
        } else {
            plugins.install(el.name);
    
            ModalActions.close(true);
            ModalActions.installedPlugin(el);
        }
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
            var url = this.state.selected.feed.replace('%p', this.state.selected.feed.search && typeof this.state.selected.feed.search.start != 'undefined' ? this.state.selected.feed.search.start : 1);
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
                    <span onClick={this.openURL.bind(this, url)} className="plugin-url">{url}</span>
                    <br /><br />
                </div>    
            );
        } else var feedTemplate = (<div style={{display:'none'}} />);
        
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
                    <br /><br />
                </div>
                {descTemplate}
                {feedTemplate}
                <span style={{textDecoration: 'underline'}}>Supports Search</span><br />
                {this.state.selected.search ? 'Yes' : 'No'}
                <br /><br />
                        
              <paper-button
                    raised
                    onClick={this.handleClose}
                    style={{float: 'right', marginRight: '20px', padding: '8px 15px', fontWeight: 'bold', marginTop: '0px', textTransform: 'none'}}
                    dialog-dismiss>
              Cancel
              </paper-button>
              
                <paper-button raised onClick={this.installPlugin.bind(this, this.state.selected)} style={{float: 'right', marginRight: '10px', padding: '8px 15px', fontWeight: 'bold', marginTop: '0px', textTransform: 'none', background: '#00bcd4', color: 'white'}} dialog-dismiss>
                Install Plugin
                </paper-button>


            </paper-dialog>
        );
    }
});