import { REQUEST_PDS, RECEIVE_PDS } from '../actions/pds';

const initialState = {
  isFetching: false,
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
    default:
      return state;
  }
}

export default pds;
