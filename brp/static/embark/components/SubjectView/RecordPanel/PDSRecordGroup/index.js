// jscs:disable requireCamelCaseOrUpperCaseIdentifiers
// jscs:disable maximumLineLength
import React from 'react';
import { connect } from 'react-redux';
import SkyLight from 'react-skylight';
import FloatingActionButton from 'material-ui/lib/floating-action-button';
import RaisedButton from 'material-ui/lib/raised-button';
import ContentAdd from 'material-ui/lib/svg-icons/content/add';
import LoadingGif from '../../../LoadingGif';
import NewRecordLabelSelect from './NewRecordLabelSelect';
import * as SubjectActions from '../../../../actions/subject';
import * as RecordActions from '../../../../actions/record';
import * as PDSActions from '../../../../actions/pds';

class PDSRecordGroup extends React.Component {

  constructor(props) {
    super(props);
  }

  handleRecordClick(record, pds) {
    const dispatch = this.props.dispatch;

    if (this.props.linkMode) {
      alert('linking ' + this.props.activeRecord.id + ' with ' + record.id);
      dispatch(SubjectActions.setLinkMode());
    } else {

      dispatch(RecordActions.setActiveRecord(record));
      dispatch(PDSActions.setActivePDS(pds));
    }
  }

  handleViewRecordClick() {

  }

  handleLinkRecordClick() {
    const { dispatch } = this.props;
    dispatch(SubjectActions.setLinkMode());
  }

  handleEditRecordClick() {
    const { dispatch } = this.props;
    dispatch(RecordActions.setEditLabelMode());
  }

  componentDidMount() {
    const { dispatch } = this.props;
    if (this.props.records.length == 0) {
      dispatch(RecordActions.fetchRecords(this.props.pds, this.props.subject.id));
    }
  }

  componentWillUnmount() {
    // Make sure that record state returns to its initialState once this view unmounts
    const { dispatch } = this.props;
    dispatch(RecordActions.clearRecordState());
  }

  render() {
    var modalStyles = {
      width: '25%',
      height: '200px',
      position: 'fixed',
      top: '50%',
      left: '65%',
      marginTop: '-200px',
      marginLeft: '-25%',
      backgroundColor: '#fff',
      borderRadius: '15px',
      zIndex: 100,
      padding: '15px',
      boxShadow: '0 0 4px rgba(0,0,0,.14),0 4px 8px rgba(0,0,0,.28)',
    };
    var exRecStyle = {
      cursor: 'pointer',
      backgroundColor: '#ddecf9',
      borderTop: '1px solid #CCC5B9',
      borderBottom: '1px solid #CCC5B9',
    };
    var pinStyle = {
      color: 'coral',
    };

    const pds = this.props.pds;
    var records = this.props.record.items.filter(function (record) {
      if (pds.id == record.pds) {
        return record;
      }
    });

    var recordNodes = null;
    if (records.length != 0) {
      var recordNodes = records.map(function (record, i) {
        if (this.props.activeRecord != null && (this.props.activeRecord.id == record.id)) {
          return (
            <tr key={i} onClick={this.handleRecordClick.bind(this, record, this.props.pds)} style={exRecStyle} >
              <td>{record.label_desc}</td>
              <td>{record.created}</td>
              <td>{record.modified}</td>
              <td className="row-action" onClick={this.handleEditRecordClick.bind(this)}>Label</td>
              <td className="row-action" onClick={this.handleLinkRecordClick.bind(this)}>Link</td>
              <td className="row-action">View</td>
            </tr>
          );
        } else {
          return <tr key={i} onClick={this.handleRecordClick.bind(this, record, this.props.pds)} className="ExternalRecord" ><td>{record.label_desc}</td><td>{record.created}</td><td>{record.modified}</td></tr>;
        }
      }, this);
    };

    var addButtonStyle = {
      marginLeft: '10px',
      marginTop: '10px',
      float: 'right',
    };

    return (
      <div>
        <SkyLight ref="addRecordModal" dialogStyles={modalStyles}>
          <NewRecordLabelSelect pds={this.props.pds}/>
        </SkyLight>
        <h6 className="category">{this.props.pds.display_label}
          <FloatingActionButton
            onClick={() => this.refs.addRecordModal.show()}
            backgroundColor={'#7AC29A'}
            mini={true}
            style={addButtonStyle}
          >
            <ContentAdd/>
          </FloatingActionButton>
        </h6>
        <div className="PDSRecords">
          { recordNodes ?
            <table className="table table-striped">
              <thead>
                <tr><th>Record</th><th>Created</th><th>Modified</th></tr>
              </thead>
              <tbody>
                { recordNodes }
              </tbody>
            </table> : this.props.record.isFetching ? <LoadingGif /> : <div>No Records</div>
          }
        </div>
      </div>
    );
  }
}

PDSRecordGroup.contextTypes = {
  history: React.PropTypes.object,
};

function mapStateToProps(state) {
  return {
    protocol: {
      items: state.protocol.items,
      activeProtocol: state.protocol.activeProtocol,
    },
    record: {
      items: state.record.items,
      isFetching: state.record.isFetching,
    },
    subject: state.subject.activeSubject,
    activeRecord: state.record.activeRecord,
    linkMode: state.subject.linkMode,
    selectedLabel: state.record.selectedLabel,
  };
}

export default connect(mapStateToProps)(PDSRecordGroup);
