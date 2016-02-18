// jscs:disable requireCamelCaseOrUpperCaseIdentifiers
import React from 'react';
import { connect } from 'react-redux';
import * as SubjectActions from '../../../actions/subject';

class SubjectOrgSelectField extends React.Component{
  constructor(props) {
    super(props);
  }

  onChange(e) {

    // Check to see if we're editing an existing subject
    if (!this.props.new) {

      // Changing the input fields should update the state of the active subject
      var sub = this.props.subject;
      sub.organization_id = e.target.value;
      this.props.dispatch(SubjectActions.setActiveSubject(sub));
    } else {
      var sub = this.props.newSubject;
      sub.organization = e.target.value;
    }
  }

  render() {
    const orgs = this.props.orgs;
    return (
      <div className="form-group">
        <select onChange={this.onChange.bind(this)} value={this.props.value}>
          <option value="-1">--</option>
          { orgs ?
            orgs.map(function (org, i) {
              return <option key={i} value={org.id}>{org.name}</option>;
            }) : <option/>
          }
        </select>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    subject: state.subject.activeSubject,
    newSubject: state.subject.newSubject,
    orgs: state.protocol.orgs,
  };
}

export default connect(mapStateToProps)(SubjectOrgSelectField);
