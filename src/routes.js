import React from 'react';
import {
    Router, Route, IndexRoute
}
from 'react-router';

import Framework from './components/Framework.react';
import Dashboard from './components/Dashboard.react';
import Preferences from './components/Preferences.react';
import About from './components/About.react';
import Player from './components/Player';

import TorrentDashboard from './components/TorrentDashboard.react';


export
default (
    <Route path="/" component={Framework}>
      <IndexRoute component={Dashboard}/>

      <Route path="torrentDashboard" component={TorrentDashboard}/>
      
      <Route path="preferences" component={Preferences}/>
      <Route path="about" component={About}/>
      <Route path="player" component={Player}/>
    </Route>
);