import React from 'react';
import _ from 'lodash';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import ls from 'local-storage';

import PlayerActions from '../actions';
import VisibilityStore from './Visibility/store';
import VisibilityActions from './Visibility/actions';
import player from '../utils/player';
import path from 'path';
import ModalActions from './Modal/actions';
import ui from '../utils/ui';

export
default React.createClass({

    mixins: [PureRenderMixin],

    getInitialState() {
        return {
            open: false
        }
    },
    componentWillMount() {
        VisibilityStore.listen(this.update);
    },

    componentWillUnmount() {
        VisibilityStore.unlisten(this.update);
    },
    update() {
        if (this.isMounted()) {
            this.setState({
                open: VisibilityStore.getState().casting
            });
        }
    },
    
    selectType(idx, item) {
        if (player && player.wcjs && [3,4].indexOf(player.wcjs.state) > -1) {
            if (item.name == 'Browser') {
                _.defer(() => {
                    ModalActions.open({
                        type: 'CastingSettings',
                        castType: 'Browser',
                        currentItem: player.wcjs.playlist.currentItem,
                        name: 'Browser'
                    });
                });
            } else {
                _.defer(() => {
                    ModalActions.open({
                        type: 'CastingScanner',
                        method: item
                    });
                });
            }
        } else {
            player.notifier.info('Error: Play Something', '', 6000);
        }
        ui.toggleMenu('casting');
    },

    render() {
        var type = [
            {
                name: 'DLNA',
                icon: 'images/dlna.png'
            }, {
                name: 'Chromecast',
                icon: 'images/chromecast.png'
            }, {
                name: 'Airplay',
                icon: 'images/airplay.png'
            }, {
                name: 'Browser',
                icon: 'images/browser.png'
            }
        ]
        
        return (
            <div className={'subtitle-list casting-list' + (this.state.open ? ' show' : '')}>
            <div style={{backgroundColor: '#303030', padding: '0'}}>
                {
                        _.map(type, (item, idx) => {
                            return (
                              <paper-item key={idx} style={{backgroundColor: '#303030', color: 'white', padding: '4px 12px'}} onClick={this.selectType.bind(this, idx, item)} className={'sub-menu-item'}>
                              <span style={{width: '38px', height: '38px', borderRadius: '25px', backgroundImage: 'url(' + item.icon + ')', margin: '4px', marginLeft: '0', marginRight: '15px', backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '0'}} />
                <paper-item-body>
                                {item.name}
                                </paper-item-body>
                              </paper-item>
                            );
                        })
                    }
            </div>
            </div>
        );
    }

    
});