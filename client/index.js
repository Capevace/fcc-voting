require('./scss/index.scss');

import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, IndexRoute, Link, browserHistory } from 'react-router';
import { Provider } from 'react-redux';
import axios from 'axios';
import store from './redux';

import App from './containers/App';
import HomePage from './pages/HomePage';
import PollPage from './pages/PollPage';
import MyPollsPage from './pages/MyPollsPage';
import NewPollPage from './pages/NewPollPage';

ReactDOM.render((
  <Provider store={store}>
    <Router history={browserHistory}>
      <Route path="/" component={App}>
        <IndexRoute component={HomePage} />
        <Route path="/poll/:id" component={PollPage} />
        <Route path="/my-polls" component={MyPollsPage} />
        <Route path="/new" component={NewPollPage} />
        <Route path="*" component={() => <div>Route not found</div>} />
      </Route>
    </Router>
  </Provider>
), document.getElementById('app'));


store.dispatch({ type: 'LOGIN_REQUEST' });
// Start request for logged in user
axios
  .get('/auth/user')
  .then(result => {
    if (result.data && result.data.user) {
      store.dispatch({
        type: 'LOGIN_STATUS_CHANGE',
        user: result.data.user
      });
    } else {
      store.dispatch({
        type: 'LOGIN_STATUS_CHANGE',
        user: null
      });
    }

    store.dispatch({ type: 'LOGIN_REQUEST_COMPLETE' });
  })
  .catch(result => {
    console.error(result);
    alert('Error connecting to server.');
    store.dispatch({ type: 'LOGIN_REQUEST_COMPLETE' });
  });


store.dispatch({ type: 'IP_UPDATE' });
axios
  .get('/api/ip')
  .then(result => {
    console.log(result);
    if (result.data && result.data.ip) {
      store.dispatch({
        type: 'IP_UPDATED',
        ip: result.data.ip
      });
    } else {
      store.dispatch({
        type: 'IP_UPDATED',
        ip: null
      });
    }

    store.dispatch({ type: 'IP_UPDATE_COMPLETE' });
  })
  .catch(result => {
    console.error(result);
    alert('Error connecting to server.');
    store.dispatch({ type: 'IP_UPDATE_COMPLETE' });
  });
