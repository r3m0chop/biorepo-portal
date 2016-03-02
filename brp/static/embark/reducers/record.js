import { SET_ACTIVE_RECORD, SET_EDIT_LABEL_MODE, SET_SELECTED_LABEL,
         RECEIVE_RECORDS, REQUEST_RECORDS, CLEAR_RECORD_STATE,
         SET_PENDING_LINKED_RECORD, SET_SELECTED_LINK_TYPE } from '../actions/record';

const initialState = {
  isFetching: false,
  items: [],
  activeRecord: null,
  pendingLinkedRecord: null,
  editLabelMode: false,
  selectedLabel: null,
  selectedLinkType: null,
};

function record(state = initialState, action) {
  switch (action.type){
    case SET_ACTIVE_RECORD:
      return Object.assign({}, state, {
        activeRecord: action.activeRecord,
      });
    case SET_EDIT_LABEL_MODE:
      if (action.mode != null) {
        return Object.assign({}, state, {
          editLabelMode: action.mode,
        });
      } else {
        return Object.assign({}, state, {
          editLabelMode: !state.editLabelMode,
        });
      }

    case RECEIVE_RECORDS:
      return Object.assign({}, state, {
        isFetching: false,
        items: state.items.concat(action.items),
      });
    case REQUEST_RECORDS:
      return Object.assign({}, state, {
        isFetching: true,
        items: [],
      });
    case SET_SELECTED_LABEL:
      return Object.assign({}, state, {
        selectedLabel: action.selectedLabel,
      });
    case SET_PENDING_LINKED_RECORD:
      return Object.assign({}, state, {
        pendingLinkedRecord: action.record,
      });
    case SET_SELECTED_LINK_TYPE:
      return Object.assign({}, state, {
        selectedLinkType: action.linkId,
      });
    case CLEAR_RECORD_STATE:
      return initialState;
    default:
      return state;
  }
}

export default record;
