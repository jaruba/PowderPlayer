import React from 'react';
import _ from 'lodash';
import {
    History
}
from 'react-router';

import ModalActions from '../actions';
import ModalStore from '../store';
import ls from 'local-storage';

export
default React.createClass({

    mixins: [History],

    getInitialState() {
        return {
        };
    },

    componentDidMount() {
        this.refs.dialog.open();
    },

    componentDidUpdate() {
        this.refs.dialog.open();
    },

    componentWillMount() {
        ModalStore.listen(this.update);
    },

    componentWillUnmount() {
        ModalStore.unlisten(this.update);
    },

    handleCancel() {
        ModalActions.close();
    },

    update() {
    },

    handleSelectFile(file, ij) {
        setTimeout(() => {
            var historyList = ls('history').reverse();
            if (historyList[ij][0].title == file[0].title) {
                ModalActions.close();
                window.historyLoad(file)
            }
        }, 100)
    },
    
    deleteHistory(file, ij) {
        var historyList = ls('history')
        ij = historyList.length - 1 - ij
        historyList.splice(ij, 1)
        ls('history', historyList)
        this.setState({})
    },

    generateFile(file, ij) {
        return (
            <paper-item key={'history-'+ij} onClick={this.handleSelectFile.bind(this, file, ij)} style={{cursor: 'pointer', padding: '5px 15px' }} className="historyFile">
            <paper-item-body style={{ width: '410px' }} two-line>
    <paper-icon-button icon="delete" alt="delete" className="historyDelete" onClick={this.deleteHistory.bind(this, file, ij)} />
    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '400px', fontSize: '15px' }}>{file[file[0].currentItem].title}</div>
    <div secondary style={{ height: '13px', marginTop: '11px' }}><paper-progress value={Math.round(file[file[0].currentItem].position * 100)} class="blue" style={{ width: '363px' }} /></div>
            </paper-item-body>
            </paper-item>
        );
    },
    render() {
        let content = ls('doHistory') ? ls('history').reverse() : [];
        return (
            <paper-dialog
                ref="dialog"
                style={{width: '440px', textAlign: 'left', borderRadius: '3px', overflowX: 'hidden'}}
                className="prettyScrollWhite"
                opened={true}
                with-backdrop >
                
                <div style={{ position: 'relative', marginTop: '0px', marginLeft: '-24px', zIndex: '1000', height: '39px' }}>
                    <div style={{ position: 'fixed', padding: '15px', width: '401px', backgroundColor: 'white', fontSize: '16px', fontWeight: 'bold', borderBottom: '1px solid rgba(0,0,0,0.2)' }}>
                        History <div className="boxclose" onClick={this.handleCancel} />
                    </div>
                </div>
                
                <paper-menu multi>
                    {content.map((content_item, ij) => {
                        return this.generateFile(content_item, ij);
                    })}
                </paper-menu>

            </paper-dialog>
        );
    }
});