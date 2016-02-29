import { REQUEST_PDS, RECEIVE_PDS, SET_ACTIVE_PDS } from '../actions/pds';

const initialState = {
  isFetching: false,
  activePDS: null,
  items: [],
};

function pds(state = initialState, action) {
  switch (action.type){
    case REQUEST_PDS:
      return Object.assign({}, state, {
        items: [],
        isFetching: true,
      });
    case RECEIVE_PDS:
      return Object.assign({}, state, {
        isFetching: false,
        items: action.pds,
      });
    case SET_ACTIVE_PDS:
      return Object.assign({}, state, {
        activePDS: action.pds,
      });
    default:
      return state;
  }
}

export default pds;
