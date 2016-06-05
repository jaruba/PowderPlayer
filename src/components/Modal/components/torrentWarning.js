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
            _.delay(() => {
                this.refs['dialog'].center();
            }, 1000);
        }
    },
    
    componentDidUpdate() {
        if (this.refs['dialog']) {
            this.refs['dialog'].open();
            _.delay(() => {
                this.refs['dialog'].center();
            }, 500);
            _.delay(() => {
                this.refs['dialog'].center();
            }, 1000);
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
        if (this.refs.checky.checked)
            ls('torrentContent', false);

        this.setState({
            selected: null
        })
        ModalActions.close(true);
    },

    installPlugin(el) {
        if (this.refs.checky.checked)
            ls('torrentWarning', 2);

        plugins.install(el.name);
        ModalActions.close(true);
        ModalActions.installedPlugin(el);
    },

    render() {
        return (
            <paper-dialog ref="dialog" className="pluginModal" style={{width: '440px', textAlign: 'left', borderRadius: '3px'}} entry-animation="fade-in-animation" opened={false} with-backdrop>
                <h2>Warning</h2><br />
                <span style={{ display: 'block', marginTop: '0', textAlign: 'justify' }}>
                    <span style={{ display: 'inline-block', margin: '0', padding: '0', width: '10px', heigh: '1px' }} />You are about to install a torrent plugin. As this type of plugin gets feeds from websites that are user driven and not always well regulated, you might be in danger of downloading harmful software or copyrighted content.<br /><br />
                    <span style={{ display: 'inline-block', margin: '0', padding: '0', width: '10px', heigh: '1px' }} />We cannot ensure your safety after this point, as some Internet Providers (in some countries) also punish their users for activities concerning copyrighted material.<br /><br />
                    <span style={{ display: 'inline-block', margin: '0', padding: '0', width: '10px', heigh: '1px' }} />Using Powder to download illegitimate (pirated) material is not endorsed nor encouraged by the developers.<br /><br />
                    <span style={{ display: 'inline-block', margin: '0', padding: '0', width: '10px', heigh: '1px' }} />Do you wish to continue nonetheless?
                </span>
                <br />
                <paper-checkbox ref="checky" style={{ float: 'left', marginTop: '22px', position: 'relative', top: '5px' }}>Remember Choice</paper-checkbox>
                <br />
              <paper-button
                    raised
                    onClick={this.handleClose}
                    style={{float: 'right', marginRight: '20px', padding: '8px 15px', fontWeight: 'bold', marginTop: '0px', textTransform: 'none'}}
                    dialog-dismiss>
              No
              </paper-button>
              
                <paper-button raised onClick={this.installPlugin.bind(this, this.state.selected)} style={{float: 'right', marginRight: '10px', padding: '8px 15px', fontWeight: 'bold', marginTop: '0px', textTransform: 'none', background: '#00bcd4', color: 'white'}} dialog-dismiss>
                Yes
                </paper-button>


            </paper-dialog>
        );
    }
});