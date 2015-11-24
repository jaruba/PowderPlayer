import React from 'react';
import {
    Router, Route, IndexRoute
}
from 'react-router';
import Framework from './components/Framework.react';

import MainMenu from './components/MainMenu';
import Preferences from './components/Preferences';
import Player from './components/Player';
import TorrentDashboard from './components/TorrentDashboard';


export
default (
    <Route path="/" component={Framework}>
      <IndexRoute component={MainMenu}/>

      <Route path="torrentDashboard" component={TorrentDashboard}/>
      
      <Route path="preferences" component={Preferences}/>
      <Route path="player" component={Player}/>
    </Route>
);