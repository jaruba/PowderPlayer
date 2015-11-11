import React from 'react';

import Settings from '../utils/settingsUtil';
import utils from '../utils/util';


export
default React.createClass({
    getInitialState() {
        return {

        };
    },
    handleResetSettings() {
        Settings.reset();
    },

    handleOpenDevTools() {
        require('remote').getCurrentWindow().toggleDevTools();
    },
    render() {
        return (
            <div>
                <section>
                    <h1 className='title'>General</h1>
                   
                </section>
            </div>
        );
    }
});