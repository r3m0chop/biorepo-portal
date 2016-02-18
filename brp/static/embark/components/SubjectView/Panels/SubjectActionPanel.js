// jscs:disable requireCamelCaseOrUpperCaseIdentifiers
import React from 'react';
import { connect } from 'react-redux';
import * as SubjectActions from '../../../actions/subject';
import * as RecordActions from '../../../actions/record';

class RecordActionCard extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {

    const record = this.props.record;
    const created = new Date(record.created).toDateString();
    const modified = new Date(record.modified).toDateString();

    return (
      <div className="card card-just-text card-with-shadow">
        <div className="content">
          <p className="description record-label">{record.label_desc}</p>
          <p className="description record-time">Created</p>
          <p className="description record-time">{created}</p>
          <p className="description record-time">Modified</p>
          <p className="description record-time">{modified}</p>
        </div>
      </div>
    );
  }
}

class SubjectActionPanel extends React.Component {

  constructor(props) {
    super(props);
  }

  hideActionPanel() {
    const dispatch = this.props.dispatch;
    dispatch(SubjectActions.hideActionPanel());
    dispatch(RecordActions.setActiveRecord(null));
    dispatch(SubjectActions.setLinkMode(false));
    dispatch(RecordActions.setEditLabelMode(false));
  }

  setLinkMode() {
    const { dispatch } = this.props;
    dispatch(SubjectActions.setLinkMode());
  }

  setEditLabelMode() {
    const { dispatch } = this.props;
    dispatch(RecordActions.setEditLabelMode());
  }

  render() {
    const display = (this.props.display ? 'block' : 'none');
    const record = this.props.record.activeRecord;
    const subject = this.props.subject.activeSubject;
    var divStyle = {
      display: display,
      paddingTop: '95px',
    };

    if (record) {
      var recordUrl = '/dataentry/protocoldatasource/' +
        record.pds +
        '/subject/' +
        subject.id +
        '/record/' +
        record.id +
        '/start/';
    }

    return (
        <div style={divStyle} className="subject-action-panel">
          <i
            className="ti-close subject-action-close"
            onClick={this.hideActionPanel.bind(this)}>
          </i>
          <div className="subject-action-panel-card">
            <h6 className="category">Record</h6>
            { record ?
              <RecordActionCard record={record} /> :
              <div/>
            }
            <h6 className="category">Record Actions</h6>
            <button
              onClick={this.setEditLabelMode.bind(this)}
              className="btn btn-primary btn-sm record-action-btn"
            >
                Edit Label
            </button>
            <a href={recordUrl}>
              <button className="btn btn-primary btn-sm record-action-btn">View Record</button>
            </a>
            <button
              onClick={this.setLinkMode.bind(this)}
              className="btn btn-primary btn-sm record-action-btn"
            >
              Link Record
            </button>
          </div>
        </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    record: {
      activeRecord: state.record.activeRecord,
    },
    protocol: {
      items: state.protocol.items,
      activeProtocol: state.protocol.activeProtocol,
    },
    subject: {
      items: state.subject.items,
      activeSubject: state.subject.activeSubject,
    },
    pds: {
      items: state.pds.items,
    },
  };
}

export default connect(mapStateToProps)(SubjectActionPanel);
