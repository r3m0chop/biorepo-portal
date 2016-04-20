// jscs:disable requireCamelCaseOrUpperCaseIdentifiers
export const SET_ACTIVE_RECORD = 'SET_ACTIVE_RECORD';
export const REQUEST_LABELS = 'REQUEST_LABELS';
export const RECEIVE_LABELS = 'RECEIVE_LABELS';
export const REQUEST_RECORD_LINKS = 'REQUEST_RECORD_LINKS';
export const RECEIVE_RECORD_LINKS = 'RECEIVE_RECORD_LINKS';
export const RECEIVE_RECORDS = 'RECEIVE_RECORDS';
export const REQUEST_RECORDS = 'REQUEST_RECORDS';
export const SET_EDIT_LABEL_MODE = 'SET_EDIT_LABEL_MODE';
export const SET_SELECTED_LABEL = 'SET_SELECTED_LABEL';
export const CLEAR_RECORD_STATE = 'CLEAR_RECORD_STATE';
export const SET_PENDING_LINKED_RECORD = 'SET_PENDING_LINKED_RECORD';
export const SET_SELECTED_LINK_TYPE = 'SET_SELECTED_LINK_TYPE';
export const UPDATE_RECORD_REQUEST = 'UPDATE_RECORD_REQUEST';
export const UPDATE_RECORD_FAILURE = 'UPDATE_RECORD_FAILURE';
export const UPDATE_RECORD_SUCCESS = 'UPDATE_RECORD_SUCCESS';
export const DISMISS_LINK_TYPE_MODAL = 'DISMISS_LINK_TYPE_MODAL';
export const CREATE_RECORD_LINK_REQUEST = 'CREATE_RECORD_LINK_REQUEST';
export const CREATE_RECORD_LINK_SUCCESS = 'CREATE_RECORD_LINK_SUCCESS';
export const CREATE_RECORD_LINK_FAILURE = 'CREATE_RECORD_LINK_FAILURE';
export const DELETE_RECORD_LINK_REQUEST = 'DELETE_RECORD_LINK_REQUEST';
export const DELETE_RECORD_LINK_SUCCESS = 'DELETE_RECORD_LINK_SUCCESS';
export const DELETE_RECORD_LINK_FAILURE = 'DELETE_RECORD_LINK_FAILURE';
import * as NotificationActions from './notification';
import * as SubjectActions from './subject';

function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  } else {
    var error = new Error(response.statusText);
    error.response = response;
    return error;
  }
}

function checkLinkAction(json) {
  if (json.success) {
    return json
  } else {
    var error = new Error(json.error)
    throw error
  }
}

export function clearRecordState() {
  return {
    type: CLEAR_RECORD_STATE,
  };
};

export function setActiveRecord(record) {
  return {
    type: SET_ACTIVE_RECORD,
    activeRecord: record,
  };
}

export function setPendingLinkedRecord(record) {
  return {
    type: SET_PENDING_LINKED_RECORD,
    record: record,
  };
}

export function setSelectedLinkType(linkId) {
  return {
    type: SET_SELECTED_LINK_TYPE,
    linkId: linkId,
  };
}

export function setSelectedLabel(labelId) {
  return {
    type: SET_SELECTED_LABEL,
    selectedLabel: labelId,
  };
}

export function requestLabels() {
  return {
    type: REQUEST_LABELS,
    labels: [],
    isFetching: true,
  };
}

export function receiveLabels(json) {
  return {
    type: RECEIVE_LABELS,
    labels: json,
    isFetching: false,
    receivedAt: Date.now(),
  };
};

export function requestRecords() {
  return {
    type: REQUEST_RECORDS,
  };
}

export function receiveRecords(pds, json) {
  var records = json.map(function (record) {
    record.pds = pds.id;
    pds.driver_configuration.labels.forEach(function (label) {
      if (label[0] == record.label) {
        record.label_desc = label[1];
      }
    });

    return record;
  });

  return {
    type: RECEIVE_RECORDS,
    items: records,
    pds: pds,
  };
}

export function updateRecordRequest() {
  return {
    type: UPDATE_RECORD_REQUEST,
  };
};

export function updateRecordSuccess(record) {
  return dispatch => {
    dispatch({
      type: UPDATE_RECORD_SUCCESS,
      isFetching: false,
      record: record,
    });
    dispatch(NotificationActions.addNotification(
      {
        message: 'Record Updated',
        level: 'success',
        autoDismiss: 2,
      }
    ));
    dispatch(NotificationActions.renderNotification());
  };
};

export function updateRecord(pdsId, subjectId, record) {
  return dispatch => {
    dispatch(updateRecordRequest());
    var url = 'api/protocoldatasources/';
    url += pdsId;
    url += '/subjects/';
    url += subjectId;
    url += '/record/';
    url += record.id;
    url += '/';
    fetch(url, {
      method: 'PUT',
      headers: {
        Accept: 'application/json',
        Authorization: 'token ' + token,
        'X-CSRFToken': csrf_token,
      },
      body: JSON.stringify(record),
    })
      .then(checkStatus)
      .then(response => response.json())
      .then(json => dispatch(updateRecordSuccess(json)));
  };
}

export function fetchRecords(pds, subjectId) {
  return dispatch => {
    // If not authorized don't bother requesting records
    if (!pds.authorized) {
      return dispatch(receiveRecords(pds, []));
    };

    dispatch(requestRecords());
    var url = 'api/protocoldatasources/';
    url += pds.id;
    url += '/subjects/';
    url += subjectId;
    url += '/records/';
    return fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: 'token ' + token,
      },
    })
      .then(response => response.json())
      .then(json => dispatch(receiveRecords(pds, json)));
  };
}

export function setEditLabelMode(mode=null) {
  return {
    type: SET_EDIT_LABEL_MODE,
    mode,
  };
}

export function requestRecordLinks(){
  return {
    type: REQUEST_RECORD_LINKS,
  }
}

export function receiveRecordLinks(json){
  return {
    type: RECEIVE_RECORD_LINKS,
    links: json,
  }
}

export function dismissLinkModal(){
  return {
    type: DISMISS_LINK_TYPE_MODAL,
  }
}

export function fetchRecordLinks(pdsId, subjectId, recordId) {
  return dispatch => {
    dispatch(requestRecordLinks());
    var url = 'api/protocoldatasources/'
    url += pdsId;
    url += '/subjects/';
    url += subjectId;
    url += '/record/';
    url += recordId;
    url += '/links/';
    return fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: 'token ' + token,
      },
    })
      .then(response => response.json())
      .then(json => dispatch(receiveRecordLinks(json)))
  };
}

export function createRecordLinkRequest() {
  return {
    type: CREATE_RECORD_LINK_REQUEST,
  }
}

export function createRecordLinkSuccess(json, pds, subjectId, recordId) {
  return dispatch => {
    dispatch(fetchRecordLinks(pds, subjectId, recordId))
    dispatch(dismissLinkModal())
    dispatch(SubjectActions.setLinkMode(false))
    dispatch({
        type: CREATE_RECORD_LINK_SUCCESS,
    })
  }
}

export function createRecordLinkFailure(error) {
  return {
    type: CREATE_RECORD_LINK_FAILURE,
    error: error,
  }
}

export function createRecordLink(primaryRecord, secondaryRecord) {
  return (dispatch, getState) => {
    const state = getState()
    dispatch(createRecordLinkRequest());
    var url = 'api/protocoldatasources/'
    url += primaryRecord.pds;
    url += '/subjects/';
    url += state.subject.activeSubject.id;
    url += '/record/';
    url += primaryRecord.id;
    url += '/links/';
    var data = {
      primaryRecord: primaryRecord,
      secondaryRecord: secondaryRecord,
      linkType: state.record.selectedLinkType
    }
    fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: 'token ' + token,
      },
      body: JSON.stringify(data),
    })
      .then(response => response.json())
      .then(checkLinkAction)
      .then(json => dispatch(createRecordLinkSuccess(json, primaryRecord.pds, state.subject.activeSubject.id, primaryRecord.id)))
      .catch(error => dispatch(createRecordLinkFailure(error)))
  };
}

export function deleteRecordLinkRequest() {
  return {
    type: DELETE_RECORD_LINK_REQUEST,
  }
}

export function deleteRecordLinkSuccess(json, linkId) {
  return {
    type: DELETE_RECORD_LINK_SUCCESS,
    linkId: linkId,
  }
}

export function deleteRecordLinkFailure(error) {
  return {
    type: DELETE_RECORD_LINK_FAILURE,
    error: error,
  }
}

export function deleteRecordLink(primaryRecord, linkId) {
  return (dispatch, getState) => {
    const state = getState()
    dispatch(deleteRecordLinkRequest());
    var url = 'api/protocoldatasources/'
    url += primaryRecord.pds;
    url += '/subjects/';
    url += state.subject.activeSubject.id;
    url += '/record/';
    url += primaryRecord.id;
    url += '/links/';
    var data = {
      primaryRecord: primaryRecord,
      linkId: linkId
    }
    fetch(url, {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
        Authorization: 'token ' + token,
      },
      body: JSON.stringify(data),
    })
      .then(response => response.json())
      .then(checkLinkAction)
      .then(json => dispatch(deleteRecordLinkSuccess(json, linkId)))
      .catch(error => dispatch(deleteRecordLinkFailure(error)))
  };
}
