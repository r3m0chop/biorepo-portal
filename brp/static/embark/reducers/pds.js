import { REQUEST_PDS, RECEIVE_PDS, SET_ACTIVE_PDS, RECEIVE_PDS_LINKS } from '../actions/pds';

const initialState = {
  isFetching: false,
  activePDS: null,
  availableLinkTypes: {},  // Object where key corresponds to relevant pds
  items: [],
};

let key = {};
let pdsLinks = {};
let obj = {};

function pds(state = initialState, action) {
  switch (action.type) {
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
    case RECEIVE_PDS_LINKS:
      key = action.pds;
      obj = {};
      obj[key] = action.links;
      pdsLinks = Object.assign({}, state.availableLinkTypes, obj);
      return Object.assign({}, state, {
        availableLinkTypes: pdsLinks,
      });
    default:
      return state;
  }
}

export default pds;
