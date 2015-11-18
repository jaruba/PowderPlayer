import React from 'react';
import ModalActions from '../actions';
import {
    LinearProgress, RaisedButton
}
from 'material-ui';


export
default React.createClass({
    getInitialState() {
        return {
            meta: ModalStore.getState().meta
        };
    },

    componentDidMount() {
        ModalStore.listen(this.update);
    },

    componentWillUnmount() {
        ModalStore.listen(this.update);
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
        var stats = {
            uploadSpeed: swarm.uploadSpeed(),
            downloadSpeed: swarm.downloadSpeed(),
            peers: {
                active: swarm.wires.filter((wire) => {
                    return !wire.peerChoking;
                }).length,
                total: swarm.wires.length
            }
        }
        return stats;
    },

    render() {
        return (
            <div>
                <div className="meta" >
                    <div className="cover-image" />
                </div>
                <LinearProgress mode="indeterminate"  />
                <RaisedButton onClick={this.handelCancel} style={{float: 'right', 'marginTop': '15px' }} label="Cancel" />
                <p className="peers" />

            </div>
        );
    }
});