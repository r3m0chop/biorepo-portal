import fetch  from 'isomorphic-fetch';
import * as ProtocolActions from './protocol';
import * as RecordActions from './record';
import * as NotificationActions from './notification';
export const REQUEST_SUBJECTS = 'REQUEST_SUBJECTS';
export const RECEIVE_SUBJECTS = 'RECEIVE_SUBJECTS';
export const SET_ACTIVE_SUBJECT = 'SET_ACTIVE_SUBJECT';
export const SHOW_INFO_PANEL = 'SHOW_INFO_PANEL';
export const HIDE_INFO_PANEL = 'HIDE_INFO_PANEL';
export const SHOW_ACTION_PANEL = 'SHOW_ACTION_PANEL';
export const HIDE_ACTION_PANEL = 'HIDE_ACTION_PANEL';
export const UPDATE_SUBJECT_REQUEST = 'UPDATE_SUBJECT_REQUEST';
export const UPDATE_SUBJECT_FAILURE = 'UPDATE_SUBJECT_FAILURE';
export const UPDATE_SUBJECT_SUCCESS = 'UPDATE_SUBJECT_SUCCESS';
export const ADD_SUBJECT_REQUEST = 'ADD_SUBJECT_REQUEST';
export const ADD_SUBJECT_FAILURE = 'ADD_SUBJECT_FAILURE';
export const ADD_SUBJECT_SUCCESS = 'ADD_SUBJECT_SUCCESS';
export const SET_LINK_MODE = 'SET_LINK_MODE';
export const SET_ADD_SUBJECT_MODE = 'SET_ADD_SUBJECT_MODE';

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

export function setAddSubjectMode(mode=null) {
  // Update state to enable or disable AddSubject mode
  return {
    type: SET_ADD_SUBJECT_MODE,
    mode,
  };
}

export function setActiveSubject(subject) {
  return dispatch => {
    dispatch(RecordActions.setActiveRecord(null));
    dispatch(hideActionPanel());
    dispatch({
      type: SET_ACTIVE_SUBJECT,
      subject,
    });
  };
}

export function fetchSubjects(protocolId) {
  return dispatch => {
    dispatch(requestSubjects(protocolId));
    var url = 'api/protocols/' + protocolId + '/subjects/'
    return fetch(url, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Authorization': 'token ' + token
        }
    })
      .then(response => response.json())
      .then(json => dispatch(receiveSubjects(json)));
  };
}

export function addSubjectRequest(){
    return {
        type: ADD_SUBJECT_REQUEST,
        isSaving: true
    }
}

export function addSubjectSuccess(protocol){
    return dispatch => {
        dispatch(NotificationActions.addNotification(
            {
                'message': 'Subject Added',
                'level': 'success',
                'autoDismiss': 2
            }
        ))
        dispatch(ProtocolActions.setAddSubjectMode())
        dispatch(fetchSubjects(protocol.id))
        dispatch({
            type: ADD_SUBJECT_SUCCESS
        });
    }
}

export function addSubjectFailure(error){
    var errors = error.errors
    return {
        type: ADD_SUBJECT_FAILURE,
        errors: errors
    }
}

export function addSubject(protocol, subject) {
    return dispatch => {
        dispatch(addSubjectRequest());
        var url = 'api/protocols/' + protocol.id + '/subjects/create'
        return fetch(url, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Authorization': 'token ' + token,
                'X-CSRFToken': csrf_token
            },
            body: JSON.stringify(subject)
        })
            .then(response => response.json())
            .then(checkAddSubject)
            .then(subject => dispatch(addSubjectSuccess(protocol)))
            .catch(errors => dispatch(addSubjectFailure(errors)))
    }
}


export function updateSubjectRequest() {
    return {
        type: UPDATE_SUBJECT_REQUEST,
        isSaving: true
    }
}
export function updateSubjectSuccess(subject) {
    return dispatch => {
        dispatch({
            type: UPDATE_SUBJECT_SUCCESS,
            isFetching: false,
            subject: subject
        })
        dispatch(NotificationActions.addNotification(
            {
                'message': 'Subject Updated',
                'level': 'success',
                'autoDismiss': 2
            }
        ))
        dispatch(NotificationActions.renderNotification());
    }

}

export function updateSubject(protocol, subject) {
  return dispatch => {
      dispatch(updateSubjectRequest());
      var url = 'api/protocols/' + protocol.id + '/subjects/' + subject.id
      return fetch(url, {
          method: 'PUT',
          headers: {
              'Accept': 'application/json',
              'Authorization': 'token ' + token,
              'X-CSRFToken': csrf_token
          },
          body: JSON.stringify(subject)
      })
        .then(checkStatus)
        .then(response => response.json())
        .then(json => dispatch(updateSubjectSuccess(json)))
  }
}

export function showInfoPanel() {
    return {
        type: SHOW_INFO_PANEL
    };
}

export function hideInfoPanel() {
    return {
        type: HIDE_INFO_PANEL
    };
}

export function showActionPanel() {
    return {
        type: SHOW_ACTION_PANEL
    };
}

export function hideActionPanel() {
    return {
        type: HIDE_ACTION_PANEL
    };
}

export function setLinkMode(mode=null){
    return {
        type: SET_LINK_MODE,
        mode
    }
}
