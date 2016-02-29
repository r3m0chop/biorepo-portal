// jscs:disable requireCamelCaseOrUpperCaseIdentifiers
import { REQUEST_SUBJECTS, RECEIVE_SUBJECTS, SET_ACTIVE_SUBJECT,
         SHOW_INFO_PANEL, HIDE_INFO_PANEL, SHOW_ACTION_PANEL,
         HIDE_ACTION_PANEL, UPDATE_SUBJECT_SUCCESS, UPDATE_SUBJECT_REQUEST,
         SET_LINK_MODE, ADD_SUBJECT_SUCCESS, ADD_SUBJECT_FAILURE,
         SET_ADD_SUBJECT_MODE, SET_NEW_SUBJECT, REQUEST_SUBJECT_SUCCESS } from '../actions/subject';
import rootReducer from './index';

const initialNewSubject = {
  organization: null,
  dob: null,
  first_name: null,
  last_name: null,
  organization: null,
  organization_subject_id: null,
  organization_subject_id_validation: null,
};

const initialState = {
  isFetching: false,
  items: [],
  activeSubject: null,
  activeSubjectRecords: [],
  newSubject: initialNewSubject,
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
        addSubjectMode: false,
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
    case REQUEST_SUBJECT_SUCCESS:
      action.subject.organization_subject_id_validation = action.subject.organization_subject_id;
      action.subject.organization_id = action.subject.organization;
      return Object.assign({}, state, {
        items: action.subjects,
        isFetching: false,
        activeSubject: action.subject,
      });
    case SET_ACTIVE_SUBJECT:
      return Object.assign({}, state, {
        activeSubject: action.subject,
      });
    case SET_NEW_SUBJECT:
      return Object.assign({}, state, {
        newSubject: action.subject,
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
      action.subject.organization_subject_id_validation = action.subject.organization_subject_id;
      action.subject.organization_id = action.subject.organization;
      return Object.assign({}, state, {
        isSaving: false,
        updateFormErrors: null,
        activeSubject: action.subject,
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

    case SET_ADD_SUBJECT_MODE:
      if (action.mode != null) {
        return Object.assign({}, state, {
          addSubjectMode: action.mode,
          newFormErrors: null,
          newSubject: initialNewSubject,
        });
      } else {
        return Object.assign({}, state, {
          addSubjectMode: !state.addSubjectMode,
          newFormErrors: null,
          newSubject: initialNewSubject,
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
