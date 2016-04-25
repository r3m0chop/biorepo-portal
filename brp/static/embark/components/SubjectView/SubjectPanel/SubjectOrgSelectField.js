// jscs:disable requireCamelCaseOrUpperCaseIdentifiers
import React from 'react';
import { connect } from 'react-redux';
import SelectField from 'material-ui/lib/select-field';
import MenuItem from 'material-ui/lib/menus/menu-item';
import * as SubjectActions from '../../../actions/subject';

class SubjectOrgSelectField extends React.Component{
  constructor(props) {
    super(props);
  }

  onChange(e, index, value) {
    // Check to see if we're editing an existing subject
    if (!this.props.new) {
      // Changing the input fields should update the state of the active subject
      var sub = this.props.subject;
      sub.organization_id = value;
      this.props.dispatch(SubjectActions.setActiveSubject(sub));
    } else {
      var new_sub = this.props.newSubject;
      new_sub.organization = value;
      this.props.dispatch(SubjectActions.setNewSubject(new_sub));
    }
  }

  render() {
    const orgs = this.props.orgs;

    if (this.props.error) {
      var errorText = 'Please select an organization.';
    };

    return (
      <SelectField
        onChange={this.onChange.bind(this)}
        style={{ width:'100%', whiteSpace: 'nowrap' }}
        value={this.props.value}
        errorText={errorText}
      >
        { orgs ?
          orgs.map(function (org, i) {
            return <MenuItem key={i} value={org.id} primaryText={org.name} />;
          }) : <MenuItem/>
        }
      </SelectField>
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
