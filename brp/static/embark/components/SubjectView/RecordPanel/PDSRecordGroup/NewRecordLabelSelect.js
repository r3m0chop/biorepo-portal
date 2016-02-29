// jscs:disable requireCamelCaseOrUpperCaseIdentifiers
import React from 'react';
import SelectField from 'material-ui/lib/select-field';
import MenuItem from 'material-ui/lib/menus/menu-item';
import RaisedButton from 'material-ui/lib/raised-button';
import * as RecordActions from '../../../../actions/record';

import { connect } from 'react-redux';

class NewRecordLabelSelect extends React.Component {

  handleRecordLabelSelect(e, index, value) {
    const { dispatch } = this.props;
    dispatch(RecordActions.setSelectedLabel(value));
  }

  handleNewRecordClick() {
    var url = '/dataentry/protocoldatasource/';
    url += this.props.pds.id;
    url += '/subject/';
    url += this.props.subject.id;
    url += '/create/?label_id=';
    url += this.props.selectedLabel;
    window.location.href = url;
  }

  render() {
    const labels = this.props.pds.driver_configuration.labels;

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
          <span>Select label for {this.props.pds.display_label} Record:</span>
          <SelectField onChange={this.handleRecordLabelSelect.bind(this)}
            style={{ width:'100%' }}
            value={this.props.selectedLabel}
          >
            { labels.map(function (label, i) {
              return (<MenuItem key={i} value={label[0]} primaryText={label[1]} />);
            })}
          </SelectField>
        </div>
        <div>
          <RaisedButton onClick={this.handleNewRecordClick.bind(this)}
            label={'Create New'}
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
  };
}

export default connect(mapStateToProps)(NewRecordLabelSelect)
