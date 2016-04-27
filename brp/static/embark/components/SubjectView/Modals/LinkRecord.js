import React from 'react';
import SelectField from 'material-ui/lib/select-field';
import MenuItem from 'material-ui/lib/menus/menu-item';
import RaisedButton from 'material-ui/lib/raised-button';
import * as RecordActions from '../../../actions/record';
import * as SubjectActions from '../../../actions/subject';
import * as Colors from 'material-ui/lib/styles/colors';

import { connect } from 'react-redux';

class LinkRecord extends React.Component {

  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
    this.handleLinkRecordClick = this.handleLinkRecordClick.bind(this);
    this.handleRecordLabelSelect = this.handleRecordLabelSelect.bind(this);
    this.handleNewRecordClick = this.handleNewRecordClick.bind(this);
    this.handleCloseClick = this.handleCloseClick.bind(this);
  }

  onChange(e, index, value) {
    const { dispatch } = this.props;
    dispatch(RecordActions.setSelectedLinkType(value));
  }

  handleRecordLabelSelect(e, index, value) {
    const { dispatch } = this.props;
    dispatch(RecordActions.setSelectedLabel(value));
  }

  handleNewRecordClick() {
    const { dispatch } = this.props;
    dispatch(SubjectActions.setLinkMode(false));
  }

  handleLinkRecordClick() {
    const { dispatch } = this.props;
    const activeRecord = this.props.activeRecord;
    const secondaryRecord = this.props.pendingLinkedRecord;
    dispatch(RecordActions.createRecordLink(activeRecord, secondaryRecord));
  }

  handleCloseClick() {
    const { dispatch } = this.props;
    dispatch(RecordActions.dismissLinkModal());
    dispatch(SubjectActions.setLinkMode(false));
  }

  validateModal() {
    // Make sure type is selected
  }

  render() {
    const primaryRecord = this.props.activeRecord;
    const secondaryRecord = this.props.pendingLinkedRecord;
    const modalStyle = {
      left: '45%',
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
    const recordStyle = {
      padding: '5px',
      margin: '15px',
      borderStyle: 'solid',
      borderWidth: '1px',
      borderColor: '#DDD',
    };
    const linkErrorStyle = {
      padding: '5px',
      margin: '15px',
    };
    const activePds = this.props.activeRecord.pds;
    const availableLinkTypes = this.props.availableLinkTypes[activePds];
    const canLink = availableLinkTypes.length > 0;
    return (
      <section>
        <div style={backdropStyle}></div>
        <div className="col-sm-3 edit-label-modal" style={modalStyle}>
          <div className="card" style={cardStyle}>
            <h6 className="category"> Select Link Type</h6>
            <div className="more">
            </div>
            <div className="content">
              {canLink ?
                <div>
                  <div style={recordStyle}>
                    <h6>
                      {primaryRecord ?
                        <span>{primaryRecord.label_desc} ID: {primaryRecord.id}</span> :
                        null}
                    </h6>
                  </div>
                  <SelectField
                    onChange={this.onChange}
                    value={this.props.selectedLinkType}
                    style={{ width: '100%' }}
                  >
                    {availableLinkTypes.map((link, i) => (
                      <MenuItem key={i} value={link.id} primaryText={link.desc} />
                      ))}
                  </SelectField>
                  <div style={recordStyle}>
                    <h6>
                      {secondaryRecord ?
                        <span>{secondaryRecord.label_desc} ID: {secondaryRecord.id}</span> :
                        null
                      }
                    </h6>
                  </div>
                  {this.props.linkError != null ?
                    <div style={linkErrorStyle}>Error: {this.props.linkError}</div> :
                    null
                  }
                  <RaisedButton
                    style={{ width: '100%' }}
                    labelColor={'#7AC29A'}
                    label="Link Records"
                    onClick={this.handleLinkRecordClick}
                  />
                </div>
                :
                <h6> This record is not available for linking </h6>
              }
              <RaisedButton
                style={{ width: '100%' }}
                labelColor={Colors.red400}
                label="Cancel"
                onClick={this.handleCloseClick}
              />
            </div>
          </div>
        </div>
      </section>

    );
  }
}

LinkRecord.propTypes = {
  dispatch: React.PropTypes.func,
  subject: React.PropTypes.object,
  selectedLabel: React.PropTypes.object,
  activeRecord: React.PropTypes.object,
  pendingLinkedRecord: React.PropTypes.object,
  selectedLinkType: React.PropTypes.number,
  linkError: React.PropTypes.string,
  availableLinkTypes: React.PropTypes.object,
};

function mapStateToProps(state) {
  return {
    subject: state.subject.activeSubject,
    selectedLabel: state.record.selectedLabel,
    activeRecord: state.record.activeRecord,
    pendingLinkedRecord: state.record.pendingLinkedRecord,
    selectedLinkType: state.record.selectedLinkType,
    linkError: state.record.linkError,
    availableLinkTypes: state.pds.availableLinkTypes,
  };
}

export default connect(mapStateToProps)(LinkRecord);
