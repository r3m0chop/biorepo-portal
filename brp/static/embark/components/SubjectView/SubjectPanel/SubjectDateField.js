// jscs:disable requireCamelCaseOrUpperCaseIdentifiers
import React from 'react';
import { connect } from 'react-redux';
import DatePicker from 'material-ui/lib/date-picker/date-picker';
import * as SubjectActions from '../../../actions/subject';

class SubjectDateField extends React.Component{
  constructor(props) {
    super(props);
  }

  onChange(e, value) {
    // Check to see if we're editing an existing subject
    if (!this.props.new) {
      // Changing the input fields should update the state of the active subject
      var sub = this.props.subject;
      // this.props.dispatch(SubjectActions.setActiveSubject(sub));
    } else {
      var new_sub = this.props.newSubject;
      new_sub.dob = value;
      this.props.dispatch(SubjectActions.setNewSubject(new_sub));
    }
  }

  formatDate(date) {
    return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
  }

  render() {
    return (
      <DatePicker
        onChange={this.onChange.bind(this)}
        style={{ width:'100%', whiteSpace: 'nowrap' }}
        hintText="Date of Birth"
        mode="landscape"
        value={this.props.value}
        formatDate={this.formatDate} />
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

export default connect(mapStateToProps)(SubjectDateField);
