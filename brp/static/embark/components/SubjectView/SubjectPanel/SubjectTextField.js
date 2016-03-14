import React from 'react';
import { connect } from 'react-redux';
import TextField from 'material-ui/lib/text-field';
import * as SubjectActions from '../../../actions/subject';

class SubjectTextField extends React.Component{

  constructor(props) {
    super(props);
  }

  onChange(e) {
    // Check to see if we're editing an existing subject
    if (!this.props.new) {
      // Changing the input fields should update the state of the active subject
      var sub = this.props.subject;
      sub[this.props.skey] = e.target.value;
      this.props.dispatch(SubjectActions.setActiveSubject(sub));
    } else {
      var sub = this.props.newSubject;
      sub[this.props.skey] = e.target.value;
    }
  }

  render() {
    if (this.props.error) {
      var errorText = 'This field is required.';
    };

    return (
      <TextField
        onChange={this.onChange.bind(this)}
        style={{ width:'100%' }}
        value={this.props.value}
        floatingLabelText={this.props.label}
        errorText={errorText}
      />
    );
  }
}

function mapStateToProps(state) {
  return {
    subject: state.subject.activeSubject,
    newSubject: state.subject.newSubject,
  };
}

export default connect(mapStateToProps)(SubjectTextField);
