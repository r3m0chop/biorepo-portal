// jscs:disable requireCamelCaseOrUpperCaseIdentifiers
import { REQUEST_SUBJECTS, RECEIVE_SUBJECTS, SET_ACTIVE_SUBJECT,
         SHOW_INFO_PANEL, HIDE_INFO_PANEL, SHOW_ACTION_PANEL,
         HIDE_ACTION_PANEL, UPDATE_SUBJECT_SUCCESS, UPDATE_SUBJECT_REQUEST,
         SET_LINK_MODE, ADD_SUBJECT_SUCCESS, ADD_SUBJECT_FAILURE } from '../actions/subject';
import rootReducer from './index';

const initialState = {
  isFetching: false,
  items: [],
  activeSubject: null,
  newSubject: {},
  isSaving: false,
  showInfoPanel: false,
  showActionPanel: false,
  addRecordMode: false,
  linkMode: false,
  newFormErrors: null,
  updateFormErrors: null,
};

function subject(state = initialState, action) {
  switch (action.type){
    case REQUEST_SUBJECTS:
      return Object.assign({}, state, {
        items: [],
        isFetching: true,
      });
    case RECEIVE_SUBJECTS:

      // Create a validation entry for org subject ID
      action.subjects.map(function (subject) {
        return subject.organization_subject_id_validation = subject.organization_subject_id;
      });

      return Object.assign({}, state, {
        items: action.subjects,
        isFetching: false,
      });
    case SET_ACTIVE_SUBJECT:
      return Object.assign({}, state, {
        activeSubject: action.subject,
      });
    case SHOW_INFO_PANEL:
      return Object.assign({}, state, {
        showInfoPanel: true,
      });
    case HIDE_INFO_PANEL:
      return Object.assign({}, state, {
        showInfoPanel: false,
      });
    case SHOW_ACTION_PANEL:
      return Object.assign({}, state, {
        showActionPanel: true,
      });
    case HIDE_ACTION_PANEL:
      return Object.assign({}, state, {
        showActionPanel: false,
      });
    case UPDATE_SUBJECT_REQUEST:
      return Object.assign({}, state, {
        isSaving: true,
      });
    case UPDATE_SUBJECT_SUCCESS:
      return Object.assign({}, state, {
        isSaving: false,
        updateFormErrors: null,
      });
    case SET_LINK_MODE:
      if (action.mode != null) {
        return Object.assign({}, state, {
          linkMode: action.mode,
        });
      } else {
        return Object.assign({}, state, {
          linkMode: !state.linkMode,
        });
      }

    case ADD_SUBJECT_SUCCESS:
      return Object.assign({}, state, {
        newFormErrors: null,
      });
    case ADD_SUBJECT_FAILURE:
      return Object.assign({}, state, {
        newFormErrors: action.errors,
      });
    default:
      return state;
  }
}

export default subject;
