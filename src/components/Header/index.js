import React from 'react';
import HeaderStore from './store';
import HeaderActions from './actions';


export
default React.createClass({
    getInitialState() {
        return {
            maximized: false,
            minimized: false
        };
    },
    componentWillMount() {
        HeaderStore.listen(this.update);
    },

    componentWillUnmount() {
        HeaderStore.unlisten(this.update);
    },
    update() {
        if (this.isMounted()) {
            this.setState({
                maximized: HeaderStore.getState().maximized,
                minimized: HeaderStore.getState().minimized
            });
        }
    },
    render() {
        return (
            <div className="header windows">
                <i className="material-icons close">clear</i>
                <i onClick={HeaderActions.toggleMaximize.bind(this, !this.state.maximized)} className="material-icons maximize off">crop_3_2</i>
                <i onClick={HeaderActions.toggleMinimize} className="material-icons minimize">remove</i>
            </div>
        );
    }
});