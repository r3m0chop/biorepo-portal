import { SET_ACTIVE_RECORD, SET_EDIT_LABEL_MODE, SET_SELECTED_LABEL } from '../actions/record';

const initialState = {
  isFetching: false,
  items: [],
  activeRecord: null,
  editLabelMode: false,
  selectedLabel: null,
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

    case SET_SELECTED_LABEL:
      return Object.assign({}, state, {
        selectedLabel: action.selectedLabel,
      });
    default:
      return state;
  }
}

export default record;
