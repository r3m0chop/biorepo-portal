import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import * as ProtocolActions from '../../actions/protocol';

class ProjectMenu extends React.Component {

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(ProtocolActions.setActiveProtocol(null));
    if (this.props.protocol.items.length === 0 && !this.props.protocol.isFetching) {
      dispatch(ProtocolActions.fetchProtocols());
    }
  }
  render() {
    return (
      <div className="card">
        <p>Welcome Back</p>
        <p><i>Select a project for data entry</i></p>
        {this.props.protocol.items.map((protocol, i) => {
          const url = `dataentry/protocol/${protocol.id}`;
          return (
            <div key={i} className="lg-col-12">
              <Link
                className="project-row-link"
                to={url}
              >
                {protocol.name}
              </Link>
            </div>
          );
        }, this)}
      </div>
    );
  }
}

ProjectMenu.propTypes = {
  dispatch: React.PropTypes.func,
  protocol: React.PropTypes.object,
};

function mapStateToProps(state) {
  return {
    protocol: {
      items: state.protocol.items,
      isFetching: state.protocol.isFetching,
    },
  };
}

export default connect(mapStateToProps)(ProjectMenu);
