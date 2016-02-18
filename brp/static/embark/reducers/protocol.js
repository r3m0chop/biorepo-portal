import { REQUEST_PROTOCOLS, RECEIVE_PROTOCOLS, SET_ACTIVE_PROTOCOL, REQUEST_PROTOCOL_ORGS,
         RECEIVE_PROTOCOL_ORGS, SET_ADD_SUBJECT_MODE } from '../actions/protocol';

const initialState = {
  isFetching: false,
  items: [],
  activeProtocol: null,
  orgs: [],
  addSubjectMode: false,
};

function protocol(state = initialState, action) {
  switch (action.type){
    case REQUEST_PROTOCOLS:
      return Object.assign({}, state, {
        items: [],
        isFetching: true,
      });
    case RECEIVE_PROTOCOLS:
      return Object.assign({}, state, {
        isFetching: false,
        items: action.protocols,
      });
    case SET_ACTIVE_PROTOCOL:
      return Object.assign({}, state, {
        activeProtocol: action.protocol,
      });
    case REQUEST_PROTOCOL_ORGS:
      return Object.assign({}, state, {
        isFetching: true,
      });
    case RECEIVE_PROTOCOL_ORGS:
      return Object.assign({}, state, {
        orgs: action.organizations,
      });
    case SET_ADD_SUBJECT_MODE:
      if (action.mode != null) {
        return Object.assign({}, state, {
          addSubjectMode: action.mode,
        });
      } else {
        return Object.assign({}, state, {
          addSubjectMode: !state.addSubjectMode,
        });
      }

    default:
      return state;
  }
}

export default protocol;
