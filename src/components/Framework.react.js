import React from 'react';

export
default React.createClass({
    getInitialState: function() {
        return {
            sidebarOffset: 0
        };
    },
    handleScroll: function(e) {
        if (e.target.scrollTop > 0 && !this.state.sidebarOffset) {
            this.setState({
                sidebarOffset: e.target.scrollTop
            });
        } else if (e.target.scrollTop === 0 && this.state.sidebarOffset) {
            this.setState({
                sidebarOffset: 0
            });
        }
    },
    render: function() {
        return (
            <main >
             
            </main>
        );
    }
});