import React from 'react';
import HeaderStore from './store';
import HeaderActions from './actions';


export
default React.createClass({
    getInitialState() {
        return {
            maximized: false,
            minimized: false,
            view: HeaderStore.getState().view
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
                minimized: HeaderStore.getState().minimized,
                view: HeaderStore.getState().view
            });
        }
    },
    render() {
        console.log(this.state.view);
        return (
            <div className="header windows">
                <h1>Powder Player</h1>
                <i onClick={HeaderActions.close} className="material-icons close">clear</i>
                <i onClick={HeaderActions.toggleMaximize} className="material-icons maximize off">crop_3_2</i>
                <i onClick={HeaderActions.toggleMinimize} className="material-icons minimize">remove</i>
            </div>
        );
    }
});