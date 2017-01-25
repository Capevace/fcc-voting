import { createStore, combineReducers } from 'redux';
import auth from './reducers/auth';
import loading from './reducers/loading';
import ip from './reducers/ip';

export default createStore(
  combineReducers({
    auth,
    loading,
    ip
  })
);
