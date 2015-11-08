import React from 'react';
import ReactDOM from 'react-dom';
import Router from 'react-router';
import routes from './js/routes';
import webUtil from './js/utils/webUtil';


webUtil.addLiveReload();
webUtil.disableGlobalBackspace();

ReactDOM.render(<Router>{routes}</Router>, document.getElementById('app'));