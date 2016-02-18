
export const SET_ACTIVE_RECORD = 'SET_ACTIVE_RECORD';
export const REQUEST_LABELS = 'REQUEST_LABELS';
export const RECEIVE_LABELS = 'RECEIVE_LABELS';
export const SET_EDIT_LABEL_MODE = 'SET_EDIT_LABEL_MODE';
export const SET_SELECTED_LABEL = 'SET_SELECTED_LABEL';

export function setActiveRecord(record) {
  return {
    type: SET_ACTIVE_RECORD,
    activeRecord: record,
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

export function setEditLabelMode(mode=null) {
  return {
    type: SET_EDIT_LABEL_MODE,
    mode,
  };
}

export function fetchRecordLabels(pds) {
  //TODO
}
