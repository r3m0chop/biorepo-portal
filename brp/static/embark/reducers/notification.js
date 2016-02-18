import { ADD_NOTIFICATION, REMOVE_NOTIFICATION,
         RENDER_NOTIFICATION } from '../actions/notification';

const initialState = {
  items: [],
};

function notification(state = initialState, action) {
  switch (action.type){
    case RENDER_NOTIFICATION:
      return Object.assign({}, state, {
        items: [],
      });
    case ADD_NOTIFICATION:
      return Object.assign({}, state, {
        items: state.items.concat(action.notification),
      });
    case REMOVE_NOTIFICATION:
      var notifications = state.items.filter(function (notification) {
        if (notification.message != action.notification.message) {
          return notification;
        }
      });

      return Object.assign({}, state, {
        items: notifications,
      });
    default:
      return state;
  }
}

export default notification;
