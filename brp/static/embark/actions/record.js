// jscs:disable requireCamelCaseOrUpperCaseIdentifiers
export const SET_ACTIVE_RECORD = 'SET_ACTIVE_RECORD';
export const REQUEST_LABELS = 'REQUEST_LABELS';
export const RECEIVE_LABELS = 'RECEIVE_LABELS';
export const RECEIVE_RECORDS = 'RECEIVE_RECORDS';
export const REQUEST_RECORDS = 'REQUEST_RECORDS';
export const SET_EDIT_LABEL_MODE = 'SET_EDIT_LABEL_MODE';
export const SET_SELECTED_LABEL = 'SET_SELECTED_LABEL';
export const CLEAR_RECORD_STATE = 'CLEAR_RECORD_STATE';
export const SET_PENDING_LINKED_RECORD = 'SET_PENDING_LINKED_RECORD';
export const SET_SELECTED_LINK_TYPE = 'SET_SELECTED_LINK_TYPE';

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
      if (label[0] == record.label_id) {
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

export function fetchRecords(pds, subjectId) {
  return dispatch => {
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
