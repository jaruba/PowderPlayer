import React from 'react';
import ModalActions from '../actions';
import ModalStore from '../store';
import _ from 'lodash';
import {
    RaisedButton, List, ListItem
}
from 'material-ui';

export
default React.createClass({
    getInitialState() {
        return {
            files: ModalStore.getState().fileSelector.files,
            folders: ModalStore.getState().fileSelector.folders
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
        this.setState({
            files: ModalStore.getState().fileSelector.files,
            folders: ModalStore.getState().fileSelector.folders
        });
    },

    generateFolder(folder, files) {
        return (<ListItem primaryText="folder.name" initiallyOpen="true" nestedItems="files" />);
    },

    generateFile(file) {
        return (<ListItem primaryText="file.name" secondaryText={<p>"file.size"</p>} secondaryTextLines={1} />);
    },

    render() {
        return (
            <div>
            <List>
                <ListItem
                primaryText="/folder"
                initiallyOpen={true}
                nestedItems={[
                    <ListItem primaryText="FileName.mp4" secondaryText={<p>381 MB</p>} secondaryTextLines={1} />,
                    <ListItem primaryText="FileName.mp4" secondaryText={<p>381 MB</p>} secondaryTextLines={1} />
                ]}
                />
                <ListItem primaryText="FileName.mp4" secondaryText={<p>381 MB</p>} secondaryTextLines={1} />
                <ListItem primaryText="FileName.mp4" secondaryText={<p>381 MB</p>} secondaryTextLines={1} />
                <ListItem primaryText="FileName.mp4" secondaryText={<p>381 MB</p>} secondaryTextLines={1} />
                <ListItem primaryText="FileName.mp4" secondaryText={<p>381 MB</p>} secondaryTextLines={1} />
            </List>

                <RaisedButton onClick={this.handelCancel} style={{float: 'right', 'marginTop': '15px' }} label="Cancel" />
            </div>
        );
    }
});