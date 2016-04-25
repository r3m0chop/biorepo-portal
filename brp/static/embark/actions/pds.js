/* global token*/
import fetch from 'isomorphic-fetch';
import * as NotificationActions from './notification';

export const REQUEST_PDS = 'REQUEST_PDS';
export const RECEIVE_PDS = 'RECEIVE_PDS';
export const SET_ACTIVE_PDS = 'SET_ACTIVE_PDS';
export const REQUEST_PDS_LINKS = 'REQUEST_PDS_LINKS';
export const RECEIVE_PDS_LINKS = 'RECEIVE_PDS_LINKS';

export function requestPDS() {
  return {
    type: REQUEST_PDS,
  };
}

export function receivePDS(json) {
  return {
    type: RECEIVE_PDS,
    pds: json,
    receivedAt: Date.now(),
  };
}

export function setActivePDS(pds) {
  return {
    type: SET_ACTIVE_PDS,
    pds,
  };
}

export function fetchPDS(protocolId) {
  // Fetch all protocol data sources for the given Protocol
  return dispatch => {
    // Update state to reflect asyncronous action
    dispatch(requestPDS());
    const url = `api/protocols/${protocolId}/data_sources/`;
    return fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `token ${token}`,
      },
    })

      // Check response status
      .then(response => {
        if (response.status >= 200 && response.status < 300) {
          return response;
        }
        const error = new Error(response.statusText);
        error.response = response;
        throw error;
      })

      // Get json from response
      .then(response => response.json())

      // Pass json to complete async action
      .then(json => dispatch(receivePDS(json)))

      // Catch errors to add notification
      .catch(error => {
        dispatch(NotificationActions.addNotification(
          {
            message: 'Error Contacting the electronic Honest Broker',
            level: 'error',
            error,
          }
        ));

        // This is a bit of a hack to get the Notification System to render properly.
        dispatch(NotificationActions.renderNotification());
      }
    );
  };
}

export function requestPDSLinks() {
  return {
    type: REQUEST_PDS_LINKS,
  };
}

export function receivePDSLinks(pdsId, json) {
  return {
    type: RECEIVE_PDS_LINKS,
    pds: pdsId,
    links: json,
  };
}

export function fetchPDSLinks(pdsId) {
  const url = `api/protocoldatasources/${pdsId}/links/`;
  return dispatch => {
    dispatch(requestPDSLinks());
    fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `token ${token}`,
      },
    })
      .then(response => response.json())
      .then(json => dispatch(receivePDSLinks(pdsId, json)));
  };
}
