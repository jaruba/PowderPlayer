import React from 'react';
import path from 'path';

import wcjsRenderer from './utils/wcjs-renderer';


try {
    var wcjs = require(path.join(process.cwd(), 'resources/bin/', 'WebChimera.js.node'));
} catch (e) {
    console.error('WCJS Load Error:', e);
}

const wcjsVlcArgs = [
    "--no-media-library",
    "--no-sub-autodetect-file",
    "--no-spu",
    "--no-stats",
    "--no-osd",
    "--network-caching", "3500",
    "--file-caching", "3000",
    "--no-skip-frames",
    "--no-video-title-show",
    "--disable-screensaver",
    "--no-autoscale",
    "--ipv4-timeout=86400000"
];

export
default React.createClass({
    getInitialState() {
        return {

        }
    },
    componentDidMount() {
        console.log('mounting Player')
        wcjsRenderer.init(wcjs, this.refs['wcjs-render'], wcjsVlcArgs);
    },
    componentWillUnmount() {

    },
    update() {

    },

    render() {
        return (
            <div >
               <canvas ref="wcjs-render"/>
            </div>
        );
    }
});