import fetch  from 'isomorphic-fetch';
import * as NotificationActions from './notification';

export const REQUEST_PDS = 'REQUEST_PDS';
export const RECEIVE_PDS = 'RECEIVE_PDS';


function checkResponse(response){
    if (response.status >= 200 && response.status < 300) {
      return response
    } else {
      var error = new Error(response.statusText)
      error.response = response
      throw error
    }
    }

export function requestPDS() {
  return {
    type: REQUEST_PDS
  };
}

export function receivePDS(json) {
  return {
    type: RECEIVE_PDS,
    pds: json,
    receivedAt: Date.now(),
  };
};

export function fetchPDS(protocolId) {
  return dispatch => {
    dispatch(requestPDS());
    var url = 'api/protocols/' + protocolId + '/data_sources/'
    return fetch(url, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Authorization': 'token ' + token
        }
    })
      .then(function(response){
            if (response.status >= 200 && response.status < 300) {
              return response
            } else {
              var error = new Error(response.statusText)
              error.response = response
              throw error
            }
       })
      .then(response => response.json())
      .then(json => dispatch(receivePDS(json)))
      .catch(function(error){
          dispatch(NotificationActions.addNotification({'message':'Error Contacting the electronic Honest Broker', 'level':'error'}))
          // This is a bit of a hack to get the Notification System to render properly.
          dispatch(NotificationActions.renderNotification())
      }
      )
  };
}
