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
            files: ModalStore.getState().fileSelectorFiles
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
            files: ModalStore.getState().fileSelectorFiles
        });
    },

    getContent() {
        var fileSelectorData = this.state.files;
        var content = [];

        _.forEach(fileSelectorData, (folder, key) => {
            if (key === 'folder_status') return;
            if (fileSelectorData.folder_status) {
                content.push(this.generateFolder(folder, key))
            } else {
                _.forEach(folder, (file) => {
                    content.push(this.generateFile(file))
                });
            }
        });

        return content;
    },

    generateFolder(files, name) {
        var content = [];

        _.forEach(files, (file) => {
            content.push(this.generateFile(file))
        });

        return React.createElement(ListItem, {
            primaryText: name,
            initiallyOpen: true,
            key: name,
            nestedItems: content
        });
    },

    generateFile(file) {
        return React.createElement(ListItem, {
            primaryText: file.name,
            secondaryText: file.size,
            secondaryTextLines: 1,
            key: file.id,
            disabled: !file.streamable
        });
    },

    render() {
        let playDisabled = true;
        let folders_enabled = this.state.files.folders;
        let content = this.state.files ? this.getContent() : [];
        console.log(content);
        return (
            <div>
                <List>
                    {content.map(function(content_item) {
                        return content_item;
                    })}
                </List>
                <RaisedButton onClick={this.handelCancel} disabled={playDisabled} style={{float: 'right', 'marginTop': '15px', 'marginLeft': '15px' }} label="Play Selected File" />
                <RaisedButton onClick={this.handelCancel} style={{float: 'right', 'marginTop': '15px' }} label="Cancel" />
            </div>
        );
    }
});