import React from 'react';
import ProjectMenu from '../components/ProjectMenu';
import NotificationSystem from 'react-notification-system';
import Navbar from '../components/Navbar';
import { connect } from 'react-redux';
import {Link} from 'react-router';
import * as ProtocolActions from '../actions/protocol';
import * as NotificationActions from '../actions/notification';

class App extends React.Component {

    constructor(props) {
        super(props);
        this._notificationSystem = null;
    }

    componentDidMount(){
      const { dispatch } = this.props;
      this._notificationSystem = this.refs.notificationSystem
      dispatch(ProtocolActions.fetchProtocols())
    }

    componentWillReceiveProps(){
        this.processNotifications()
    }

    processNotifications(){
        // First check that the notification system is available
        const { dispatch } = this.props;
        if (this._notificationSystem){
            // Always reset the notification systems state we are managing it through redux
            this._notificationSystem.state.notifications = []
            // Iterate over the notifications in your state
            this.props.notifications.items.forEach(function(notification){
                // Define callback to remove notification when done display
                notification.onRemove = function(notification){
                    dispatch(NotificationActions.removeNotification(notification))
                };
                // Add notification to system state
                this._notificationSystem.addNotification(notification);
            }, this)
        }
    }

    render() {
        return (
            <div>
                <Navbar/>
                <NotificationSystem ref="notificationSystem"/>
                {this.props.children}
            </div>
        )
    }
}

function mapStateToProps(state) {

  return {
    protocol: {
      items: state.protocol.items
    },
    notifications: {
      items: state.notification.items
    }
  };
}

export default connect(mapStateToProps)(App);
