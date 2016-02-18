import { combineReducers } from 'redux';
import protocol from './protocol';
import subject from './subject';
import pds from './pds';
import record from './record';
import notification from './notification';

const rootReducer = combineReducers({
  protocol,
  subject,
  pds,
  record,
  notification,
});

export default rootReducer;
