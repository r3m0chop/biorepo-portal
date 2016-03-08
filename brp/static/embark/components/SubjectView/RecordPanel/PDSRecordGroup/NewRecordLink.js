// jscs:disable requireCamelCaseOrUpperCaseIdentifiers
import React from 'react';
import SelectField from 'material-ui/lib/select-field';
import MenuItem from 'material-ui/lib/menus/menu-item';
import RaisedButton from 'material-ui/lib/raised-button';
import * as RecordActions from '../../../../actions/record';
import * as SubjectActions from '../../../../actions/subject';

import { connect } from 'react-redux';

class NewRecordLink extends React.Component {

  handleRecordLabelSelect(e, index, value) {
    const { dispatch } = this.props;
    dispatch(RecordActions.setSelectedLabel(value));
  }

  handleNewRecordClick() {
    const { dispatch } = this.props;
    dispatch(SubjectActions.setLinkMode());
  }

  onChange(e, index, value) {
    const { dispatch } = this.props;
    dispatch(RecordActions.setSelectedLinkType(value));
  };

  render() {
    const primaryRecord = this.props.activeRecord;
    const secondaryRecord = this.props.pendingLinkedRecord;

    var selectStyle = {
      marginLeft: '10px',
    };

    var buttonStyle = {
      width:'auto',
      marginTop:'20px',
      marginLeft: '25%',
    };
    return (
      <div>
        <div>
          Select Link Type
        </div>
        <div>
        { primaryRecord ? primaryRecord.label_desc : null }
        </div>
        <SelectField onChange={this.onChange.bind(this)}
          value={this.props.selectedLinkType}
        >
          <MenuItem value={0} primaryText={'Diagnosis of'} />
        </SelectField>
        <div>
        { secondaryRecord ? secondaryRecord.label_desc : null }
        </div>
        <div>
          <RaisedButton onClick={this.handleNewRecordClick.bind(this)}
            label={'Link Records'}
            labelColor={'#7AC29A'}
            type="submit"
            style={{ width:'100%' }}
          />
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    subject: state.subject.activeSubject,
    selectedLabel: state.record.selectedLabel,
    activeRecord: state.record.activeRecord,
    pendingLinkedRecord: state.record.pendingLinkedRecord,
    selectedLinkType: state.record.selectedLinkType,
  };
}

export default connect(mapStateToProps)(NewRecordLink)
