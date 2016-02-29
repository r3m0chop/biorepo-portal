// jscs:disable requireCamelCaseOrUpperCaseIdentifiers
// jscs:disable maximumLineLength
import React from 'react';
import { connect } from 'react-redux';
import BackButton from '../BackButton';
import LoadingGif from '../LoadingGif';
import SubjectPanel from './SubjectPanel';
import RecordPanel from './RecordPanel';
import EditLabelModal from './Modals/EditLabel';
import * as ProtocolActions from '../../actions/protocol';
import * as SubjectActions from '../../actions/subject';
import * as PDSActions from '../../actions/pds';

class SubjectView extends React.Component {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    const { dispatch } = this.props;
    const protocolId = this.props.params.prot_id;
    const subjectId = this.props.params.sub_id;

    if (!this.props.subject.activeSubject) {
      dispatch(SubjectActions.fetchSubject(protocolId, subjectId));
    }

    if (!this.props.protocol.activeProtocol) {
      dispatch(ProtocolActions.fetchProtocol(protocolId));
    }

  }

  render() {
    // Checks for empty subject state and updates it if necessary
    const subject = this.props.subject.activeSubject;
    const path = this.props.location.pathname;
    return (subject ?
      <div className="subject-view">
        <BackButton/>
        <SubjectPanel subject={subject} edit={this.props.params.edit} path={path}/>
        { this.props.editLabelMode ? <EditLabelModal/> : null }
        <RecordPanel subject={subject} />
        { this.props.children }
      </div>
      :
      <LoadingGif/>
    );
  }
}

function mapStateToProps(state) {
  return {
    protocol: {
      activeProtocol: state.protocol.activeProtocol,
    },
    subject: {
      items: state.subject.items,
      activeSubject: state.subject.activeSubject,
    },
    editLabelMode: state.record.editLabelMode,
  };
}

export default connect(mapStateToProps)(SubjectView);
