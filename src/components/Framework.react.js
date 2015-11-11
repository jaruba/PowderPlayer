import React from 'react';
import ipc from 'ipc';

export
default React.createClass({
    componentWillMount() {
        ipc.send('app:startup', new Date().getTime());
    },
    render() {
        return (
            <div id="main">
              {React.cloneElement(this.props.children, {query: this.props.query})}
            </div>
        );
    }
});