import React from 'react';
import Reflux from 'reflux';
import Framework from './components/Framework.react';
import {
    Router, Route, IndexRoute
}
from 'react-router';

var App = React.createClass({

    mixins: [Reflux.ListenerMixin],

    componentWillMount() {
        console.log('About to mount App');
    },

    render() {
        return (
            <div>
              {React.cloneElement(this.props.children, {query: this.props.query})}
            </div>
        );
    }

});

export
default (
    <Route component={App} path='/'>
        <IndexRoute component={Framework} />
    </Route>
);