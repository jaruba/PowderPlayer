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

    toggleMaximize() {

    },


    toggleMinimize() {

    },




    render() {
        return (
            <div className="header windows">
                <i className="material-icons close">clear</i>
                <i className="material-icons maximize off">crop_3_2</i>
                <i className="material-icons minimize">remove</i>
            </div>
        );
    }
});