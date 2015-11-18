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
            mounted: false,
            paused: false,
            playing: false,
            buffering: true,
            scrobbling: false
        }
    },
    componentDidMount() {
        this.player = wcjsRenderer.init(wcjs, this.refs['wcjs-render'], wcjsVlcArgs);
        this.player.play((this.props.uri) ? this.props.uri : 'http://archive.org/download/CartoonClassics/Krazy_Kat_-_Keeping_Up_With_Krazy.mp4');
        window.addEventListener('resize', this.handleResize);
        this.handleResize();
    },
    componentWillUnmount() {
        window.removeEventListener('resize', this.handleResize);
    },
    update() {

    },
    handleResize() {

        var canvas = this.refs['wcjs-render'];
        var container = document.body;
        var sourceAspect = canvas.width / canvas.height;
        var destAspect = container.clientWidth / container.clientHeight;
        var cond = destAspect > sourceAspect;

        if (cond) {
            canvas.style.height = "100%";
            canvas.style.width = ((container.clientHeight * sourceAspect) / container.clientWidth) * 100 + "%";
        } else {
            canvas.style.height = ((container.clientWidth / sourceAspect) / container.clientHeight) * 100 + "%";
            canvas.style.width = "100%";
        };

    },
    handleTogglePlay(toggle) {
        if (!this.player && (typeof(state) !== undefined && ((this.player.state === 4) == state))) return;
        this.player.togglePause(toggle ? true : false);
    },
    render() {
        return (
            <div>
               <canvas ref="wcjs-render"/>
            </div>
        );
    }
});