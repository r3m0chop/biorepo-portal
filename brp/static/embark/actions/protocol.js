import fetch  from 'isomorphic-fetch';
import * as PDSActions from './pds';

export const SET_ACTIVE_PROTOCOL = 'SET_ACTIVE_PROTOCOL';
export const REQUEST_PROTOCOLS = 'REQUEST_PROTOCOLS';
export const REQUEST_PROTOCOL_ORGS = 'REQUEST_PROTOCOL_ORGS';
export const RECEIVE_PROTOCOL_ORGS = 'RECEIVE_PROTOCOL_ORGS';
export const RECEIVE_PROTOCOLS = 'RECEIVE_PROTOCOLS';

export function setActiveProtocol(protocol) {
  return dispatch => {
    // If there is an active protocol fetch its organizations and PDS
    if (protocol != null) {
      dispatch(fetchOrganizations(protocol));

      // Refresh PDS for the select Protocol
      dispatch(PDSActions.fetchPDS(protocol.id));
    }

    // Update our state with the Protocol given
    dispatch({
      type: SET_ACTIVE_PROTOCOL,
      protocol,
    });
  };
}

export function requestProtocols() {
  return {
    type: REQUEST_PROTOCOLS,
  };
}

export function receiveProtocols(json) {
  return {
    type: RECEIVE_PROTOCOLS,
    protocols: json,
    receivedAt: Date.now(),
  };
};

export function requestOrganizations() {
  return {
    type: REQUEST_PROTOCOL_ORGS,
  };
}

export function receiveOrganizations(json) {
  return {
    type: RECEIVE_PROTOCOL_ORGS,
    organizations: json,
  };
}

export function fetchProtocols() {
  // Fetch protocols authorized for authorized user.
  return dispatch => {
    dispatch(requestProtocols());
    return fetch(`api/protocols/`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: 'token ' + token,
      },
    })
      .then(response => response.json())
      .then(json => dispatch(receiveProtocols(json)));
  };
}

export function fetchOrganizations(protocol) {
  var url = 'api/protocols/' + protocol.id + '/organizations/';
  return dispatch => {
    dispatch(requestOrganizations());
    return fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: 'token ' + token,
      },
    })
      .then(response => response.json())
      .then(json => dispatch(receiveOrganizations(json)));
  };
}
