import React from 'react';
import {
    Card, CardActions, CardExpandable, CardHeader, CardText
}
from 'material-ui';

import engineStore from '../../stores/engineStore';
import torrentActions from '../../actions/torrentActions';

import utils from '../../utils/util';

export
default React.createClass({
    getInitialState() {

        var engineState = engineStore.getState();

        return {
            torrents: engineState.torrents
        };
    },
    componentDidMount() {
        engineStore.listen(this.update);
    },
    componentWillUnmount() {
        engineStore.unlisten(this.update);
    },
    update() {
        if (this.isMounted()) {

            var engineState = engineStore.getState();

            this.setState({
                torrents: engineState.torrents
            });
        }
    },

    generateTorrent(infoHash) {

    },

    generateFile(file) {

    },

    render() {
        return (
            <div className="wrapper">
             	<Card initiallyExpanded={true}>
  					<CardHeader
    					title="Name of Torrent"
    					subtitle="Speed Up/Down"
    					actAsExpander={true}
    					showExpandableButton={true}>
  					</CardHeader>
  					<CardText expandable={true}>
    					List of files with progress here
  					</CardText>
  					<CardActions expandable={true}>
    					<FlatButton label="Remove Torrent"/>
  					</CardActions>
				</Card>
            </div>
        );
    }
});