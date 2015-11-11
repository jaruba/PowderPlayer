import React from 'react';

export
default React.createClass({
    render() {
        return (
            <div>
              {React.cloneElement(this.props.children, {query: this.props.query})}
            </div>
        );
    }
});