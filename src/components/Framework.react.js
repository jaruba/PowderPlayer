import React from 'react';
import ipc from 'ipc';
import Modal from './Modal';
import {
    RouteContext
}
from 'react-router';

export
default React.createClass({

    mixins: [RouteContext],

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