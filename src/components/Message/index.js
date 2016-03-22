import React from 'react';
import _ from 'lodash';
import MessageStore from './store';
import MessageActions from './actions';


export
default React.createClass({
    getInitialState() {
        return {
            message: ''
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
    },
    render() {
        return (
            <div>

                <paper-toast
                    id="main-toaster"
                    text={this.state.message} />

            </div>
        );
    }
});