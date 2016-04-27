// jscs:disable requireCamelCaseOrUpperCaseIdentifiers
import React from 'react';
import SelectField from 'material-ui/lib/select-field';
import MenuItem from 'material-ui/lib/menus/menu-item';
import RaisedButton from 'material-ui/lib/raised-button';
import * as RecordActions from '../../../../actions/record';

import { connect } from 'react-redux';

class NewRecordLabelSelect extends React.Component {

  constructor(props) {
    super(props);
    this.handleRecordLabelSelect = this.handleRecordLabelSelect.bind(this);
    this.handleNewRecordClick = this.handleNewRecordClick.bind(this);
  }

  handleRecordLabelSelect(e, index, value) {
    const { dispatch } = this.props;
    dispatch(RecordActions.setSelectedLabel(value));
  }

  handleNewRecordClick() {
    const url = `/dataentry/protocoldatasource/${this.props.pds.id}/subject/` +
      `${this.props.subject.id}/create/?label_id=${this.props.selectedLabel}`;
    window.location.href = url;
  }

  render() {
    const labels = this.props.pds.driver_configuration.labels;

    return (
      <div>
        <div>
          <span>Select label for {this.props.pds.display_label} Record:</span>
          <SelectField
            onChange={this.handleRecordLabelSelect}
            style={{ width: '100%' }}
            value={this.props.selectedLabel}
          >
            {labels.map((label, i) => (
              <MenuItem key={i} value={label[0]} primaryText={label[1]} />
            ))}
          </SelectField>
        </div>
        <div>
          <RaisedButton
            onClick={this.handleNewRecordClick}
            label={'Create New'}
            labelColor={'#7AC29A'}
            type="submit"
            style={{ width: '100%' }}
          />
        </div>
      </div>
    );
  }
}

NewRecordLabelSelect.propTypes = {
  dispatch: React.PropTypes.func,
  subject: React.PropTypes.object,
  selectedLabel: React.PropTypes.number,
  pds: React.PropTypes.object,
};

function mapStateToProps(state) {
  return {
    subject: state.subject.activeSubject,
    selectedLabel: state.record.selectedLabel,
  };
}

export default connect(mapStateToProps)(NewRecordLabelSelect);
