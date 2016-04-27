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
    this.handleCloseClick = this.handleCloseClick.bind(this);
    this.onChange = this.onChange.bind(this);
  }

  onChange(e, index, value) {
    const record = this.props.activeRecord;
    const { dispatch } = this.props;

    const label = this.props.activePDS.driver_configuration.labels.find((lbl) => {
      if (lbl[0] === value) {
        return lbl;
      }
      return null;
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

  handleCloseClick() {
    const { dispatch } = this.props;
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
    };
    const cardStyle = {
      padding: '15px',
      boxShadow: '3px 3px 14px rgba(204, 197, 185, 0.5)',
      backgroundColor: 'white',
    };
    const backdropStyle = {
      position: 'fixed',
      top: '0px',
      left: '0px',
      width: '100%',
      height: '100%',
      zIndex: 99,
      display: 'block',
      backgroundColor: 'rgba(0, 0, 0, 0.298039)',
    };
    return (
      <section>
        <div style={backdropStyle}></div>
        <div className="col-sm-2 edit-label-modal" style={editLabelModalStyle}>
          <div className="card" style={cardStyle}>
            <h6 className="category">Edit Record Label</h6>
            <div className="more">
            </div>
            <div className="content">
              <SelectField
                style={{ width: '100%' }}
                onChange={this.onChange}
                value={this.props.activeRecord.label}
              >
                {labels.map((label, i) => (
                  <MenuItem key={i} value={label[0]}>{label[1]}</MenuItem>))
                }
              </SelectField>
            </div>
            <RaisedButton
              style={{ width: '100%' }}
              labelColor={Colors.red400}
              label="Cancel"
              onClick={this.handleCloseClick}
            />
          </div>
        </div>
      </section>
    );
  }
}

EditLabelModal.propTypes = {
  dispatch: React.PropTypes.func,
  protocol: React.PropTypes.object,
  subject: React.PropTypes.object,
  activeRecord: React.PropTypes.object,
  linkMode: React.PropTypes.bool,
  selectedLabel: React.PropTypes.object,
  activePDS: React.PropTypes.object,
};

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
