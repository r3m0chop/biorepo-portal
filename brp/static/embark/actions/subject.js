// jscs:disable requireCamelCaseOrUpperCaseIdentifiers
import fetch  from 'isomorphic-fetch';
import * as ProtocolActions from './protocol';
import * as RecordActions from './record';
import * as NotificationActions from './notification';
export const REQUEST_SUBJECTS = 'REQUEST_SUBJECTS';
export const RECEIVE_SUBJECTS = 'RECEIVE_SUBJECTS';
export const REQUEST_SUBJECT = 'REQUEST_SUBJECT';
export const RECEIVE_SUBJECT = 'RECEIVE_SUBJECT';
export const REQUEST_SUBJECT_SUCCESS = 'REQUEST_SUBJECT_SUCCESS';
export const SET_ACTIVE_SUBJECT = 'SET_ACTIVE_SUBJECT';
export const UPDATE_SUBJECT_REQUEST = 'UPDATE_SUBJECT_REQUEST';
export const UPDATE_SUBJECT_FAILURE = 'UPDATE_SUBJECT_FAILURE';
export const UPDATE_SUBJECT_SUCCESS = 'UPDATE_SUBJECT_SUCCESS';
export const ADD_SUBJECT_REQUEST = 'ADD_SUBJECT_REQUEST';
export const ADD_SUBJECT_FAILURE = 'ADD_SUBJECT_FAILURE';
export const ADD_SUBJECT_SUCCESS = 'ADD_SUBJECT_SUCCESS';
export const SET_LINK_MODE = 'SET_LINK_MODE';
export const SET_ADD_SUBJECT_MODE = 'SET_ADD_SUBJECT_MODE';
export const SET_NEW_SUBJECT = 'SET_NEW_SUBJECT';
export const REQUEST_SUBJECT_RECORDS = 'REQUEST_SUBJECT_RECORDS';
export const RECEIVE_SUBJECT_RECORDS = 'RECEIVE_SUBJECT_RECORDS';
export const SET_NEW_SUBJECT_FORM_ERRORS = 'SET_NEW_SUBJECT_FORM_ERRORS';

function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  } else {
    var error = new Error(response.statusText);
    error.response = response;
    return error;
  }
}

function checkAddSubject(json) {
  var [success, subject, errors] = json;
  if (!success) {
    var error = new Error('Unable to add subject');
    error.errors = errors;
    throw error;
  } else {
    return subject;
  }
}

export function requestSubjects() {
  return {
    type: REQUEST_SUBJECTS,
    subjects: [],
    isFetching: true,
  };
}

export function receiveSubjects(json) {
  return {
    type: RECEIVE_SUBJECTS,
    subjects: json,
    isFetching: false,
    receivedAt: Date.now(),
  };
};

export function requestSubject() {
  return {
    type: REQUEST_SUBJECT,
  };
}

export function receiveSubject(json) {
  return {
    type: REQUEST_SUBJECT_SUCCESS,
    subject: json,
  };
};

export function setAddSubjectMode(mode=null) {
  // Update state to enable or disable AddSubject mode
  return {
    type: SET_ADD_SUBJECT_MODE,
    mode,
  };
}

export function setActiveSubject(subject) {
  return (dispatch, getState) => {
    const state = getState();

    dispatch(RecordActions.setActiveRecord(null));
    dispatch({
      type: SET_ACTIVE_SUBJECT,
      subject,
    });
  };
}

export function setNewSubject(subject) {
  return {
    type: SET_NEW_SUBJECT,
    subject,
  };
}

export function fetchSubjects(protocolId) {
  return dispatch => {
    dispatch(requestSubjects(protocolId));
    var url = 'api/protocols/' + protocolId + '/subjects/';
    return fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: 'token ' + token,
      },
    })
      .then(response => response.json())
      .then(json => dispatch(receiveSubjects(json)));
  };
}

export function fetchSubject(protocolId, subjectId) {
  return dispatch => {
    dispatch(requestSubject());
    var url = 'api/protocols/' + protocolId + '/subjects/' + subjectId;
    return fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: 'token ' + token,
      },
    })
      .then(response => response.json())
      .then(json => dispatch(receiveSubject(json)));
  };
}

export function addSubjectRequest() {
  return {
    type: ADD_SUBJECT_REQUEST,
    isSaving: true,
  };
}

export function addSubjectSuccess(protocol) {
  return (dispatch, getState) => {
    const subjects = getState().subject.items;
    dispatch(NotificationActions.addNotification(
      {
        message: 'Subject Added',
        level: 'success',
        autoDismiss: 2,
      }
    ));
    dispatch(setAddSubjectMode());

    // We shouldn't have to retrieve state from server here.
    // At the most we should get back servers version of the
    // added subject.
    dispatch(fetchSubjects(protocol.id));
    dispatch({
      type: ADD_SUBJECT_SUCCESS,
    });
  };
}

export function addSubjectFailure(error) {
  var errors = error.errors;
  return {
    type: ADD_SUBJECT_FAILURE,
    errors: errors,
  };
}

export function addSubject(protocol, subject) {
  return dispatch => {
    dispatch(addSubjectRequest());
    var url = 'api/protocols/' + protocol.id + '/subjects/create';
    return fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: 'token ' + token,
        'X-CSRFToken': csrf_token,
      },
      body: JSON.stringify(subject),
    })
      .then(response => response.json())
      .then(checkAddSubject)
      .then(subject => dispatch(addSubjectSuccess(protocol)))
      .catch(errors => dispatch(addSubjectFailure(errors)));
  };
}

export function updateSubjectRequest() {
  return {
    type: UPDATE_SUBJECT_REQUEST,
    isSaving: true,
  };
};

export function updateSubjectSuccess(subject) {
  return dispatch => {
    dispatch({
      type: UPDATE_SUBJECT_SUCCESS,
      isFetching: false,
      subject: subject,
    });
    dispatch(NotificationActions.addNotification(
      {
        message: 'Subject Updated',
        level: 'success',
        autoDismiss: 2,
      }
    ));
    dispatch(NotificationActions.renderNotification());
  };
}

export function updateSubject(protocol, subject) {
  return dispatch => {
    dispatch(updateSubjectRequest());
    var url = 'api/protocols/' + protocol.id + '/subjects/' + subject.id;
    return fetch(url, {
      method: 'PUT',
      headers: {
        Accept: 'application/json',
        Authorization: 'token ' + token,
        'X-CSRFToken': csrf_token,
      },
      body: JSON.stringify(subject),
    })
      .then(checkStatus)
      .then(response => response.json())
      .then(json => dispatch(updateSubjectSuccess(json)));
  };
}

export function setLinkMode(mode=null) {
  return {
    type: SET_LINK_MODE,
    mode,
  };
}

export function requestSubjectRecords() {
  return {
    type: REQUEST_SUBJECT_RECORDS,
  };
}

export function receiveSubjectRecords(pds, json) {
  return {
    type: RECEIVE_SUBJECT_RECORDS,
    pds: pds,
    items: json,
  };
}

export function setNewSubjectFormErrors(errors) {
  return {
    type: SET_NEW_SUBJECT_FORM_ERRORS,
    errors: errors,
  };
}

export function fetchSubjectRecords(pds, subject) {
  return dispatch => {
    dispatch(requestSubjectRecords());
    var url = 'api/protocoldatasources/';
    url += pds.id;
    url += '/subjects/';
    url += subject.id;
    url += '/records/';
    return fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: 'token ' + token,
      },
    })
      .then(response => response.json())
      .then(json => dispatch(receiveSubjectRecords(pds, json)));
  };
}
