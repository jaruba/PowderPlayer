import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import ModalActions from '../actions';
import ModalStore from '../store';
import _ from 'lodash';
import {
    LinearProgress, RaisedButton
}
from 'material-ui';


export
default React.createClass({
    
    mixins: [PureRenderMixin],

    getInitialState() {
        return {
            meta: ModalStore.getState().meta,
            stats: {
                uploadSpeed: 0,
                downloadSpeed: 0,
                peers: {
                    active: 0,
                    total: false
                }
            }
        };
    },

    componentWillMount() {
        ModalStore.listen(this.update);
    },

    componentWillUnmount() {
        ModalStore.unlisten(this.update);
    },

    handelCancel() {
        ModalActions.close();
    },

    update() {
        if (this.isMounted()) {
            this.setState({
                meta: ModalStore.getState().meta,
            });
            this.updateUI(this.state.meta.type)
        }
    },

    updateUI(type) {
        switch (type) {
            case 'torrent':
                this.updateStats(this.state.meta.data.swarm);
                break;
        }
    },

    updateStats(swarm) {
        if (this.isMounted())
            this.setState({
                stats: {
                    uploadSpeed: swarm.uploadSpeed(),
                    downloadSpeed: swarm.downloadSpeed(),
                    peers: {
                        active: swarm.wires.filter((wire) => {
                            return !wire.peerChoking;
                        }).length,
                        total: swarm.wires.length
                    }
                }
            });
        if (this.isMounted())
            _.delay(this.updateStats, 100, this.state.meta.data.swarm);
    },

    render() {
        var statusText = this.state.stats.peers.total ? <p className="peers" >Connected to {this.state.stats.peers.total} Peers</p> : <p className="peers">Processing URL</p>;
        return (
            <div>
                <LinearProgress mode="indeterminate"  />
                <RaisedButton onClick={this.handelCancel} style={{float: 'right', 'marginTop': '15px' }} label="Cancel" />
                {statusText}
            </div>
        );
    }
});