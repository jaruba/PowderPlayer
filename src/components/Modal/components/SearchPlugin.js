import React from 'react';
import {
    clipboard
} from 'electron';

import ModalActions from '../actions';
import ModalStore from '../store';

import MessageActions from '../../Message/actions';
import PlayerActions from '../../Player/actions';

import linkUtil from '../../../utils/linkUtil';
import _ from 'lodash';


export
default React.createClass({

    getInitialState() {
        return {
            selected: ModalStore.getState().searchPlugin
        }
    },

    componentDidMount() {
        this.refs['dialog'].open();
        _.delay(() => {
            this.refs.urlInput.$.input.focus()
        });
    },

    handleURLAdd() {
        var el = this.state.selected;
        var url = el.search.searcher;
        url = url.replace('%p', el.search && el.search.start ? el.search.start : 1);
        var inputvalue = this.refs.urlInput.value;
        url = url.replace('%s', encodeURIComponent(inputvalue).split('%20').join(el.search.separate));
        if (el.torrent) {
            ModalActions.torrentSelector(url);
        } else {
            ModalActions.thinking(true);
            this.refs.urlInput.value = '';
            linkUtil(url).then(url => {
                ModalActions.thinking(false);
            }).catch(error => {
                ModalActions.thinking(false);
                ModalActions.searchPlugin(el);
                MessageActions.open(error.message);
            });
        }
    },
    pasteClipboard() {
        this.refs['urlInput'].value = clipboard.readText('text/plain');
    },
    clearValue() {
        var that = this;
        _.delay(() => {
            that.refs.urlInput.value = '';
        },500);
    },
    componentDidUpdate() {
        this.refs['dialog'].open();
        _.delay(() => {
            this.refs['urlInput'].$.input.focus()
        });
    },
    render() {
        return (
            <paper-dialog
                ref="dialog"
                style={{width: '440px', textAlign: 'left', borderRadius: '3px'}}
                entry-animation="slide-from-top-animation"
                opened={false}
                with-backdrop >

                <paper-input
                    ref="urlInput"
                    style={{marginBottom: '15px', marginTop: '20px'}}
                    fullWidth={true}
                    onKeyDown={event => event.keyCode === 13 ? this.handleURLAdd() : void 0}
                    onContextMenu={this.pasteClipboard}
                    label={'Search ' + this.state.selected.name}
                    no-label-float />
                    
                <paper-button
                    raised
                    onClick={this.handleURLAdd}
                    style={{float: 'right', background: '#00bcd4', color: 'white', padding: '8px 15px', fontWeight: 'bold', marginRight: '22px', marginTop: '0px', textTransform: 'none'}}>
                Search
                </paper-button>
                
                <paper-button
                    raised
                    onClick={this.clearValue}
                    style={{float: 'right', marginRight: '10px', padding: '8px 15px', fontWeight: 'bold', marginTop: '0px', textTransform: 'none'}}
                  dialog-dismiss>
              Cancel
              </paper-button>
                
            </paper-dialog>
        );
    }
});