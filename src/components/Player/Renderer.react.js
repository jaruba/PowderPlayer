import React from 'react';
import path from 'path';

try {
    var wcjs = require(path.join(process.cwd(), 'resources/bin/', 'WebChimera.js.node'));
} catch (e) {
    console.error('WCJS Load Error:', e);
}

export
default React.createClass({
    getInitialState() {
        return {

        }
    },
    componentDidMount() {

    },
    componentWillUnmount() {

    },
    update() {

    },

    render() {
        return (
            <div >
               
            </div>
        );
    }
});