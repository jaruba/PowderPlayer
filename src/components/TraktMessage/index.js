import React from 'react';
import Snackbar from 'react-notification';
import MessageStore from './store';
import MessageActions from './actions';


export
default React.createClass({
    getInitialState() {
        return {
            message: '',
            active: false
        };
    },
    componentWillMount() {
        MessageStore.listen(this.update);
    },

    componentWillUnmount() {
        MessageStore.unlisten(this.update);
    },
    update() {
        this.setState({
            message: MessageStore.getState().message
        });
        this.toggleOpen();
    },

    toggleOpen() {
        if (MessageStore.getState().open) {
            this.setState({
                active: true
            });
        } else
            this.setState({
                active: false
            });
    },
    
    onDismiss() {
        this.setState({
            active: false
        });
    },

    render() {
        return (
            <div>
                <Snackbar 
                    ref="Snackbar"
                    openOnMount={false}
                    isActive={this.state.active}
                    className="trakt-message"
                    message={this.state.message}
                    dismissAfter={3000}
                    onDismiss={this.onDismiss}
                />
            </div>
        );
    }
});