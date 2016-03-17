// jscs:disable requireCamelCaseOrUpperCaseIdentifiers
import React from 'react';
import { connect } from 'react-redux';
import SelectField from 'material-ui/lib/select-field';
import MenuItem from 'material-ui/lib/menus/menu-item';
import RaisedButton from 'material-ui/lib/raised-button';
import * as RecordActions from '../../../actions/record';
import * as Colors from 'material-ui/lib/styles/colors';

class EditLabelModal extends React.Component {

  constructor(props) {
    super(props);
  }

  handleCloseClick() {
    const { dispatch } = this.props;
    dispatch(RecordActions.setEditLabelMode());
  }

  onChange(e, index, value) {
    var record =  this.props.activeRecord;
    const { dispatch } = this.props;

    var label = this.props.activePDS.driver_configuration.labels.find(function (label) {
      if (label[0] == value) {
        return label;
      }
    });

    record.label = label[0];
    record.label_id = label[0];
    record.label_desc = label[1];
    dispatch(RecordActions.setActiveRecord(record));
    dispatch(RecordActions.updateRecord(
      this.props.activePDS.id,
      this.props.subject.id,
      record));
    dispatch(RecordActions.setEditLabelMode());
  }

  render() {
    const labels = this.props.activePDS.driver_configuration.labels;
    const editLabelModalStyle = {
        left: '50%',
        marginLeft: '-5em',
        marginBottom: '3em',
        position: 'fixed',
        zIndex: '1000',
    }
    return (
      <div className="col-sm-2 edit-label-modal" style={editLabelModalStyle}>
        <div className="card" style={{ backgroundColor: 'white' }}>
          <h6 className="category">Edit Record Label</h6>
          <div className="more">
          </div>
          <div className="content">
            <SelectField style={{ width:'100%' }}
              onChange={this.onChange.bind(this)}
              value={this.props.activeRecord.label}
            >
              { labels.map(function (label, i) {
                  return <MenuItem key={i} value={label[0]}>{label[1]}</MenuItem>;
                })
              }
            </SelectField>
          </div>
          <RaisedButton style={{ width: '100%' }}
            labelColor={Colors.red400}
            label="Cancel"
            onClick={this.handleCloseClick.bind(this)}
          />
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
    subject: state.subject.activeSubject,
    activeRecord: state.record.activeRecord,
    linkMode: state.subject.linkMode,
    selectedLabel: state.record.selectedLabel,
    activePDS: state.pds.activePDS,
  };
}

export default connect(mapStateToProps)(EditLabelModal);
