import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';

import TimeStore from './store';
import TimeActions from './actions';

export
default React.createClass({

    mixins: [PureRenderMixin],

    getInitialState() {
        return {
            currentTime: '00:00',
            forceTime: false,
            overTime: false,
            totalTime: '00:00',
            length: 0
        }
    },
    componentWillMount() {
        TimeStore.listen(this.update);
    },
    componentWillUnmount() {
        TimeStore.unlisten(this.update);
    },
    update() {
        if (this.isMounted()) {
//            console.log('time update');
            var timeState = TimeStore.getState();
            this.setState({
                currentTime: timeState.currentTime,
                forceTime: timeState.forceTime,
                overTime: timeState.overTime,
                totalTime: timeState.totalTime,
                length: timeState.length
            });
        }
    },
    render() {
        return (
            <div ref="scrobbler-shownTime" className="shownTime">
                <span ref="scrobbler-currentTime" className="currentTime">{
                    this.state.forceTime ? this.state.overTime : this.state.currentTime
                }</span> / <span ref="scrobbler-totalTime">{this.state.totalTime}</span>
            </div>
        );
    }
});