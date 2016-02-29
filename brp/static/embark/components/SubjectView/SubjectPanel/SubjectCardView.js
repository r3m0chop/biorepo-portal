// jscs:disable requireCamelCaseOrUpperCaseIdentifiers
// jscs:disable maximumLineLength
import React from 'react';
import { Link, History } from 'react-router';
import { connect } from 'react-redux';
import * as SubjectActions from '../../../actions/subject';
import ExternalIDs from './ExternalIds';

class SubjectCardView extends React.Component{

  constructor(props) {
    super(props);
  }

  render() {
    const subject = this.props.subject.activeSubject;
    const editUrl = this.props.path + '/edit';
    return (
      <div className="col-md-4 col-sm-6">
        <div className="card">
          <div className="more">
            <Link to={editUrl} type="button" className="btn btn-simple btn-icon btn-danger" >
              <i className="ti-pencil"></i>
            </Link>
          </div>
          <div className="content">
            <h6 className="category">{ subject.organization_name }</h6>
            <h4 className="title">{ subject.first_name } { subject.last_name }</h4>
            <p className="description">Org ID: { subject.organization_subject_id }</p>
            <p className="description">Date of birth: { subject.dob }</p>
            <ExternalIDs externalIds={subject.external_ids} />
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    protocol: {
      items: state.protocol.items,
      activeProtocol: state.protocol.activeProtocol,
    },
    subject: {
      items: state.subject.items,
      activeSubject: state.subject.activeSubject,
    },
    pds: {
      items: state.pds.items,
    },
    showInfoPanel: state.subject.showInfoPanel,
    showActionPanel: state.subject.showActionPanel,
  };
}

export default connect(mapStateToProps)(SubjectCardView);
