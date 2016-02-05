import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';

import TooltipStore from './store';
import TooltipActions from './actions';

export
default React.createClass({

    mixins: [PureRenderMixin],

    getInitialState() {
        return {
            progressHover: false
        }
    },
    componentWillMount() {
        TooltipStore.listen(this.update);
    },
    componentWillUnmount() {
        TooltipStore.unlisten(this.update);
    },
    update() {
        if (this.isMounted()) {
//            console.log('tooltip update');
            var tooltipState = TooltipStore.getState();
            this.setState({
                humanTime: tooltipState.humanTime,
                tooltipHalf: tooltipState.tooltipHalf,
                tooltipLeft: tooltipState.tooltipLeft,
                progressHover: tooltipState.progressHover,
                scrobbleTooltip: tooltipState.scrobbleTooltip
            });
        }
    },
    render() {
        var scrobblerStyles = {
            tooltip: {
                marginLeft: '-' + this.state.tooltipHalf + 'px',
                left: this.state.tooltipLeft,
                display: this.state.progressHover ? 'inline-block' : this.state.scrobbleTooltip
            }
        };
        return (
            <div ref="scrobbler-tooltip" className="tooltip" style={scrobblerStyles.tooltip}>{this.state.humanTime}</div>
        );
    }
});