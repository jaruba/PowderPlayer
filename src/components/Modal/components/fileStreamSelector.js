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

    getContent() {
        var content = [];
        /*
        for (var folder in this.state.folders) {
            var attr = this.state.folders[folder];
        }
        */
        for (var file in this.state.files) {
            content.push(this.generateFile(this.state.files[file]));
        }

        return content;
    },

    generateFolder(folder, files) {
        return (<ListItem primaryText="folder.name" initiallyOpen="true" nestedItems="files" />);
    },

    generateFile(file) {
        return (<ListItem primaryText="file.name" secondaryText={<p>"file.size"</p>} secondaryTextLines={1} />);
    },

    render() {
        let playDisabled = true;
        let content = this.getContent();
        console.log(content)
        return (
            <div>
                <List>
                    <ListItem
                    primaryText="/folder"
                    initiallyOpen={true}
                    nestedItems={[
                        <ListItem key="1" primaryText="FileName.mp4" secondaryText={<p>381 MB</p>} secondaryTextLines={1} />,
                        <ListItem key="2" primaryText="FileName.mp4" secondaryText={<p>381 MB</p>} secondaryTextLines={1} />
                    ]} />
                    {content.map(function(file, i){
                        return file;
                    })}
                </List>
                <RaisedButton onClick={this.handelCancel} disabled={playDisabled} style={{float: 'right', 'marginTop': '15px', 'marginLeft': '15px' }} label="Play Selected File" />
                <RaisedButton onClick={this.handelCancel} style={{float: 'right', 'marginTop': '15px' }} label="Cancel" />
            </div>
        );
    }
});