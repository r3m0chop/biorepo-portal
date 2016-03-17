import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import * as ProtocolActions from '../../actions/protocol';
import * as SubjectActions from '../../actions/subject';

class ProjectMenu extends React.Component {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    const { dispatch } = this.props
    dispatch(ProtocolActions.setActiveProtocol(null));
    if (this.props.protocol.items.length == 0 && !this.props.protocol.isFetching) {
      dispatch(ProtocolActions.fetchProtocols());
    }
  }

  handleClick(protocol) {
    this.props.dispatch(ProtocolActions.setActiveProtocol(protocol));
    this.props.dispatch(SubjectActions.fetchSubjects(protocol.id));
  }

  render() {
    return (
        <div className="card">
          <p>Welcome Back</p>
          <p><i>Select a project for data entry</i></p>
          { this.props.protocol.items.map(function (protocol, i) {
            var url = 'dataentry/protocol/' + protocol.id;
            return (
                <div key={i} className="lg-col-12">
                <Link
                  className="project-row-link"
                  onClick={this.handleClick.bind(this, protocol)}
                  to={url}> {protocol.name}
                </Link>
                </div>
            );
          }, this)}
          { this.props.children }
        </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    protocol: {
      items: state.protocol.items,
      isFetching: state.protocol.isFetching,
    },
  };
}

export default connect(mapStateToProps)(ProjectMenu);
