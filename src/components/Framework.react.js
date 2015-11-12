import React from 'react';
import ipc from 'ipc';
import Modal from './Modal';


export
default React.createClass({
    componentWillMount() {
        ipc.send('app:startup', new Date().getTime());
    },
    render() {
        return (
            <div id="main">
              {React.cloneElement(this.props.children, {query: this.props.query})}
              <Modal/>
            </div>
        );
    }
});