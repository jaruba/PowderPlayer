import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';

import ModalStore from './store';
import ModalActions from './actions';

import TraktCode from './components/TraktCode';
import TraktInfo from './components/TraktInfo';
import TraktSearch from './components/TraktSearch';

import StreamLan from './components/StreamLAN';
import AddToPlaylist from './components/AddToPlaylist';

import CastingScanner from './components/Casting-dummy';
import CastingSettings from './components/Casting-dummy';
import CastingControls from './components/Casting-dummy';
import CastingLink from './components/Casting-dummy';
import CastingProcess from './components/Casting-dummy';
import CastingPlayer from './components/Casting-dummy';
import CastingPlayerScanner from './components/Casting-dummy';

export
default React.createClass({

    mixins: [PureRenderMixin],
    
    getInitialState() {

        var modalState = ModalStore.getState();

        return {
            modalIsOpen: modalState.open,
            type: modalState.type,
            data: modalState.data,
            theme: modalState.theme
        };
    },

    componentDidMount() {
        ModalStore.listen(this.update);
    },

    componentWillUnmount() {
        ModalStore.unlisten(this.update);
    },

    update() {
        if (this.isMounted()) {

            var modalState = ModalStore.getState();

            this.setState({
                modalIsOpen: modalState.open,
                data: modalState.data,
                type: modalState.type
            });
        }
    },

    openModal() {
        this.setState({
            modalIsOpen: true
        });
    },

    closeModal() {
        this.setState({
            modalIsOpen: false
        });
    },

    getContents() {
        switch (this.state.type) {
            case 'TraktCode':
                return <TraktCode />;
                break;
            case 'TraktInfo':
                return <TraktInfo />;
                break;
            case 'TraktSearch':
                return <TraktSearch />;
                break;
            case 'StreamLAN':
                return <StreamLan />;
                break;
            case 'AddToPlaylist':
                return <AddToPlaylist />;
                break;
            case 'CastingScanner':
                return <CastingScanner />;
            case 'CastingSettings':
                return <CastingSettings />;
            case 'CastingControls':
                return <CastingControls />;
            case 'CastingLink':
                return <CastingLink />;
            case 'CastingProcess':
                return <CastingProcess />;
            case 'CastingPlayer':
                return <CastingPlayer />;
            case 'CastingPlayerScanner':
                return <CastingPlayerScanner />;
        }
    },

    render() {
        return (
            <div style={{width: '0px', height: '0px'}}>
                {this.getContents()}
            </div>
        );
    }
});