import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';

import MUI from 'material-ui';

const {
    Dialog
} = MUI;

import ModalStore from './store';
import ModalActions from './actions';

import TraktCode from './components/TraktCode';
import TraktInfo from './components/TraktInfo';
import TraktSearch from './components/TraktSearch';

export
default React.createClass({

    mixins: [PureRenderMixin],

    childContextTypes: {
        muiTheme: React.PropTypes.object,
    },

    getChildContext() {
        return {
            muiTheme: MUI.Styles.ThemeManager.getMuiTheme(MUI.Styles['DarkRawTheme'])
        };
    },
    
    getInitialState() {

        var modalState = ModalStore.getState();

        return {
            Thinking: modalState.thinking,
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
                type: modalState.type,
                Thinking: modalState.thinking
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

    getStyle() {
        if (this.state.data) {
            switch (this.state.data.type) {
                case 'URLAdd':
                    return {
                        height: '200px'
                    };
            }
        } else
            return {};
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
        }
    },

    render() {
        return (
            <Dialog
                style={this.getStyle()}
                  open={this.state.modalIsOpen}
                autoScrollBodyContent={true}
                contentClassName={this.state.type == 'TraktSearch' ? 'material-dialog trakt-search' : 'material-dialog'}
                onRequestClose={this.closeModal}>
                {this.getContents()}
            </Dialog>
        );
    }
});