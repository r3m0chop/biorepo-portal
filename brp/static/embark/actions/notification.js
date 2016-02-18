export const ADD_NOTIFICATION = 'ADD_NOTIFICATION';
export const REMOVE_NOTIFICATION = 'REMOVE_NOTIFICATION';
export const RENDER_NOTIFICATION = 'RENDER_NOTIFICATION';

export function addNotification(notification) {
  // Add a notification to the notification system.
  return {
    type: ADD_NOTIFICATION,
    notification: notification,
  };
}

export function removeNotification(notification) {
  // Add a notification to the notification system.
  return {
    type: REMOVE_NOTIFICATION,
    notification: notification,
  };
}

export function renderNotification() {
  // Add a notification to the notification system.
  return {
    type: RENDER_NOTIFICATION,
  };
}
